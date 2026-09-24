<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\ClientRevision;
use App\Exports\ClientRevisionExport;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class ClientRevisionController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->string('type')->toString();
        abort_unless(in_array($type, ['', ClientRevision::TYPE_BURGLARY, ClientRevision::TYPE_FIRE], true), 404);

        return Inertia::render('Revisions/Index', [
            'revisions' => ClientRevision::query()
                ->with('client')
                ->when($type, fn ($query) => $query->where('type', $type))
                ->orderByRaw('next_revision_date is null, next_revision_date')
                ->paginate(30)
                ->withQueryString(),
            'clients' => Client::query()->orderBy('name')->get(['id', 'name', 'cui']),
            'filters' => ['type' => $type],
            'today' => now()->toDateString(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $client = $this->resolveClient($data);
        $lastDate = $data['last_revision_date'] ?? null;

        $revision = ClientRevision::updateOrCreate(
            ['client_id' => $client->id, 'type' => $data['type']],
            [
                'period' => $data['period'],
                'last_revision_date' => $lastDate,
                'next_revision_date' => $lastDate ? ClientRevision::nextDateFor($data['period'], $lastDate) : null,
                'reminder_sent_for' => null,
            ],
        );
        $revision->syncScheduledWorkOrder();

        return back()->with('success', 'Revizia a fost salvată și lucrarea a fost programată automat la următorul termen.');
    }

    public function update(Request $request, ClientRevision $revision)
    {
        $data = $this->validated($request);
        $client = $this->resolveClient($data);
        $lastDate = $data['last_revision_date'] ?? null;

        $revision->update([
            'client_id' => $client->id,
            'type' => $data['type'],
            'period' => $data['period'],
            'last_revision_date' => $lastDate,
            'next_revision_date' => $lastDate ? ClientRevision::nextDateFor($data['period'], $lastDate) : null,
            'reminder_sent_for' => null,
        ]);
        $revision->syncScheduledWorkOrder();

        return back()->with('success', 'Revizia și lucrarea ei programată au fost actualizate.');
    }

    public function excel(Request $request): Response
    {
        $revisions = $this->selectedRevisions($request);
        $path = ClientRevisionExport::generate($revisions);

        return response()->download($path, basename($path), [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ])->deleteFileAfterSend(true);
    }

    public function pdf(Request $request): Response
    {
        $revisions = $this->selectedRevisions($request);

        return Pdf::loadView('revisions.selected-pdf', compact('revisions'))
            ->setPaper('a4', 'landscape')
            ->download('raport_revizii_selectate_' . now()->format('Ymd_His') . '.pdf');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'client_id' => ['nullable', 'integer', 'exists:clients,id'],
            'client_name' => ['required_without:client_id', 'nullable', 'string', 'max:255'],
            'type' => ['required', 'in:efractie,incendiu'],
            'period' => ['required', 'in:trimestriala,semestriala,anuala,la_cerere'],
            'last_revision_date' => ['nullable', 'date'],
        ]);
    }

    private function resolveClient(array $data): Client
    {
        if (!empty($data['client_id'])) {
            return Client::findOrFail($data['client_id']);
        }

        return Client::firstOrCreate(
            ['name' => trim((string) $data['client_name'])],
            ['type' => 'firma'],
        );
    }

    /** @return \Illuminate\Support\Collection<int, ClientRevision> */
    private function selectedRevisions(Request $request)
    {
        $validated = $request->validate([
            'revision_ids' => ['required', 'array', 'min:1'],
            'revision_ids.*' => ['required', 'integer', 'distinct', 'exists:client_revisions,id'],
        ]);

        return ClientRevision::query()
            ->with('client')
            ->whereIn('id', $validated['revision_ids'])
            ->orderByRaw('next_revision_date is null, next_revision_date')
            ->get();
    }
}
