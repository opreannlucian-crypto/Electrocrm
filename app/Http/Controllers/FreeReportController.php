<?php

namespace App\Http\Controllers;

use App\Models\FreeReport;
use App\Models\FreeReportTemplate;
use App\Models\License;
use App\Models\Quote;
use App\Models\WorkOrder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class FreeReportController extends Controller
{
    /**
     * Lista tuturor proceselor-verbale.
     */
    public function index()
    {
        $freeReports = FreeReport::with([
            'workOrder.client',
            'quote',
            'license',
        ])
            ->latest()
            ->paginate(15);

        return Inertia::render(
            'Reports/Index',
            [
                'freeReports' => $freeReports,
            ]
        );
    }

    /**
     * Pagina de alegere a tipului de proces-verbal.
     */
    public function create(Request $request)
    {
        $selectedWorkOrderId = $request->integer('work_order_id') ?: null;
        return Inertia::render(
            'Reports/Create',
            [
                'workOrders' => WorkOrder::with([
                    'client',
                    'license',
                ])
                    ->latest()
                    ->get(),

                'quotes' => Quote::with([
                    'client',
                    'license',
                ])
                    ->latest()
                    ->get(),

                'template' => $request->filled('template_id') ? FreeReportTemplate::findOrFail($request->integer('template_id')) : null,
                'selectedWorkOrderId' => $selectedWorkOrderId,
                'licenses' => License::where(
                    'active',
                    true
                )
                    ->orderBy('sort_order')
                    ->orderBy('name')
                    ->get([
                        'id',
                        'name',
                        'code',
                        'description',
                        'image_path',
                        'active',
                        'sort_order',
                    ]),
            ]
        );
    }

    /**
     * Salveaza un proces-verbal liber.
     */
    public function store(Request $request)
    {
    
        $validated = $request->validate([
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

            'document_date' => [
                'nullable',
                'date',
            ],

            'location' => [
                'nullable',
                'string',
                'max:1000',
            ],

            'client_name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'client_cui' => [
                'nullable',
                'string',
                'max:255',
            ],

            'client_address' => [
                'nullable',
                'string',
                'max:1000',
            ],

            'client_phone' => [
                'nullable',
                'string',
                'max:255',
            ],

            'contact_person' => [
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

            'participants' => [
                'nullable',
                'string',
            ],

            'subject' => [
                'nullable',
                'string',
            ],

            'content' => [
                'nullable',
                'string',
            ],

            'findings' => [
                'nullable',
                'string',
            ],

            'conclusions' => [
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
        ]);

        if (
            empty($validated['number'])
        ) {
            $validated['number'] =
                'PV-' .
                now()->format('YmdHis');
        }

        /*
        |--------------------------------------------------------------------------
        | Daca este selectata o lucrare, preluam automat datele disponibile.
        |--------------------------------------------------------------------------
        */

        if (
            !empty($validated['work_order_id'])
        ) {
            $workOrder =
                WorkOrder::with([
                    'client',
                    'license',
                ])->find(
                    $validated['work_order_id']
                );

            if ($workOrder) {
                $validated =
                    $this->fillFromWorkOrder(
                        $validated,
                        $workOrder
                    );
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Daca este selectata o oferta/deviz, completam datele disponibile.
        |--------------------------------------------------------------------------
        */

        if (
            !empty($validated['quote_id'])
        ) {
            $quote =
                Quote::with([
                    'client',
                    'license',
                ])->find(
                    $validated['quote_id']
                );

            if ($quote) {
                $validated =
                    $this->fillFromQuote(
                        $validated,
                        $quote
                    );
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Daca exista licenta, pastram si denumirea si descrierea.
        |--------------------------------------------------------------------------
        */

        if (
            !empty($validated['license_id'])
        ) {
            $license =
                License::find(
                    $validated['license_id']
                );

            if ($license) {
                $validated['license_name'] =
                    $license->name;

                $validated['license_description'] =
                    $license->description;
            }
        }

        $validated['user_id'] =
            auth()->id();

        $freeReport =
            FreeReport::create(
                $validated
            );

        return redirect()
            ->route(
                'reports.show',
                $freeReport
            )
            ->with(
                'success',
                'Procesul-verbal a fost creat cu succes.'
            );
    }

    /**
     * Afiseaza procesul-verbal.
     */
    public function show(
        FreeReport $freeReport
    ) {
        $freeReport->load([
            'workOrder.client',
            'workOrder.license',
            'quote.client',
            'quote.license',
            'license',
            'user',
        ]);

        return Inertia::render(
            'Reports/Show',
            [
                'freeReport' =>
                    $freeReport,
            ]
        );
    }

    /**
     * Formular editare proces-verbal.
     */
    public function edit(
        FreeReport $freeReport
    ) {
        $freeReport->load([
            'workOrder.client',
            'workOrder.license',
            'quote.client',
            'quote.license',
            'license',
        ]);

        return Inertia::render(
            'Reports/Edit',
            [
                'freeReport' =>
                    $freeReport,

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
                        ->orderBy('sort_order')
                        ->orderBy('name')
                        ->get([
                            'id',
                            'name',
                            'code',
                            'description',
                            'image_path',
                            'active',
                            'sort_order',
                        ]),
            ]
        );
    }

    /**
     * Actualizare proces-verbal.
     */
    public function update(
        Request $request,
        FreeReport $freeReport
    ) {
        $validated = $request->validate([
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

            'document_date' => [
                'nullable',
                'date',
            ],

            'location' => [
                'nullable',
                'string',
                'max:1000',
            ],

            'client_name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'client_cui' => [
                'nullable',
                'string',
                'max:255',
            ],

            'client_address' => [
                'nullable',
                'string',
                'max:1000',
            ],

            'client_phone' => [
                'nullable',
                'string',
                'max:255',
            ],

            'contact_person' => [
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

            'participants' => [
                'nullable',
                'string',
            ],

            'subject' => [
                'nullable',
                'string',
            ],

            'content' => [
                'nullable',
                'string',
            ],

            'findings' => [
                'nullable',
                'string',
            ],

            'conclusions' => [
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
        ]);

        if (
            empty($validated['number'])
        ) {
            $validated['number'] =
                $freeReport->number
                ?: 'PV-' .
                    now()->format(
                        'YmdHis'
                    );
        }

        /*
        |--------------------------------------------------------------------------
        | Actualizam automat datele daca este asociata o lucrare.
        |--------------------------------------------------------------------------
        */

        if (
            !empty($validated['work_order_id'])
        ) {
            $workOrder =
                WorkOrder::with([
                    'client',
                    'license',
                ])->find(
                    $validated['work_order_id']
                );

            if ($workOrder) {
                $validated =
                    $this->fillFromWorkOrder(
                        $validated,
                        $workOrder
                    );
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Actualizam automat datele daca este asociata o oferta/deviz.
        |--------------------------------------------------------------------------
        */

        if (
            !empty($validated['quote_id'])
        ) {
            $quote =
                Quote::with([
                    'client',
                    'license',
                ])->find(
                    $validated['quote_id']
                );

            if ($quote) {
                $validated =
                    $this->fillFromQuote(
                        $validated,
                        $quote
                    );
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Licenta + descriere.
        |--------------------------------------------------------------------------
        */

        if (
            !empty($validated['license_id'])
        ) {
            $license =
                License::find(
                    $validated['license_id']
                );

            if ($license) {
                $validated['license_name'] =
                    $license->name;

                $validated['license_description'] =
                    $license->description;
            }
        }

        $freeReport->update(
            $validated
        );

        return redirect()
            ->route(
                'reports.show',
                $freeReport
            )
            ->with(
                'success',
                'Procesul-verbal a fost actualizat.'
            );
    }

    /**
     * Stergere proces-verbal.
     */
    public function destroy(
        FreeReport $freeReport
    ) {
        $freeReport->delete();

        return redirect()
            ->route(
                'reports.index'
            )
            ->with(
                'success',
                'Procesul-verbal a fost sters.'
            );
    }

    /**
     * Generare si descarcare PDF proces-verbal.
     */
    public function pdf(
        FreeReport $freeReport
    ) {
        $freeReport->load([
            'workOrder.client',
            'workOrder.license',
            'quote.client',
            'quote.license',
            'license',
            'user',
        ]);

        $pdf =
            Pdf::loadView(
                'reports.free-report-pdf',
                [
                    'freeReport' =>
                        $freeReport,
                ]
            );

        $pdf->setPaper(
            'a4',
            'portrait'
        );

        return $pdf->download(
            (
                $freeReport->number
                ?: 'proces-verbal'
            ) .
            '.pdf'
        );
    }

    /**
     * Completeaza datele din lucrare.
     */
    protected function fillFromWorkOrder(
        array $data,
        WorkOrder $workOrder
    ): array {
        if (
            empty($data['client_name']) &&
            $workOrder->client
        ) {
            $data['client_name'] =
                $workOrder->client->name;
        }

        if (
            empty($data['client_cui']) &&
            $workOrder->client
        ) {
            $data['client_cui'] =
                $workOrder->client->cui
                ?? null;
        }

        if (
            empty($data['client_address']) &&
            $workOrder->client
        ) {
            $data['client_address'] =
                $workOrder->client->address
                ?? null;
        }

        if (
            empty($data['client_phone']) &&
            $workOrder->client
        ) {
            $data['client_phone'] =
                $workOrder->client->phone
                ?? null;
        }

        if (
            empty($data['contact_person'])
        ) {
            $data['contact_person'] =
                $workOrder->contact_person
                ?? null;
        }

        if (
            empty($data['location'])
        ) {
            $data['location'] =
                $workOrder->address
                ?? null;
        }

        if (
            empty($data['subject'])
        ) {
            $data['subject'] =
                $workOrder->type
                ?? null;
        }

        if (
            empty($data['license_id']) &&
            $workOrder->license
        ) {
            $data['license_id'] =
                $workOrder->license->id;

            $data['license_name'] =
                $workOrder->license->name;

            $data['license_description'] =
                $workOrder->license->description;
        }

        return $data;
    }

    /**
     * Completeaza datele din oferta/deviz.
     */
    protected function fillFromQuote(
        array $data,
        Quote $quote
    ): array {
        if (
            empty($data['client_name']) &&
            $quote->client
        ) {
            $data['client_name'] =
                $quote->client->name;
        }

        if (
            empty($data['client_cui']) &&
            $quote->client
        ) {
            $data['client_cui'] =
                $quote->client->cui
                ?? null;
        }

        if (
            empty($data['client_address']) &&
            $quote->client
        ) {
            $data['client_address'] =
                $quote->client->address
                ?? null;
        }

        if (
            empty($data['client_phone']) &&
            $quote->client
        ) {
            $data['client_phone'] =
                $quote->client->phone
                ?? null;
        }

        if (
            empty($data['title']) &&
            !empty($quote->title)
        ) {
            $data['title'] =
                $quote->title;
        }

        if (
            empty($data['license_id']) &&
            $quote->license
        ) {
            $data['license_id'] =
                $quote->license->id;

            $data['license_name'] =
                $quote->license->name;

            $data['license_description'] =
                $quote->license->description;
        }

        return $data;
    }
}
