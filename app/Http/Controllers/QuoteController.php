<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\License;
use App\Models\Product;
use App\Models\Quote;
use App\Models\QuoteTemplate;
use App\Models\StockMovement;
use App\Models\WorkOrder;
use App\Models\WorkOrderMaterial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class QuoteController extends Controller
{
    /**
     * Lista ofertelor si devizelor
     */
    public function index()
    {
        $quotes = Quote::with([
            'client',
            'workOrder',
            'license',
            'items',
        ])
            ->latest()
            ->paginate(15);

        return Inertia::render('Quotes/Index', [
            'quotes' => $quotes,
        ]);
    }

    /**
     * Formular oferta / deviz nou.
     */
    public function create(Request $request)
    {
        $prefill = null;

        $sourceQuote = null;
        $workOrder = null;

        /*
        |--------------------------------------------------------------------------
        | 1. Daca venim dintr-o lucrare
        |--------------------------------------------------------------------------
        */

        if ($request->filled('work_order_id')) {

            $workOrder = WorkOrder::with([
                'client',
                'employee',
                'license',
                'materialsUsed.product',
            ])->find($request->work_order_id);

            if ($workOrder) {

                /*
                |--------------------------------------------------------------------------
                | Cautam oferta asociata lucrarii, daca exista
                |--------------------------------------------------------------------------
                */

                $sourceQuote = Quote::with([
                    'items.product',
                    'license',
                ])
                    ->where(
                        'work_order_id',
                        $workOrder->id
                    )
                    ->where(
                        'type',
                        'oferta'
                    )
                    ->latest()
                    ->first();
            }
        }

        /*
        |--------------------------------------------------------------------------
        | 2. Daca venim direct dintr-o oferta
        |--------------------------------------------------------------------------
        */

        if (
            !$sourceQuote &&
            $request->filled('source_quote_id')
        ) {

            $sourceQuote = Quote::with([
                'items.product',
                'license',
                'workOrder',
            ])
                ->where(
                    'id',
                    $request->source_quote_id
                )
                ->where(
                    'type',
                    'oferta'
                )
                ->first();

            if (
                $sourceQuote &&
                $sourceQuote->work_order_id
            ) {

                $workOrder = WorkOrder::with([
                    'client',
                    'employee',
                    'license',
                    'materialsUsed.product',
                ])->find(
                    $sourceQuote->work_order_id
                );
            }
        }

        /*
        |--------------------------------------------------------------------------
        | 3. Daca exista oferta sursa
        |--------------------------------------------------------------------------
        */

        if (
            $sourceQuote &&
            !$request->boolean('from_work_order')
        ) {

            /*
            |--------------------------------------------------------------------------
            | Clientul ofertei
            |--------------------------------------------------------------------------
            */

            $sourceClient =
                Client::find(
                    $sourceQuote->client_id
                );

            $automaticVatRate =
                $this->vatRateForClient(
                    $sourceClient
                );

            $prefill = [

                'work_order_id' =>
                    $sourceQuote->work_order_id
                    ?? $workOrder?->id,

                'source_quote_id' =>
                    $sourceQuote->id,

                'type' =>
                    'deviz',

                'client_id' =>
                    $sourceQuote->client_id
                    ?? $workOrder?->client_id,

                'license_id' =>
                    $sourceQuote->license_id
                    ?? $workOrder?->license_id,

                'title' =>
                    $sourceQuote->title
                    ?? $workOrder?->type
                    ?? '',

                'date' =>
                    now()->format('Y-m-d'),

                'discount' =>
                    $sourceQuote->discount
                    ?? 0,

                /*
                |--------------------------------------------------------------------------
                | TVA AUTOMAT
                |--------------------------------------------------------------------------
                */

                'vat_rate' =>
                    $automaticVatRate,

                'notes' =>
                    $sourceQuote->notes
                    ?? $workOrder?->notes
                    ?? '',

                'items' =>
                    $sourceQuote->items
                        ->map(function ($item) {

                            return [
                                'product_id' =>
                                    $item->product_id
                                    ?? '',

                                'type' =>
                                    $item->type
                                    ?? 'material',

                                'name' =>
                                    $item->name
                                    ?? '',

                                'unit' =>
                                    $item->unit
                                    ?? 'buc',

                                'quantity' =>
                                    $item->quantity
                                    ?? 1,

                                'unit_price' =>
                                    $item->unit_price
                                    ?? 0,

                                'discount' =>
                                    $item->discount
                                    ?? 0,
                            ];
                        })
                        ->values()
                        ->toArray(),
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | 4. Daca venim dintr-o lucrare
        |--------------------------------------------------------------------------
        |
        | Preluam automat:
        |
        | - materialele consumate din lucrare
        | - manopera din oferta asociata, daca exista
        |
        */

        elseif ($workOrder) {

            $items = [];

            /*
            |--------------------------------------------------------------------------
            | Materiale din lucrare
            |--------------------------------------------------------------------------
            */

            foreach (
                $workOrder->materialsUsed
                as $material
            ) {

                $product =
                    $material->product;

                $items[] = [
                    'product_id' =>
                        $material->product_id,

                    'type' =>
                        'material',

                    'name' =>
                        $product?->name
                        ?? 'Material',

                    'unit' =>
                        $product?->unit
                        ?? 'buc',

                    'quantity' =>
                        (float)
                        $material->quantity,

                    'unit_price' =>
                        (float)
                        (
                            $material->unit_price
                            ?? $product?->sale_price
                            ?? 0
                        ),

                    'discount' =>
                        0,
                ];
            }

            /*
            |--------------------------------------------------------------------------
            | Manopera
            |--------------------------------------------------------------------------
            */

            $laborSource = null;

            if ($sourceQuote) {
                $laborSource = $sourceQuote;
            } else {
                $laborSource = Quote::with([
                    'items',
                ])
                    ->where(
                        'work_order_id',
                        $workOrder->id
                    )
                    ->latest()
                    ->first();
            }

            if ($laborSource) {

                foreach (
                    $laborSource->items
                        ->where(
                            'type',
                            'manopera'
                        )
                    as $item
                ) {

                    $items[] = [
                        'product_id' =>
                            null,

                        'type' =>
                            'manopera',

                        'name' =>
                            $item->name
                            ?? 'Manopera',

                        'unit' =>
                            $item->unit
                            ?? 'ora',

                        'quantity' =>
                            (float)
                            (
                                $item->quantity
                                ?? 1
                            ),

                        'unit_price' =>
                            (float)
                            (
                                $item->unit_price
                                ?? 0
                            ),

                        'discount' =>
                            (float)
                            (
                                $item->discount
                                ?? 0
                            ),
                    ];
                }
            }

            /*
            |--------------------------------------------------------------------------
            | Daca nu avem deloc materiale/manopera
            |--------------------------------------------------------------------------
            */

            if (
                count($items) === 0
            ) {

                $items[] = [
                    'product_id' =>
                        '',

                    'type' =>
                        'material',

                    'name' =>
                        '',

                    'unit' =>
                        'buc',

                    'quantity' =>
                        1,

                    'unit_price' =>
                        0,

                    'discount' =>
                        0,
                ];
            }

            /*
            |--------------------------------------------------------------------------
            | TVA AUTOMAT DIN CLIENT
            |--------------------------------------------------------------------------
            */

            $automaticVatRate =
                $this->vatRateForClient(
                    $workOrder->client
                );

            $prefill = [

                'work_order_id' =>
                    $workOrder->id,

                'source_quote_id' =>
                    $sourceQuote?->id,

                'type' =>
                    'deviz',

                'client_id' =>
                    $workOrder->client_id,

                'license_id' =>
                    $workOrder->license_id,

                'title' =>
                    $workOrder->type
                    ?? '',

                'date' =>
                    now()->format('Y-m-d'),

                'discount' =>
                    $sourceQuote?->discount
                    ?? 0,

                /*
                |--------------------------------------------------------------------------
                | TVA AUTOMAT
                |--------------------------------------------------------------------------
                */

                'vat_rate' =>
                    $automaticVatRate,

                'notes' =>
                    $sourceQuote?->notes
                    ?? $workOrder->notes
                    ?? '',

                'items' =>
                    $items,

                'work_order' => [
                    'id' =>
                        $workOrder->id,

                    'number' =>
                        $workOrder->number,

                    'type' =>
                        $workOrder->type,

                    'address' =>
                        $workOrder->address,

                    'contact_person' =>
                        $workOrder->contact_person,

                    'phone' =>
                        $workOrder->phone,

                    'scheduled_date' =>
                        $workOrder->scheduled_date?->format(
                            'Y-m-d'
                        ),

                    'scheduled_time' =>
                        $workOrder->scheduled_time,

                    'status' =>
                        $workOrder->status,

                    'priority' =>
                        $workOrder->priority,

                    'description' =>
                        $workOrder->description,

                    'materials' =>
                        $workOrder->materials,

                    'notes' =>
                        $workOrder->notes,

                    'client' =>
                        $workOrder->client
                            ? [
                                'id' =>
                                    $workOrder->client->id,

                                'name' =>
                                    $workOrder->client->name,

                                'phone' =>
                                    $workOrder->client->phone,

                                'email' =>
                                    $workOrder->client->email,

                                'address' =>
                                    $workOrder->client->address,

                                'cui' =>
                                    $workOrder->client->cui,

                                'tva_status' =>
                                    $workOrder->client->tva_status,
                            ]
                            : null,
                ],
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | 5. Date pentru formular
        |--------------------------------------------------------------------------
        */

        if ($request->filled('template_id')) {
            $template = QuoteTemplate::findOrFail($request->integer('template_id'));
            $prefill = ['type'=>$template->type,'license_id'=>$template->license_id,'title'=>$template->title,'date'=>now()->format('Y-m-d'),'discount'=>$template->discount,'vat_rate'=>$template->vat_rate,'notes'=>$template->notes,'items'=>$template->items];
        }

        return Inertia::render(
            'Quotes/Create',
            [
                'clients' =>
                    Client::orderBy(
                        'name'
                    )->get(),

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

                'products' =>
                    Product::where(
                        'active',
                        true
                    )
                        ->orderBy(
                            'name'
                        )
                        ->get([
                            'id',
                            'name',
                            'code',
                            'ean',
                            'category',
                            'unit',
                            'stock_quantity',
                            'sale_price',
                            'purchase_price',
                            'vat_rate',
                        ]),

                'prefill' =>
                    $prefill,

                'templateMode' =>
                    $request->boolean('as_template'),
            ]
        );
    }

    /**
     * Formular dedicat pentru creare deviz.
     */
    public function createDeviz(
        Request $request
    ) {
        $request->merge([
            'type' =>
                'deviz',
        ]);

        return $this->create(
            $request
        );
    }

    /**
     * Salvare oferta / deviz
     */
    public function store(
        Request $request
    ) {
        $validated =
            $this->validateQuote(
                $request
            );

        /*
        |--------------------------------------------------------------------------
        | TVA ESTE DECIS IN BACKEND DUPA CLIENT
        |--------------------------------------------------------------------------
        */

        $client =
            Client::findOrFail(
                $validated['client_id']
            );

        $validated['vat_rate'] =
            $this->vatRateForClient(
                $client
            );

        $quote =
            DB::transaction(
                function () use (
                    $validated
                ) {

                    $type =
                        $validated['type']
                        ?? 'oferta';

                    $prefix =
                        $type === 'deviz'
                            ? 'DV-'
                            : 'OF-';

                    $quote =
                        Quote::create([
                            'work_order_id' =>
                                $validated[
                                    'work_order_id'
                                ] ?? null,

                            'client_id' =>
                                $validated[
                                    'client_id'
                                ],

                            'license_id' =>
                                $validated[
                                    'license_id'
                                ] ?? null,

                            'number' =>
                                $prefix .
                                date(
                                    'YmdHis'
                                ),

                            'type' =>
                                $type,

                            'title' =>
                                trim(
                                    $validated[
                                        'title'
                                    ]
                                ),

                            'date' =>
                                $validated[
                                    'date'
                                ],

                            'status' =>
                                'draft',

                            'discount' =>
                                $validated[
                                    'discount'
                                ] ?? 0,

                            /*
                            |--------------------------------------------------------------------------
                            | TVA CALCULAT AUTOMAT
                            |--------------------------------------------------------------------------
                            */

                            'vat_rate' =>
                                $validated[
                                    'vat_rate'
                                ],

                            'notes' =>
                                $validated[
                                    'notes'
                                ] ?? null,
                        ]);

                    foreach (
                        $validated['items']
                        as $item
                    ) {

                        [$product, $catalogProductCreated] =
                            $this->catalogProductForQuoteItem($item);

                        $quote
                            ->items()
                            ->create([
                                'product_id' =>
                                    $product?->id,

                                'catalog_product_created' =>
                                    $catalogProductCreated,

                                'type' =>
                                    $item[
                                        'type'
                                    ],

                                'name' =>
                                    $item[
                                        'name'
                                    ],

                                'unit' =>
                                    $item[
                                        'unit'
                                    ],

                                'quantity' =>
                                    $item[
                                        'quantity'
                                    ],

                                'unit_price' =>
                                    $item[
                                        'unit_price'
                                    ],

                                'discount' =>
                                    $item[
                                        'discount'
                                    ] ?? 0,
                            ]);
                    }

                    return $quote;
                }
            );

        return redirect()
            ->route(
                'quotes.show',
                $quote
            )
            ->with(
                'success',
                $quote->type === 'deviz'
                    ? 'Devizul a fost creat cu succes.'
                    : 'Oferta a fost creata cu succes.'
            );
    }

    /**
     * Formular editare oferta / deviz
     */
    public function edit(
        Quote $quote
    ) {
        $quote->load([
            'client',
            'items',
            'workOrder',
            'license',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Sincronizam TVA-ul cu statutul actual al clientului
        |--------------------------------------------------------------------------
        */

        $automaticVatRate =
            $this->vatRateForClient(
                $quote->client
            );

        $quote->vat_rate =
            $automaticVatRate;

        return Inertia::render(
            'Quotes/Edit',
            [
                'quote' =>
                    $quote,

                'clients' =>
                    Client::orderBy(
                        'name'
                    )->get(),

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

                'products' =>
                    Product::where(
                        'active',
                        true
                    )
                        ->orderBy(
                            'name'
                        )
                        ->get([
                            'id',
                            'name',
                            'code',
                            'ean',
                            'category',
                            'unit',
                            'stock_quantity',
                            'sale_price',
                            'vat_rate',
                        ]),
            ]
        );
    }

    /**
     * Actualizare oferta / deviz
     */
    public function update(
        Request $request,
        Quote $quote
    ) {
        $validated =
            $this->validateQuote(
                $request
            );

        /*
        |--------------------------------------------------------------------------
        | TVA DECIS DIN CLIENT
        |--------------------------------------------------------------------------
        */

        $client =
            Client::findOrFail(
                $validated['client_id']
            );

        $validated['vat_rate'] =
            $this->vatRateForClient(
                $client
            );

        DB::transaction(
            function () use (
                $validated,
                $quote
            ) {

                $quote->update([
                    'work_order_id' =>
                        $validated[
                            'work_order_id'
                        ] ?? null,

                    'client_id' =>
                        $validated[
                            'client_id'
                        ],

                    'license_id' =>
                        $validated[
                            'license_id'
                        ] ?? null,

                    'title' =>
                        trim(
                            $validated[
                                'title'
                            ]
                        ),

                    'date' =>
                        $validated[
                            'date'
                        ],

                    'discount' =>
                        $validated[
                            'discount'
                        ] ?? 0,

                    /*
                    |--------------------------------------------------------------------------
                    | TVA CALCULAT AUTOMAT
                    |--------------------------------------------------------------------------
                    */

                    'vat_rate' =>
                        $validated[
                            'vat_rate'
                        ],

                    'notes' =>
                        $validated[
                            'notes'
                        ] ?? null,
                ]);

                if (
                    $quote->work_order_id
                ) {

                    $workOrder =
                        WorkOrder::find(
                            $quote->work_order_id
                        );

                    if ($workOrder) {

                        $workOrder->update([
                            'type' =>
                                trim(
                                    $validated[
                                        'title'
                                    ]
                                ),
                        ]);
                    }
                }

                $quote
                    ->items()
                    ->delete();

                foreach (
                    $validated['items']
                    as $item
                ) {

                    [$product, $catalogProductCreated] =
                        $this->catalogProductForQuoteItem($item);

                    $quote
                        ->items()
                        ->create([
                            'product_id' =>
                                $product?->id,

                            'catalog_product_created' =>
                                $catalogProductCreated,

                            'type' =>
                                $item[
                                    'type'
                                ],

                            'name' =>
                                $item[
                                    'name'
                                ],

                            'unit' =>
                                $item[
                                    'unit'
                                ],

                            'quantity' =>
                                $item[
                                    'quantity'
                                ],

                            'unit_price' =>
                                $item[
                                    'unit_price'
                                ],

                            'discount' =>
                                $item[
                                    'discount'
                                ] ?? 0,
                        ]);
                }
            }
        );

        return redirect()
            ->route(
                'quotes.show',
                $quote
            )
            ->with(
                'success',
                $quote->type === 'deviz'
                    ? 'Devizul a fost actualizat cu succes.'
                    : 'Oferta a fost actualizata cu succes.'
            );
    }

    /**
     * Vizualizare oferta / deviz
     */
    public function show(
        Quote $quote
    ) {
        $quote->load([
            'client',
            'workOrder',
            'license',
            'items.product',
        ]);

        /*
        |--------------------------------------------------------------------------
        | TVA sincronizat cu clientul
        |--------------------------------------------------------------------------
        */

        $automaticVatRate =
            $this->vatRateForClient(
                $quote->client
            );

        $quote->vat_rate =
            $automaticVatRate;

        return Inertia::render(
            'Quotes/Show',
            [
                'quote' =>
                    $quote,
            ]
        );
    }

    /**
     * Marcheaza oferta ca trimisa
     */
    public function send(
        Quote $quote
    ) {
        if (
            $quote->type !== 'oferta'
        ) {
            return back()->with(
                'error',
                'Doar ofertele pot fi trimise clientului.'
            );
        }

        if (
            $quote->status ===
            'accepted'
        ) {
            return back()->with(
                'error',
                'Oferta este deja acceptata.'
            );
        }

        if (
            $quote->status ===
            'rejected'
        ) {
            return back()->with(
                'error',
                'Oferta a fost respinsa.'
            );
        }

        $quote->update([
            'status' =>
                'sent',
        ]);

        return back()->with(
            'success',
            'Oferta a fost marcata ca trimisa.'
        );
    }

    /**
     * Accepta oferta
     */
    public function accept(
        Quote $quote
    ) {
        if (
            $quote->type !== 'oferta'
        ) {
            return back()->with(
                'error',
                'Doar ofertele pot fi acceptate.'
            );
        }

        if (
            $quote->status ===
            'accepted'
        ) {
            return back()->with(
                'error',
                'Oferta este deja acceptata.'
            );
        }

        if (
            $quote->status ===
            'rejected'
        ) {
            return back()->with(
                'error',
                'Oferta a fost respinsa.'
            );
        }

        $quote->update([
            'status' =>
                'accepted',
        ]);

        return back()->with(
            'success',
            'Oferta a fost acceptata.'
        );
    }

    /**
     * Respinge oferta
     */
    public function reject(
        Quote $quote
    ) {
        if (
            $quote->type !== 'oferta'
        ) {
            return back()->with(
                'error',
                'Doar ofertele pot fi respinse.'
            );
        }

        if (
            $quote->status ===
            'accepted'
        ) {
            return back()->with(
                'error',
                'Oferta este deja acceptata.'
            );
        }

        $quote->update([
            'status' =>
                'rejected',
        ]);

        return back()->with(
            'success',
            'Oferta a fost respinsa.'
        );
    }

    /**
     * Redeschide oferta / devizul
     */
    public function reopen(
        Quote $quote
    ) {
        if (
            $quote->type === 'oferta' &&
            !in_array(
                $quote->status,
                [
                    'accepted',
                    'rejected',
                ],
                true
            )
        ) {
            return back()->with(
                'error',
                'Aceasta oferta nu poate fi redeschisa.'
            );
        }

        if (
            $quote->type === 'deviz' &&
            $quote->status !==
                'finalizat'
        ) {
            return back()->with(
                'error',
                'Acest deviz nu este finalizat.'
            );
        }

        if (
            $quote->type === 'deviz' &&
            $quote->work_order_id
        ) {
            return back()->with(
                'error',
                'Devizul nu mai poate fi redeschis deoarece exista deja o lucrare asociata.'
            );
        }

        $quote->update([
            'status' =>
                'draft',
        ]);

        return back()->with(
            'success',
            $quote->type === 'deviz'
                ? 'Devizul a fost redeschis.'
                : 'Oferta a fost redeschisa.'
        );
    }

    /**
     * Finalizeaza devizul
     *
     * Finalizarea devizului nu modifica stocul.
     */
    public function finalize(
        Quote $quote
    ) {
        if (
            $quote->type !== 'deviz'
        ) {
            return back()->with(
                'error',
                'Doar devizele pot fi finalizate.'
            );
        }

        if (
            $quote->status ===
            'finalizat'
        ) {
            return back()->with(
                'error',
                'Devizul este deja finalizat.'
            );
        }

        $quote->update([
            'status' =>
                'finalizat',
        ]);

        return back()->with(
            'success',
            'Devizul a fost finalizat.'
        );
    }

    /**
     * Creeaza lucrare din oferta acceptata.
     */
    public function createWorkOrder(
        Quote $quote
    ) {
        if ($quote->type !== 'oferta') {
            return back()->with(
                'error',
                'Lucrarea poate fi creata doar dintr-o oferta acceptata.'
            );
        }

        if ($quote->status !== 'accepted') {
            return back()->with(
                'error',
                'Oferta trebuie acceptata inainte de crearea lucrarii.'
            );
        }

        if (
            $quote->work_order_id
        ) {
            return redirect()
                ->route(
                    'work_orders.show',
                    $quote->work_order_id
                )
                ->with(
                    'success',
                    'Devizul are deja o lucrare asociata.'
                );
        }

        $quote->load([
            'client',
            'items',
            'license',
        ]);

        // Ofertele mai vechi pot conține materiale scrise liber. Le adăugăm
        // în nomenclator cu stoc zero și le asociem ofertei înainte de a
        // crea lucrarea, astfel încât să apară în lista de materiale.
        foreach ($quote->items as $item) {
            if ($item->type !== 'material' || $item->product_id) {
                continue;
            }

            [$product, $catalogProductCreated] =
                $this->catalogProductForQuoteItem([
                    'type' => $item->type,
                    'name' => $item->name,
                    'unit' => $item->unit,
                    'unit_price' => $item->unit_price,
                ]);

            $item->update([
                'product_id' => $product?->id,
                'catalog_product_created' => $catalogProductCreated,
            ]);
        }

        $quote->load('items');

        $materialItems =
            $quote->items
                ->where(
                    'type',
                    'material'
                )
                ->values();

        $materials =
            $materialItems
                ->map(
                    function ($item) {

                        return
                            $item->name
                            . ' - '
                            . $item->quantity
                            . ' '
                            . $item->unit
                            . ' × '
                            . number_format(
                                (float)
                                $item->unit_price,
                                2,
                                ',',
                                '.'
                            )
                            . ' lei';
                    }
                )
                ->implode(
                    "\n"
                );

        $labor =
            $quote->items
                ->where(
                    'type',
                    'manopera'
                )
                ->map(
                    function ($item) {

                        return
                            $item->name
                            . ' - '
                            . $item->quantity
                            . ' '
                            . $item->unit
                            . ' × '
                            . number_format(
                                (float)
                                $item->unit_price,
                                2,
                                ',',
                                '.'
                            )
                            . ' lei';
                    }
                )
                ->implode(
                    "\n"
                );

        $description =
            (
                $quote->title
                    ? $quote->title . ' — '
                    : ''
            )
            . 'Lucrare creata din oferta acceptata '
            . $quote->number;

        $workOrder =
            DB::transaction(
                function () use (
                    $quote,
                    $materialItems,
                    $materials,
                    $labor,
                    $description
                ) {

                    $workOrder =
                        WorkOrder::create([
                            'client_id' =>
                                $quote->client_id,

                            'employee_id' =>
                                null,

                            'license_id' =>
                                $quote->license_id,

                            'number' =>
                                'WO-' .
                                date(
                                    'YmdHis'
                                ),

                            'type' =>
                                $quote->title
                                ?:
                                'Lucrare conform oferta',

                            'work_type' =>
                                $quote->title
                                ?:
                                'Lucrare conform oferta',

                            'address' =>
                                $quote
                                    ->client
                                    ->address
                                    ?? null,

                            'contact_person' =>
                                null,

                            'phone' =>
                                $quote
                                    ->client
                                    ->phone
                                    ?? null,

                            'scheduled_date' =>
                                null,

                            'scheduled_time' =>
                                null,

                            'status' =>
                                'noua',

                            'description' =>
                                $description,

                            'materials' =>
                                $materials
                                    ?: null,

                            'notes' =>
                                $labor
                                    ? "Manopera:\n"
                                        . $labor
                                    : null,

                            'priority' =>
                                'normal',
                        ]);

                    $groupedMaterials =
                        $materialItems
                            ->groupBy(
                                'product_id'
                            );

                    foreach (
                        $groupedMaterials
                        as $productId =>
                        $items
                    ) {

                        // Un material scris liber in oferta ramane in
                        // descrierea lucrarii. Nu poate genera o miscare de
                        // stoc pana cand nu este asociat unui produs.
                        if (empty($productId)) {
                            continue;
                        }

                        $quantity =
                            $items->sum(
                                function (
                                    $item
                                ) {
                                    return
                                        (float)
                                        $item->quantity;
                                }
                            );

                        if (
                            $quantity <= 0
                        ) {
                            continue;
                        }

                        $product =
                            Product::query()
                                ->lockForUpdate()
                                ->findOrFail(
                                    $productId
                                );

                        $catalogProductOnly =
                            $items->contains(
                                fn ($item) =>
                                    $item->catalog_product_created
                            );

                        $unitPrice =
                            $catalogProductOnly
                                ? 0.0
                                : (float) (
                                    $product->purchase_price
                                    ?? 0
                                );

                        $totalPrice =
                            round(
                                $quantity * $unitPrice,
                                2
                            );

                        WorkOrderMaterial::create([
                            'work_order_id' => $workOrder->id,
                            'product_id' => $product->id,
                            'quantity' => $quantity,
                            'unit_price' => $unitPrice,
                            'total_price' => $totalPrice,
                        ]);

                        // Material scris liber: există acum în nomenclator,
                        // însă are stoc zero. Îl afișăm ca material al
                        // lucrării fără să inventăm o ieșire de stoc.
                        if ($catalogProductOnly) {
                            continue;
                        }

                        $stockBefore =
                            (float)
                            $product
                                ->stock_quantity;

                        $stockAfter =
                            $stockBefore -
                            $quantity;

                        if (
                            $stockAfter < 0
                        ) {

                            abort(
                                422,
                                'Stoc insuficient pentru produsul "' .
                                $product->name .
                                '". Disponibil: ' .
                                number_format(
                                    $stockBefore,
                                    2,
                                    '.',
                                    ''
                                ) .
                                ', necesar: ' .
                                number_format(
                                    $quantity,
                                    2,
                                    '.',
                                    ''
                                ) .
                                '.'
                            );
                        }

                        StockMovement::create([
                            'product_id' =>
                                $product->id,

                            'type' =>
                                'out',

                            'quantity' =>
                                $quantity,

                            'stock_before' =>
                                $stockBefore,

                            'stock_after' =>
                                $stockAfter,

                            'unit_price' =>
                                $unitPrice,

                            'reference_type' =>
                                'work_order',

                            'reference_id' =>
                                $workOrder->id,

                            'document_number' =>
                                $workOrder->number,

                            'reason' =>
                                'Consum material din oferta acceptata',

                            'work_order_id' =>
                                $workOrder->id,

                            'user_id' =>
                                auth()->id(),

                            'notes' =>
                                'Consum automat la transformarea ofertei acceptate in lucrare.',
                        ]);

                        $product->update([
                            'stock_quantity' =>
                                $stockAfter,
                        ]);
                    }

                    $quote->update([
                        'work_order_id' =>
                            $workOrder->id,
                    ]);

                    return $workOrder;
                }
            );

        $catalogOnlyMaterialCount =
            $materialItems
                ->filter(
                    fn ($item) => $item->catalog_product_created
                )
                ->count();

        return redirect()
            ->route(
                'work_orders.show',
                $workOrder
            )
            ->with(
                'success',
                $catalogOnlyMaterialCount > 0
                    ? 'Lucrarea a fost creata din oferta acceptata. Materialele scrise liber au fost adaugate in nomenclator cu stoc zero si apar in lista de materiale ale lucrarii.'
                    : 'Lucrarea a fost creata din oferta acceptata, iar materialele au fost scazute automat din stoc.'
            );
    }

    /**
     * PDF oferta / deviz
     */
    public function pdf(
        Quote $quote
    ) {
        $quote->load([
            'client',
            'workOrder',
            'license',
            'items.product',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Sincronizam TVA cu statutul clientului
        |--------------------------------------------------------------------------
        */

        $quote->vat_rate =
            $this->vatRateForClient(
                $quote->client
            );

        $pdf =
            Pdf::loadView(
                'quotes.pdf',
                [
                    'quote' =>
                        $quote,
                ]
            );

        $pdf->setPaper(
            'a4',
            'portrait'
        );

        return $pdf->stream(
            $quote->number .
            '.pdf'
        );
    }

    /**
     * Stergere oferta / deviz
     */
    public function destroy(
        Quote $quote
    ) {
        DB::transaction(
            function () use (
                $quote
            ) {

                $quote
                    ->items()
                    ->delete();

                $quote->delete();
            }
        );

        return redirect()
            ->route(
                'quotes.index'
            )
            ->with(
                'success',
                $quote->type === 'deviz'
                    ? 'Devizul a fost sters.'
                    : 'Oferta a fost stearsa.'
            );
    }

    /**
     * Leagă materialul ofertei de nomenclator. Dacă este scris liber și nu
     * există, creează produsul cu stoc zero — fără mișcare de stoc.
     *
     * @return array{0: ?Product, 1: bool}
     */
    private function catalogProductForQuoteItem(array $item): array
    {
        if (($item['type'] ?? null) !== 'material') {
            return [null, false];
        }

        if (!empty($item['product_id'])) {
            return [Product::findOrFail($item['product_id']), false];
        }

        $name = trim((string) ($item['name'] ?? ''));

        $existing = Product::query()
            ->get(['id', 'name'])
            ->first(fn (Product $product) =>
                mb_strtolower(trim($product->name)) === mb_strtolower($name)
            );

        if ($existing) {
            return [$existing, false];
        }

        return [Product::create([
            'name' => $name,
            'unit' => trim((string) ($item['unit'] ?? '')) ?: 'buc',
            'stock_quantity' => 0,
            'purchase_price' => 0,
            'sale_price' => (float) ($item['unit_price'] ?? 0),
            'vat_rate' => 21,
            'minimum_stock' => 0,
            'active' => true,
            'notes' => 'Creat automat din material introdus liber într-o ofertă.',
        ]), true];
    }

    /**
     * Determina TVA-ul automat dupa client.
     *
     * REGULA ELECTROCRM:
     *
     * - firma platitoare TVA = 0%
     * - firma neplatitoare TVA = 21%
     * - persoana fizica = 21%
     * - orice client neverificat = 21%
     */
    private function vatRateForClient(
        ?Client $client
    ): float {
        if (
            !$client
        ) {
            return 21.0;
        }

        if (
            $client->tva_status ===
            'platitor_tva'
        ) {
            return 0.0;
        }

        return 21.0;
    }

    /**
     * Validare comuna.
     *
     * vat_rate este primit doar pentru compatibilitate
     * cu formularul existent.
     *
     * Valoarea reala este recalculata in store/update
     * dupa statutul TVA al clientului.
     */
    private function validateQuote(
        Request $request
    ) {
        return $request->validate([

            'type' => [
                'nullable',
                'in:oferta,deviz',
            ],

            'client_id' => [
                'required',
                'exists:clients,id',
            ],

            'license_id' => [
                'nullable',
                'exists:licenses,id',
            ],

            'work_order_id' => [
                'nullable',
                'exists:work_orders,id',
            ],

            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'date' => [
                'required',
                'date',
            ],

            'discount' => [
                'nullable',
                'numeric',
                'min:0',
                'max:100',
            ],

            /*
            |--------------------------------------------------------------------------
            | Pastram campul pentru formularul existent.
            | Backend-ul il suprascrie cu valoarea corecta.
            |--------------------------------------------------------------------------
            */

            'vat_rate' => [
                'nullable',
                'numeric',
                'min:0',
                'max:100',
            ],

            'notes' => [
                'nullable',
                'string',
            ],

            'items' => [
                'required',
                'array',
                'min:1',
            ],

            'items.*.type' => [
                'required',
                'in:material,manopera',
            ],

            'items.*.product_id' => [
                'nullable',
                'exists:products,id',
            ],

            'items.*.name' => [
                'required',
                'string',
                'max:255',
            ],

            'items.*.unit' => [
                'required',
                'string',
                'max:50',
            ],

            'items.*.quantity' => [
                'required',
                'numeric',
                'min:0.01',
            ],

            'items.*.unit_price' => [
                'required',
                'numeric',
                'min:0',
            ],

            'items.*.discount' => [
                'nullable',
                'numeric',
                'min:0',
                'max:100',
            ],
        ]);
    }
}
