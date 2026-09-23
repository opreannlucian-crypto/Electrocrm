<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Contract;
use App\Models\ContractTemplate;
use App\Models\License;
use App\Models\Quote;
use App\Models\WorkOrder;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ContractController extends Controller
{
    /**
     * Lista contractelor.
     */
    public function index()
    {
        $contracts =
            Contract::with([
                'client',
                'workOrder',
                'quote',
                'license',
                'template',
            ])
                ->latest()
                ->paginate(15);

        return Inertia::render(
            'Contracts/Index',
            [
                'contracts' =>
                    $contracts,
            ]
        );
    }

    /**
     * Formular creare contract liber.
     */
    public function create()
    {
        return Inertia::render(
            'Contracts/Create',
            [
                'clients' =>
                    Client::orderBy(
                        'name'
                    )->get(),

                'workOrders' =>
                    WorkOrder::with([
                        'client',
                        'license',
                    ])
                        ->latest()
                        ->get(),

                'quotes' =>
                    Quote::with([
                        'client',
                        'license',
                    ])
                        ->latest()
                        ->get(),

                'licenses' =>
                    License::where(
                        'active',
                        true
                    )
                        ->orderBy(
                            'sort_order'
                        )
                        ->orderBy(
                            'name'
                        )
                        ->get([
                            'id',
                            'name',
                            'code',
                            'description',
                            'image_path',
                            'active',
                            'sort_order',
                        ]),

                'templates' =>
                    ContractTemplate::where(
                        'active',
                        true
                    )
                        ->orderBy(
                            'sort_order'
                        )
                        ->orderBy(
                            'name'
                        )
                        ->get(),
            ]
        );
    }

    /**
     * Formular creare contract din sablon.
     */
    public function createFromTemplate(
        ContractTemplate $contractTemplate
    ) {
        $contractTemplate->load([
            'user',
        ]);

        return Inertia::render(
            'Contracts/Create',
            [
                'clients' =>
                    Client::orderBy(
                        'name'
                    )->get(),

                'workOrders' =>
                    WorkOrder::with([
                        'client',
                        'license',
                    ])
                        ->latest()
                        ->get(),

                'quotes' =>
                    Quote::with([
                        'client',
                        'license',
                    ])
                        ->latest()
                        ->get(),

                'licenses' =>
                    License::where(
                        'active',
                        true
                    )
                        ->orderBy(
                            'sort_order'
                        )
                        ->orderBy(
                            'name'
                        )
                        ->get([
                            'id',
                            'name',
                            'code',
                            'description',
                            'image_path',
                            'active',
                            'sort_order',
                        ]),

                'templates' =>
                    ContractTemplate::where(
                        'active',
                        true
                    )
                        ->orderBy(
                            'sort_order'
                        )
                        ->orderBy(
                            'name'
                        )
                        ->get(),

                'template' =>
                    $contractTemplate,
            ]
        );
    }

    /**
     * Salveaza contract.
     */
    public function store(
        Request $request
    ) {
        $validated =
            $this->validateContract(
                $request
            );

        /*
        |--------------------------------------------------------------------------
        | Numar contract automat
        |--------------------------------------------------------------------------
        */

        if (
            empty(
                $validated['number']
            )
        ) {
            $validated['number'] =
                'CTR-' .
                now()->format(
                    'YmdHis'
                );
        }

        /*
        |--------------------------------------------------------------------------
        | Daca exista sablon, completam automat datele de baza.
        |--------------------------------------------------------------------------
        */

        $template = null;

        if (
            !empty(
                $validated['template_id']
            )
        ) {
            $template =
                ContractTemplate::find(
                    $validated['template_id']
                );

            if ($template) {

                if (
                    empty(
                        $validated['title']
                    )
                    &&
                    !empty(
                        $template->title
                    )
                ) {
                    $validated['title'] =
                        $template->title;
                }

                if (
                    empty(
                        $validated['content']
                    )
                    &&
                    !empty(
                        $template->content
                    )
                ) {
                    $validated['content'] =
                        $template->content;
                }

                if (
                    empty(
                        $validated['duration']
                    )
                    &&
                    !empty(
                        $template->default_duration
                    )
                ) {
                    $validated['duration'] =
                        $template->default_duration;
                }

                if (
                    empty(
                        $validated['payment_terms']
                    )
                    &&
                    !empty(
                        $template->default_payment_terms
                    )
                ) {
                    $validated['payment_terms'] =
                        $template->default_payment_terms;
                }

                if (
                    empty(
                        $validated['observations']
                    )
                    &&
                    !empty(
                        $template->default_notes
                    )
                ) {
                    $validated['observations'] =
                        $template->default_notes;
                }

                if (
                    empty(
                        $validated[
                            'provider_signature_name'
                        ]
                    )
                    &&
                    !empty(
                        $template
                            ->provider_signature_name
                    )
                ) {
                    $validated[
                        'provider_signature_name'
                    ] =
                        $template
                            ->provider_signature_name;
                }

                if (
                    empty(
                        $validated[
                            'provider_signature_position'
                        ]
                    )
                    &&
                    !empty(
                        $template
                            ->provider_signature_position
                    )
                ) {
                    $validated[
                        'provider_signature_position'
                    ] =
                        $template
                            ->provider_signature_position;
                }

                if (
                    empty(
                        $validated[
                            'client_signature_name'
                        ]
                    )
                    &&
                    !empty(
                        $template
                            ->client_signature_name
                    )
                ) {
                    $validated[
                        'client_signature_name'
                    ] =
                        $template
                            ->client_signature_name;
                }

                if (
                    empty(
                        $validated[
                            'client_signature_position'
                        ]
                    )
                    &&
                    !empty(
                        $template
                            ->client_signature_position
                    )
                ) {
                    $validated[
                        'client_signature_position'
                    ] =
                        $template
                            ->client_signature_position;
                }

                if (
                    empty(
                        $validated['value']
                    )
                    &&
                    !empty(
                        $template->default_value
                    )
                ) {
                    $validated['value'] =
                        $template->default_value;
                }
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Lucrare
        |--------------------------------------------------------------------------
        */

        if (
            !empty(
                $validated['work_order_id']
            )
        ) {
            $workOrder =
                WorkOrder::with([
                    'client',
                    'license',
                ])->find(
                    $validated[
                        'work_order_id'
                    ]
                );

            if ($workOrder) {

                if (
                    empty(
                        $validated['client_id']
                    )
                ) {
                    $validated['client_id'] =
                        $workOrder->client_id;
                }

                if (
                    empty(
                        $validated['location']
                    )
                ) {
                    $validated['location'] =
                        $workOrder->address;
                }

                if (
                    empty(
                        $validated['license_id']
                    )
                ) {
                    $validated['license_id'] =
                        $workOrder->license_id;
                }
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Oferta / deviz
        |--------------------------------------------------------------------------
        */

        if (
            !empty(
                $validated['quote_id']
            )
        ) {
            $quote =
                Quote::with([
                    'client',
                    'license',
                ])->find(
                    $validated['quote_id']
                );

            if ($quote) {

                if (
                    empty(
                        $validated['client_id']
                    )
                ) {
                    $validated['client_id'] =
                        $quote->client_id;
                }

                if (
                    empty(
                        $validated['title']
                    )
                ) {
                    $validated['title'] =
                        $quote->title;
                }

                if (
                    empty(
                        $validated['license_id']
                    )
                ) {
                    $validated['license_id'] =
                        $quote->license_id;
                }
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Licenta
        |--------------------------------------------------------------------------
        */

        if (
            !empty(
                $validated['license_id']
            )
        ) {
            $license =
                License::find(
                    $validated['license_id']
                );

            if ($license) {
                $validated['license_name'] =
                    $license->name;

                $validated[
                    'license_description'
                ] =
                    $license->description;
            }
        }

        $this->resolveClient($validated);
        unset($validated['client_name']);

        $validated['user_id'] =
            auth()->id();

        $contract =
            DB::transaction(
                function () use (
                    $validated
                ) {
                    return Contract::create(
                        $validated
                    );
                }
            );

        return redirect()
            ->route(
                'contracts.show',
                $contract
            )
            ->with(
                'success',
                'Contractul a fost creat cu succes.'
            );
    }

    /**
     * Afiseaza contractul.
     */
    public function show(
        Contract $contract
    ) {
        $contract->load([
            'client',
            'workOrder.client',
            'workOrder.license',
            'quote.client',
            'quote.license',
            'license',
            'template',
            'user',
        ]);

        return Inertia::render(
            'Contracts/Show',
            [
                'contract' =>
                    $contract,
            ]
        );
    }

    /**
     * Formular editare contract.
     */
    public function edit(
        Contract $contract
    ) {
        $contract->load([
            'client',
            'workOrder.client',
            'workOrder.license',
            'quote.client',
            'quote.license',
            'license',
            'template',
        ]);

        return Inertia::render(
            'Contracts/Edit',
            [
                'contract' =>
                    $contract,

                'clients' =>
                    Client::orderBy(
                        'name'
                    )->get(),

                'workOrders' =>
                    WorkOrder::with([
                        'client',
                        'license',
                    ])
                        ->latest()
                        ->get(),

                'quotes' =>
                    Quote::with([
                        'client',
                        'license',
                    ])
                        ->latest()
                        ->get(),

                'licenses' =>
                    License::where(
                        'active',
                        true
                    )
                        ->orderBy(
                            'sort_order'
                        )
                        ->orderBy(
                            'name'
                        )
                        ->get([
                            'id',
                            'name',
                            'code',
                            'description',
                            'image_path',
                            'active',
                            'sort_order',
                        ]),

                'templates' =>
                    ContractTemplate::where(
                        'active',
                        true
                    )
                        ->orderBy(
                            'sort_order'
                        )
                        ->orderBy(
                            'name'
                        )
                        ->get(),
            ]
        );
    }

    /**
     * Actualizeaza contract.
     */
    public function update(
        Request $request,
        Contract $contract
    ) {
        $validated =
            $this->validateContract(
                $request
            );

        if (
            empty(
                $validated['number']
            )
        ) {
            $validated['number'] =
                $contract->number
                ?:
                'CTR-' .
                now()->format(
                    'YmdHis'
                );
        }

        if (
            !empty(
                $validated['license_id']
            )
        ) {
            $license =
                License::find(
                    $validated['license_id']
                );

            if ($license) {
                $validated['license_name'] =
                    $license->name;

                $validated[
                    'license_description'
                ] =
                    $license->description;
            }
        } else {
            $validated['license_name'] =
                null;

            $validated[
                'license_description'
            ] =
                null;
        }

        $this->resolveClient($validated);
        unset($validated['client_name']);

        $contract->update(
            $validated
        );

        return redirect()
            ->route(
                'contracts.show',
                $contract
            )
            ->with(
                'success',
                'Contractul a fost actualizat cu succes.'
            );
    }

    /**
     * PDF contract.
     */
    public function pdf(
        Contract $contract
    ) {
        $contract->load([
            'client',
            'workOrder.client',
            'workOrder.license',
            'quote.client',
            'quote.license',
            'license',
            'template',
            'user',
        ]);

        $pdf =
            Pdf::loadView(
                'contracts.pdf',
                [
                    'contract' =>
                        $contract,
                ]
            );

        $pdf->setPaper(
            'a4',
            'portrait'
        );

        return $pdf->stream(
            $contract->number .
            '.pdf'
        );
    }

    /**
     * Stergere contract.
     */
    public function destroy(
        Contract $contract
    ) {
        $contract->delete();

        return redirect()
            ->route(
                'contracts.index'
            )
            ->with(
                'success',
                'Contractul a fost sters.'
            );
    }

    /**
     * Creeaza un contract dintr-un sablon.
     *
     * Contractul este o copie independenta.
     */
    public function duplicateFromTemplate(
        ContractTemplate $contractTemplate
    ) {
        $contractTemplate->load([]);

        $contract =
            Contract::create([
                'number' =>
                    'CTR-' .
                    now()->format(
                        'YmdHis'
                    ),

                'title' =>
                    $contractTemplate->title
                    ?:
                    $contractTemplate->name,

                'contract_date' =>
                    now()->toDateString(),

                'type' =>
                    $contractTemplate->type,

                'status' =>
                    'draft',

                'value' =>
                    $contractTemplate->default_value,

                'currency' =>
                    'RON',

                'duration' =>
                    $contractTemplate->default_duration,

                'payment_terms' =>
                    $contractTemplate
                        ->default_payment_terms,

                'content' =>
                    $contractTemplate->content,

                'observations' =>
                    $contractTemplate->default_notes,

                'provider_signature_name' =>
                    $contractTemplate
                        ->provider_signature_name,

                'provider_signature_position' =>
                    $contractTemplate
                        ->provider_signature_position,

                'client_signature_name' =>
                    $contractTemplate
                        ->client_signature_name,

                'client_signature_position' =>
                    $contractTemplate
                        ->client_signature_position,

                'template_id' =>
                    $contractTemplate->id,

                'user_id' =>
                    auth()->id(),
            ]);

        return redirect()
            ->route(
                'contracts.edit',
                $contract
            )
            ->with(
                'success',
                'Contractul a fost creat din sablon si poate fi editat.'
            );
    }

    private function resolveClient(array &$validated): void
    {
        if (!empty($validated['client_id'])) {
            return;
        }

        $name = trim((string) ($validated['client_name'] ?? ''));
        if ($name === '') {
            return;
        }

        $client = Client::query()->whereRaw('LOWER(name) = ?', [mb_strtolower($name)])->first()
            ?? Client::create(['name' => $name, 'type' => 'firma']);
        $validated['client_id'] = $client->id;
    }

    /**
     * Validare comuna contract.
     */
    private function validateContract(
        Request $request
    ) {
        return $request->validate([
            'number' => [
                'nullable',
                'string',
                'max:255',
            ],

            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'contract_date' => [
                'nullable',
                'date',
            ],

            'type' => [
                'nullable',
                'string',
                'max:255',
            ],

            'status' => [
                'nullable',
                'in:draft,active,expired,cancelled',
            ],

            'client_id' => [
                'nullable',
                'integer',
                'exists:clients,id',
            ],

            'client_name' => [
                'required_without:client_id',
                'nullable',
                'string',
                'max:255',
            ],

            'work_order_id' => [
                'nullable',
                'integer',
                'exists:work_orders,id',
            ],

            'quote_id' => [
                'nullable',
                'integer',
                'exists:quotes,id',
            ],

            'license_id' => [
                'nullable',
                'integer',
                'exists:licenses,id',
            ],

            'license_name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'license_description' => [
                'nullable',
                'string',
            ],

            'location' => [
                'nullable',
                'string',
                'max:1000',
            ],

            'contact_person' => [
                'nullable',
                'string',
                'max:255',
            ],

            'subject' => [
                'nullable',
                'string',
            ],

            'value' => [
                'nullable',
                'numeric',
                'min:0',
            ],

            'currency' => [
                'nullable',
                'string',
                'max:10',
            ],

            'duration' => [
                'nullable',
                'string',
                'max:255',
            ],

            'payment_terms' => [
                'nullable',
                'string',
            ],

            'content' => [
                'nullable',
                'string',
            ],

            'clauses' => [
                'nullable',
                'string',
            ],

            'observations' => [
                'nullable',
                'string',
            ],

            'provider_signature_name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'provider_signature_position' => [
                'nullable',
                'string',
                'max:255',
            ],

            'client_signature_name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'client_signature_position' => [
                'nullable',
                'string',
                'max:255',
            ],

            'template_id' => [
                'nullable',
                'integer',
                'exists:contract_templates,id',
            ],
        ]);
    }
}
