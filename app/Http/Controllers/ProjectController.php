<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\DocumentAttachment;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function index()
    {
        return Inertia::render('Projects/Index', [
            'projects' => Project::query()
                ->with('client')
                ->withCount('documents')
                ->latest()
                ->paginate(15),
            'clients' => Client::query()
                ->orderBy('name')
                ->get(['id', 'name', 'cui']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => ['nullable', 'integer', 'exists:clients,id'],
            'client_name' => ['required_without:client_id', 'nullable', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
        ]);

        $client = $this->resolveClient($validated);

        $project = Project::create([
            'client_id' => $client->id,
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'created_by' => $request->user()->id,
        ]);

        return redirect()->route('projects.show', $project)
            ->with('success', 'Proiectul a fost creat. Poți încărca documentele lui acum.');
    }

    public function show(Project $project)
    {
        $project->load(['client', 'documents']);

        return Inertia::render('Projects/Show', [
            'project' => $project,
        ]);
    }

    public function storeDocument(Request $request, Project $project)
    {
        $validated = $request->validate([
            'documents' => ['required', 'array', 'min:1'],
            'documents.*' => ['required', 'file', 'mimes:pdf,doc,docx', 'max:20480'],
        ], [
            'documents.*.mimes' => 'Sunt acceptate doar fișiere PDF sau Word (.doc, .docx).',
        ]);

        foreach ($validated['documents'] as $document) {
            $project->documents()->create([
                'original_name' => $document->getClientOriginalName(),
                'path' => $document->store('project-documents/' . $project->id, 'public'),
                'mime_type' => $document->getClientMimeType(),
                'size' => $document->getSize(),
                'uploaded_by' => $request->user()->id,
            ]);
        }

        return back()->with('success', 'Documentele proiectului au fost încărcate.');
    }

    public function downloadDocument(Project $project, DocumentAttachment $document)
    {
        $this->ensureProjectDocument($project, $document);
        abort_unless(Storage::disk('public')->exists($document->path), 404, 'Fișierul nu mai există.');

        return Storage::disk('public')->download($document->path, $document->original_name);
    }

    public function destroyDocument(Project $project, DocumentAttachment $document)
    {
        $this->ensureProjectDocument($project, $document);
        Storage::disk('public')->delete($document->path);
        $document->delete();

        return back()->with('success', 'Documentul proiectului a fost șters.');
    }

    private function resolveClient(array $validated): Client
    {
        if (!empty($validated['client_id'])) {
            return Client::findOrFail($validated['client_id']);
        }

        $name = trim((string) ($validated['client_name'] ?? ''));

        return Client::firstOrCreate(
            ['name' => $name],
            ['type' => 'firma']
        );
    }

    private function ensureProjectDocument(Project $project, DocumentAttachment $document): void
    {
        abort_unless(
            $document->attachable_type === Project::class
                && (int) $document->attachable_id === (int) $project->id,
            404
        );
    }
}
