<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\ClientRevision;
use Illuminate\Http\Request;
use Inertia\Inertia;

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

        ClientRevision::updateOrCreate(
            ['client_id' => $client->id, 'type' => $data['type']],
            [
                'period' => $data['period'],
                'last_revision_date' => $lastDate,
                'next_revision_date' => $lastDate ? ClientRevision::nextDateFor($data['period'], $lastDate) : null,
                'reminder_sent_for' => null,
            ],
        );

        return back()->with('success', 'Revizia a fost salvată; următorul termen a fost calculat automat.');
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

        return back()->with('success', 'Revizia a fost actualizată.');
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
}
