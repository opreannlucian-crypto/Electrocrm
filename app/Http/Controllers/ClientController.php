<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ClientController extends Controller
{
    /**
     * Lista clienti
     */
    public function index()
    {
        return Inertia::render('Clients/Index', [
            'clients' => Client::latest()->get(),
        ]);
    }

    /**
     * Formular client nou
     */
    public function create()
    {
        return Inertia::render('Clients/Create');
    }

    /**
     * Verifica CUI in ANAF.
     */
    public function verifyCui(Request $request)
    {
        $validated = $request->validate([
            'cui' => [
                'required',
                'string',
                'max:50',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | NORMALIZARE CUI
        |--------------------------------------------------------------------------
        */

        $cui = strtoupper(
            trim(
                $validated['cui']
            )
        );

        $cui = preg_replace(
            '/\s+/',
            '',
            $cui
        );

        /*
        |--------------------------------------------------------------------------
        | ELIMINAM PREFIXUL RO
        |--------------------------------------------------------------------------
        */

        $cuiNumeric = preg_replace(
            '/^RO/',
            '',
            $cui
        );

        /*
        |--------------------------------------------------------------------------
        | PASTRAM DOAR CIFRE
        |--------------------------------------------------------------------------
        */

        $cuiNumeric = preg_replace(
            '/[^0-9]/',
            '',
            $cuiNumeric
        );

        /*
        |--------------------------------------------------------------------------
        | VALIDARE MINIMA
        |--------------------------------------------------------------------------
        */

        if (
            empty($cuiNumeric) ||
            strlen($cuiNumeric) < 2 ||
            strlen($cuiNumeric) > 10
        ) {
            return response()->json([
                'success' => false,

                'message' =>
                    'Introdu un CUI valid.',
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | ANAF
        |--------------------------------------------------------------------------
        */

        $anafUrl =
            'https://webservicesp.anaf.ro/api/PlatitorTvaRest/v9/tva';

        try {

            $response = Http::timeout(20)
                ->acceptJson()
                ->asJson()
                ->post(
                    $anafUrl,
                    [
                        [
                            'cui' =>
                                (int) $cuiNumeric,

                            'data' =>
                                now()->format('Y-m-d'),
                        ],
                    ]
                );

        } catch (\Throwable $exception) {

            report($exception);

            return response()->json([
                'success' => false,

                'message' =>
                    'Nu am putut comunica cu serviciul ANAF. Verifica conexiunea si incearca din nou.',
            ], 503);
        }

        /*
        |--------------------------------------------------------------------------
        | VERIFICARE HTTP
        |--------------------------------------------------------------------------
        */

        if (!$response->successful()) {

            $anafBody =
                $response->json();

            $anafMessage =
                is_array($anafBody)
                    ? (
                        $anafBody['message']
                        ?? $anafBody['error']
                        ?? null
                    )
                    : null;

            return response()->json([
                'success' => false,

                'message' =>
                    'Serviciul ANAF a returnat eroarea HTTP ' .
                    $response->status() .
                    (
                        $anafMessage
                            ? '. ' . $anafMessage
                            : '.'
                    ),
            ], 502);
        }

        /*
        |--------------------------------------------------------------------------
        | RASPUNS JSON
        |--------------------------------------------------------------------------
        */

        $payload =
            $response->json();

        if (
            !is_array($payload)
        ) {

            return response()->json([
                'success' => false,

                'message' =>
                    'Raspunsul primit de la ANAF nu este valid.',
            ], 502);
        }

        /*
        |--------------------------------------------------------------------------
        | FIRMA GASITA
        |--------------------------------------------------------------------------
        */

        $found =
            $payload['found']
            ?? [];

        if (
            !is_array($found) ||
            count($found) === 0
        ) {

            return response()->json([
                'success' => false,

                'message' =>
                    'Nu am gasit o firma pentru CUI-ul introdus in ANAF.',
            ], 404);
        }

        $company =
            $found[0]
            ?? null;

        if (
            !is_array($company)
        ) {

            return response()->json([
                'success' => false,

                'message' =>
                    'ANAF nu a returnat datele firmei.',
            ], 404);
        }

        /*
        |--------------------------------------------------------------------------
        | DATE GENERALE
        |--------------------------------------------------------------------------
        */

        $generalData =
            $company['date_generale']
            ?? [];

        if (
            !is_array($generalData)
        ) {
            $generalData = [];
        }

        /*
        |--------------------------------------------------------------------------
        | STATUT TVA
        |--------------------------------------------------------------------------
        |
        | IMPORTANT:
        |
        | ANAF returneaza:
        |
        | "inregistrare_scop_Tva": {
        |     "scpTVA": true
        | }
        |
        | NU:
        |
        | "inregistrare_scop_Tva": [
        |     ...
        | ]
        |
        |--------------------------------------------------------------------------
        */

        $vatRegistration =
            $company['inregistrare_scop_Tva']
            ?? [];

        $isVatRegistered = false;

        if (
            is_array($vatRegistration)
        ) {

            /*
            |--------------------------------------------------------------------------
            | Forma normala ANAF:
            | scpTVA = true / false
            |--------------------------------------------------------------------------
            */

            $vatFlag =
                $vatRegistration['scpTVA']
                ?? null;

            if (
                $vatFlag === true ||
                $vatFlag === 1 ||
                $vatFlag === '1'
            ) {

                $isVatRegistered = true;

            } else {

                $vatFlagText =
                    strtolower(
                        trim(
                            (string) $vatFlag
                        )
                    );

                if (
                    in_array(
                        $vatFlagText,
                        [
                            'true',
                            'da',
                            'yes',
                        ],
                        true
                    )
                ) {
                    $isVatRegistered = true;
                }
            }
        }


        /*
        |--------------------------------------------------------------------------
        | STATUT INTERN ELECTROCRM
        |--------------------------------------------------------------------------
        */

        $vatStatus =
            $isVatRegistered
                ? 'platitor_tva'
                : 'neplatitor_tva';


        /*
        |--------------------------------------------------------------------------
        | DATE FIRMA
        |--------------------------------------------------------------------------
        */

        $name =
            $generalData['denumire']
            ?? null;

        $anafCui =
            $generalData['cui']
            ?? $cuiNumeric;

        $address =
            $generalData['adresa']
            ?? null;

        $city =
            $generalData['localitate']
            ?? null;

        $phone =
            $generalData['telefon']
            ?? null;


        /*
        |--------------------------------------------------------------------------
        | CUI AFISAT
        |--------------------------------------------------------------------------
        */

        $displayCui =
            $isVatRegistered
                ? 'RO' . $anafCui
                : (string) $anafCui;


        /*
        |--------------------------------------------------------------------------
        | RASPUNS CATRE FRONTEND
        |--------------------------------------------------------------------------
        */

        return response()->json([
            'success' => true,

            'message' =>
                $isVatRegistered
                    ? 'Firma a fost verificata in ANAF si este platitoare de TVA.'
                    : 'Firma a fost verificata in ANAF si este neplatitoare de TVA.',

            'client' => [
                'name' =>
                    $name,

                'cui' =>
                    $displayCui,

                'anaf_name' =>
                    $name,

                'address' =>
                    $address,

                'city' =>
                    $city,

                'phone' =>
                    $phone,

                'tva_status' =>
                    $vatStatus,

                'vat_registered' =>
                    $isVatRegistered,

                'anaf_checked_at' =>
                    now()->toDateTimeString(),
            ],
        ]);
    }

    /**
     * Salveaza client
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' =>
                'required|string',

            'name' =>
                'required|string|max:255',

            'cui' =>
                'nullable|string|max:50',

            'tva_status' => [
                'nullable',
                'string',
                'in:platitor_tva,neplatitor_tva',
            ],

            'anaf_name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'anaf_checked_at' => [
                'nullable',
                'date',
            ],

            'contact_person' =>
                'nullable|string|max:255',

            'phone' =>
                'nullable|string|max:50',

            'email' =>
                'nullable|email',

            'address' =>
                'nullable|string',

            'city' =>
                'nullable|string|max:100',

            'notes' =>
                'nullable|string',
        ]);

        $client = Client::create($validated);

        if ($request->user()?->isTechnician()) {
            return redirect()
                ->route('work_orders.create', [
                    'client_id' => $client->id,
                ])
                ->with('success', 'Clientul a fost creat. Poți continua cu lucrarea nouă.');
        }

        return redirect()->route('clients.index');
    }

    /**
     * Vizualizare client
     */
    public function show(Client $client)
    {
        $client->load([
            'documents',
            'quotes' => function ($query) {
                $query->latest('created_at');
            },

            'workOrders' => function ($query) {
                $query->latest('created_at');
            },
        ]);

        $history = collect();

        /*
        |--------------------------------------------------------------------------
        | LUCRARI
        |--------------------------------------------------------------------------
        */

        foreach (
            $client->workOrders
            as $workOrder
        ) {

            $history->push([
                'id' =>
                    $workOrder->id,

                'type' =>
                    'work_order',

                'type_label' =>
                    'Lucrare',

                'number' =>
                    $workOrder->number
                    ?? '-',

                'title' =>
                    $workOrder->type
                    ?? 'Lucrare',

                'status' =>
                    $workOrder->status
                    ?? null,

                'date' =>
                    $workOrder->created_at,

                'scheduled_date' =>
                    $workOrder->scheduled_date,

                'scheduled_time' =>
                    $workOrder->scheduled_time,

                'url' =>
                    route(
                        'work_orders.show',
                        $workOrder->id
                    ),
            ]);


            /*
            |--------------------------------------------------------------------------
            | PROCES-VERBAL
            |--------------------------------------------------------------------------
            */

            $history->push([
                'id' =>
                    'report-' .
                    $workOrder->id,

                'source_id' =>
                    $workOrder->id,

                'type' =>
                    'report',

                'type_label' =>
                    'Proces-verbal',

                'number' =>
                    'PV-' .
                    (
                        $workOrder->number
                        ?? $workOrder->id
                    ),

                'title' =>
                    'Proces-verbal de interventie',

                'status' =>
                    $workOrder->status
                    ?? null,

                'date' =>
                    $workOrder->created_at,

                'scheduled_date' =>
                    $workOrder->scheduled_date,

                'scheduled_time' =>
                    $workOrder->scheduled_time,

                'url' =>
                    route(
                        'work_orders.report',
                        [
                            'workOrder' =>
                                $workOrder->id,

                            'type' =>
                                'interventie',
                        ]
                    ),
            ]);
        }


        /*
        |--------------------------------------------------------------------------
        | DEVIZE / OFERTE
        |--------------------------------------------------------------------------
        */

        foreach (
            $client->quotes
            as $quote
        ) {

            $history->push([
                'id' =>
                    $quote->id,

                'type' =>
                    $quote->type === 'deviz'
                        ? 'quote'
                        : 'offer',

                'type_label' =>
                    $quote->type === 'deviz'
                        ? 'Deviz'
                        : 'Oferta',

                'number' =>
                    $quote->number
                    ?? '-',

                'title' =>
                    $quote->title
                    ?? 'Fara titlu',

                'status' =>
                    $quote->status
                    ?? null,

                'date' =>
                    $quote->created_at,

                'quote_date' =>
                    $quote->date,

                'url' =>
                    route(
                        'quotes.show',
                        $quote->id
                    ),
            ]);
        }


        /*
        |--------------------------------------------------------------------------
        | ORDINE
        |--------------------------------------------------------------------------
        */

        $history =
            $history
                ->sortByDesc(
                    function ($item) {

                        if (
                            !$item['date']
                        ) {
                            return 0;
                        }

                        return
                            $item['date']->timestamp;
                    }
                )
                ->values();

        return Inertia::render(
            'Clients/Show',
            [
                'client' =>
                    $client,

                'history' =>
                    $history,
            ]
        );
    }

    /**
     * Formular editare client
     */
    public function edit(Client $client)
    {
        return Inertia::render(
            'Clients/Edit',
            [
                'client' =>
                    $client,
            ]
        );
    }

    /**
     * Actualizare client
     */
    public function update(
        Request $request,
        Client $client
    ) {
        $validated = $request->validate([
            'type' =>
                'required|string',

            'name' =>
                'required|string|max:255',

            'cui' =>
                'nullable|string|max:50',

            'tva_status' => [
                'nullable',
                'string',
                'in:platitor_tva,neplatitor_tva',
            ],

            'anaf_name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'anaf_checked_at' => [
                'nullable',
                'date',
            ],

            'contact_person' =>
                'nullable|string|max:255',

            'phone' =>
                'nullable|string|max:50',

            'email' =>
                'nullable|email',

            'address' =>
                'nullable|string',

            'city' =>
                'nullable|string|max:100',

            'notes' =>
                'nullable|string',
        ]);

        $client->update(
            $validated
        );

        return redirect()
            ->route(
                'clients.index'
            );
    }

    /**
     * Stergere client
     */
    public function destroy(
        Client $client
    ) {
        $client->delete();

        return redirect()
            ->route(
                'clients.index'
            );
    }

    public function storeDocument(Request $request, Client $client)
    {
        $validated = $request->validate(['documents' => ['required', 'array', 'min:1'], 'documents.*' => ['required', 'file', 'max:20480']]);

        foreach ($validated['documents'] as $document) {
            $client->documents()->create([
                'original_name' => $document->getClientOriginalName(),
                'path' => $document->store('client-documents/' . $client->id, 'public'),
                'mime_type' => $document->getClientMimeType(),
                'size' => $document->getSize(),
                'uploaded_by' => $request->user()->id,
            ]);
        }

        return back()->with('success', 'Documentele au fost încărcate.');
    }

    public function downloadDocument(Client $client, \App\Models\DocumentAttachment $document)
    {
        abort_unless($document->attachable_type === Client::class && (int) $document->attachable_id === (int) $client->id, 404);
        abort_unless(Storage::disk('public')->exists($document->path), 404, 'Fișierul nu mai există.');

        return Storage::disk('public')->download($document->path, $document->original_name);
    }

    public function destroyDocument(Client $client, \App\Models\DocumentAttachment $document)
    {
        abort_unless($document->attachable_type === Client::class && (int) $document->attachable_id === (int) $client->id, 404);
        Storage::disk('public')->delete($document->path);
        $document->delete();

        return back()->with('success', 'Documentul a fost șters.');
    }
}
