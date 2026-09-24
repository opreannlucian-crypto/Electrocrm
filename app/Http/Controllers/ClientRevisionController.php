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
        $filters = $request->validate([
            'client' => ['nullable', 'string', 'max:120'],
            'type' => ['nullable', 'in:efractie,incendiu'],
            'period' => ['nullable', 'in:trimestriala,semestriala,anuala,la_cerere'],
            'status' => ['nullable', 'in:overdue,due_soon,scheduled,on_request'],
        ]);
        $today = now()->startOfDay();
        $soon = $today->copy()->addDays(30);

        return Inertia::render('Revisions/Index', [
            'revisions' => ClientRevision::query()
                ->with('client')
                ->when($filters['client'] ?? null, fn ($query, $client) => $query->whereHas('client', fn ($clients) => $clients->where('name', 'like', '%' . $client . '%')))
                ->when($filters['type'] ?? null, fn ($query, $type) => $query->where('type', $type))
                ->when($filters['period'] ?? null, fn ($query, $period) => $query->where('period', $period))
                ->when(($filters['status'] ?? null) === 'overdue', fn ($query) => $query->whereDate('next_revision_date', '<', $today->toDateString()))
                ->when(($filters['status'] ?? null) === 'due_soon', fn ($query) => $query->whereDate('next_revision_date', '>=', $today->toDateString())->whereDate('next_revision_date', '<=', $soon->toDateString()))
                ->when(($filters['status'] ?? null) === 'scheduled', fn ($query) => $query->whereDate('next_revision_date', '>', $soon->toDateString()))
                ->when(($filters['status'] ?? null) === 'on_request', fn ($query) => $query->whereNull('next_revision_date'))
                ->orderByRaw('next_revision_date is null, next_revision_date')
                ->paginate(30)
                ->withQueryString(),
            'clients' => Client::query()->orderBy('name')->get(['id', 'name', 'cui']),
            'filters' => $filters,
            'today' => $today->toDateString(),
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
