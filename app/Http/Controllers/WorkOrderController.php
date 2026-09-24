<?php

namespace App\Http\Controllers;

use App\Events\DomainNotificationEvent;
use App\Models\Client;
use App\Models\ClientRevision;
use App\Models\Employee;
use App\Models\License;
use App\Models\Product;
use App\Models\Quote;
use App\Models\StockMovement;
use App\Models\WorkOrder;
use App\Models\WorkOrderEmployee;
use App\Models\WorkOrderMaterial;
use App\Models\WorkOrderPhoto;
use App\Models\WorkOrderTimeEntry;
use App\Models\User;
use Illuminate\Http\File;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class WorkOrderController extends Controller
{
    /**
     * Lista lucrarilor.
     */
    public function index()
    {
        $user = request()->user();

        $workOrders = WorkOrder::with([
            'client',
            'employee',
            'employees',
            'license',
            'materialsUsed.product',
        ]);

        if ($user?->isTechnician()) {
            abort_unless($user->employee_id, 403, 'Contul de tehnician nu este asociat unui angajat.');

            $workOrders->where(function ($query) use ($user) {
                $query->where('employee_id', $user->employee_id)
                    ->orWhereHas('employees', fn ($employees) => $employees->whereKey($user->employee_id));
            });
        }

        return Inertia::render('WorkOrders/Index', [
            'workOrders' => $workOrders->latest()->paginate(10),
        ]);
    }

    /**
     * Formular lucrare noua.
     */
    public function create()
    {
        $user = request()->user();

        $employees = Employee::orderBy('name');

        if ($user?->isTechnician()) {
            abort_unless($user->employee_id, 403, 'Contul de tehnician nu este asociat unui angajat.');
            $employees->whereKey($user->employee_id);
        }

        return Inertia::render('WorkOrders/Create', [
            'clients' => Client::orderBy('name')->get(),

            'selectedClientId' => request()->integer('client_id') ?: null,

            'employees' => $employees->get(),

            'licenses' => License::where('active', true)
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

            'products' => $user?->isTechnician()
                ? []
                : Product::where('active', true)
                    ->orderBy('name')
                    ->get([
                        'id',
                        'name',
                        'code',
                        'ean',
                        'unit',
                        'stock_quantity',
                        'purchase_price',
                    ]),
        ]);
    }

    /**
     * Salveaza lucrare.
     */
    public function store(Request $request)
    {
        $user = $request->user();

        if ($user?->isTechnician()) {
            abort_unless($user->employee_id, 403, 'Contul de tehnician nu este asociat unui angajat.');
        }

        $validated = $request->validate([
            'client_id' => [
                'nullable',
                'exists:clients,id',
            ],

            'client_name' => [
                'required',
                'string',
                'max:255',
            ],

            'employee_id' => [
                'nullable',
                'exists:employees,id',
            ],

            'employee_ids' => [
                'nullable',
                'array',
            ],

            'employee_ids.*' => [
                'integer',
                'exists:employees,id',
            ],

            'license_id' => [
                'nullable',
                'exists:licenses,id',
            ],

            'type' => [
                'required',
                'string',
                'max:255',
            ],

            'revision_period' => [
                'nullable',
                'in:trimestriala,semestriala,anuala,la_cerere',
            ],

            'work_type' => [
                'nullable',
                'string',
                'max:255',
            ],

            'priority' => [
                'required',
                'string',
                'max:50',
            ],

            'status' => [
                'required',
                'string',
                'max:50',
            ],

            'scheduled_date' => [
                'nullable',
                'date',
            ],

            'scheduled_time' => [
                'nullable',
            ],

            'materials' => [
                'nullable',
                'string',
            ],

            'materials_used' => [
                'nullable',
                'array',
            ],

            'materials_used.*.product_id' => [
                'required',
                'integer',
                'exists:products,id',
            ],

            'materials_used.*.quantity' => [
                'required',
                'numeric',
                'min:0.01',
            ],

            'notes' => [
                'nullable',
                'string',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'address' => [
                'nullable',
                'string',
            ],

            'contact_person' => [
                'nullable',
                'string',
            ],

            'phone' => [
                'nullable',
                'string',
            ],
        ]);

        $validated['work_type'] = $validated['work_type'] ?? $validated['type'];

        if (!ClientRevision::isRevisionWorkType($validated['type'])) {
            $validated['revision_period'] = null;
        }

        $clientName = trim($validated['client_name']);
        $client = !empty($validated['client_id'])
            ? Client::find($validated['client_id'])
            : null;

        if (!$client || mb_strtolower(trim($client->name)) !== mb_strtolower($clientName)) {
            $client = Client::query()
                ->whereRaw('LOWER(name) = ?', [mb_strtolower($clientName)])
                ->first();
        }

        if (!$client) {
            abort_if(
                $user?->isTechnician() && !$user->canAccessModule('client_creation'),
                403,
                'Nu ai dreptul să adaugi clienți noi.'
            );

            $client = Client::create([
                'name' => $clientName,
            ]);
        }

        $validated['client_id'] = $client->id;
        unset($validated['client_name']);

        if (
            !empty($validated['scheduled_date']) &&
            ($validated['status'] ?? 'noua') === 'noua'
        ) {
            $validated['status'] = 'programata';
        }

        if ($user?->isTechnician()) {
            $validated['employee_id'] = $user->employee_id;
            $validated['employee_ids'] = [$user->employee_id];
            $validated['status'] = 'noua';
            $validated['materials_used'] = [];
        }

        if (($validated['status'] ?? null) === 'finalizata') {
            $validated['completed_at'] = now();
        }

        $validated['number'] = 'WO-' . date('YmdHis');

        /*
        |--------------------------------------------------------------------------
        | TEHNICIENI
        |--------------------------------------------------------------------------
        |
        | employee_ids reprezinta lista completa de tehnicieni.
        |
        | employee_id ramane tehnicianul principal pentru compatibilitate
        | cu codul existent.
        |
        */

        $employeeIds = collect(
            $validated['employee_ids'] ?? []
        )
            ->map(fn ($id) => (int) $id)
            ->filter(fn ($id) => $id > 0)
            ->unique()
            ->values()
            ->all();

        if (
            empty($employeeIds) &&
            !empty($validated['employee_id'])
        ) {
            $employeeIds = [
                (int) $validated['employee_id'],
            ];
        }

        if (
            !empty($employeeIds) &&
            empty($validated['employee_id'])
        ) {
            $validated['employee_id'] = $employeeIds[0];
        }

        unset($validated['employee_ids']);

        $materialsUsed = $this->normalizeMaterials(
            $validated['materials_used'] ?? []
        );

        unset($validated['materials_used']);

        $workOrder = DB::transaction(function () use (
            $validated,
            $employeeIds,
            $materialsUsed
        ) {
            $workOrder = WorkOrder::create($validated);

            $this->syncEmployees(
                $workOrder,
                $employeeIds
            );

            $this->syncMaterials(
                $workOrder,
                $materialsUsed,
                true
            );

            return $workOrder;
        });

        if ($workOrder->status === 'finalizata') {
            $workOrder->refresh();
            ClientRevision::recordCompletion($workOrder);
        }

        $this->publishWorkOrderEvent(
            'work_order.created',
            $workOrder,
            $user,
            ['dedupe_context' => 'created:' . $workOrder->id]
        );

        if (!empty($employeeIds)) {
            $this->publishWorkOrderEvent(
                'work_order.assigned',
                $workOrder,
                $user,
                [
                    'employee_ids' => $employeeIds,
                    'dedupe_context' => 'assigned:' . $workOrder->id . ':' . implode(',', $employeeIds),
                ]
            );
        }

        if ($workOrder->scheduled_date) {
            $this->publishWorkOrderEvent(
                'work_order.scheduled',
                $workOrder,
                $user,
                ['dedupe_context' => 'scheduled:' . $workOrder->id . ':' . $workOrder->scheduled_date->format('Y-m-d') . ':' . ($workOrder->scheduled_time ?? '')]
            );
        }

        return redirect()
            ->route('work_orders.show', $workOrder)
            ->with(
                'success',
                'Lucrarea a fost creata cu succes.'
            );
    }

    /**
     * Vizualizare lucrare.
     */
    public function show(WorkOrder $workOrder)
    {
        $this->ensureWorkOrderAccess($workOrder);

        $workOrder->load([
            'client',
            'employee',
            'employees',
            'license',
            'photos',
            'documents',
            'timeEntries.employee',
            'materialsUsed.product',
            'stockMovements.product',
            'stockMovements.user',
        ]);

        if (!request()->user()?->isAdministrator()) {
            $workOrder->timeEntries->each->makeHidden([
                'start_latitude',
                'start_longitude',
                'start_accuracy',
                'stop_latitude',
                'stop_longitude',
                'stop_accuracy',
            ]);
        }

        $quotes = request()->user()?->isTechnician()
            ? collect()
            : Quote::with([
                'items',
                'client',
                'license',
            ])
                ->where(
                    'work_order_id',
                    $workOrder->id
                )
                ->latest()
                ->get();

        // Materialele scrise liber într-o ofertă nu au produs asociat și nu
        // pot genera o mișcare de stoc. Le trimitem separat pentru a fi
        // afișate clar în lucrare, fără a le confunda cu stocul consumat.
        $unlinkedOfferMaterials = Quote::with('items')
            ->where('work_order_id', $workOrder->id)
            ->where('type', 'oferta')
            ->get()
            ->flatMap(fn (Quote $quote) => $quote->items)
            ->filter(fn ($item) => $item->type === 'material' && empty($item->product_id))
            ->map(fn ($item) => [
                'id' => $item->id,
                'name' => $item->name,
                'unit' => $item->unit,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
            ])
            ->values();

        return Inertia::render('WorkOrders/Show', [
            'workOrder' => $workOrder,
            'quotes' => $quotes,
            'unlinkedOfferMaterials' => $unlinkedOfferMaterials,

            'products' => request()->user()?->isTechnician()
                ? []
                : Product::where('active', true)
                    ->orderBy('name')
                    ->get([
                        'id',
                        'name',
                        'code',
                        'ean',
                        'unit',
                        'stock_quantity',
                        'purchase_price',
                    ]),
        ]);
    }

    /**
     * Adauga fotografii la lucrare.
     */
    public function storePhoto(
        Request $request,
        WorkOrder $workOrder
    ) {
        $this->ensureWorkOrderAccess($workOrder);

        $validated = $request->validate([
            'photos' => [
                'required',
                'array',
                'min:1',
            ],

            'photos.*' => [
                'required',
                'file',
                'max:20480',
                function (string $attribute, $photo, \Closure $fail) {
                    $extension = strtolower($photo->getClientOriginalExtension());

                    if (!in_array($extension, ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'], true)) {
                        $fail('Fotografia trebuie să fie JPG, PNG, WEBP sau HEIC.');
                    }
                },
            ],

            'type' => [
                'required',
                'string',
                'in:before,during,after',
            ],

            'notes' => [
                'nullable',
                'string',
                'max:1000',
            ],
        ]);

        foreach ($validated['photos'] as $photo) {
            $path = $this->storeWorkOrderPhoto($photo, $workOrder->id);

            WorkOrderPhoto::create([
                'work_order_id' => $workOrder->id,
                'file' => $path,
                'original_name' => $photo->getClientOriginalName(),
                'type' => $validated['type'],
                'notes' => $validated['notes'] ?? null,
            ]);
        }

        return back()->with(
            'success',
            count($validated['photos']) . ' fotografii au fost încărcate cu succes.'
        );
    }

    /** Convertește fotografiile HEIC de iPhone în JPEG pentru desktop. */
    private function storeWorkOrderPhoto($photo, int $workOrderId): string
    {
        $directory = 'work-orders/' . $workOrderId;
        $extension = strtolower($photo->getClientOriginalExtension());

        if (!in_array($extension, ['heic', 'heif'], true)) {
            return $photo->store($directory, 'public');
        }

        $temporaryBase = tempnam(sys_get_temp_dir(), 'electrocrm-photo-');
        $temporaryJpeg = $temporaryBase . '.jpg';
        @unlink($temporaryBase);

        try {
            exec(
                '/usr/bin/sips -s format jpeg ' . escapeshellarg($photo->getRealPath()) . ' --out ' . escapeshellarg($temporaryJpeg) . ' 2>&1',
                $output,
                $exitCode
            );

            if ($exitCode !== 0 || !is_file($temporaryJpeg)) {
                throw ValidationException::withMessages([
                    'photos' => 'Una dintre fotografiile HEIC nu a putut fi convertită. Încearcă să o trimiți ca JPEG.',
                ]);
            }

            return Storage::disk('public')->putFileAs(
                $directory,
                new File($temporaryJpeg),
                Str::random(40) . '.jpg'
            );
        } finally {
            @unlink($temporaryJpeg);
        }
    }

    /**
     * Sterge o fotografie din lucrare.
     */
    public function destroyPhoto(
        WorkOrder $workOrder,
        WorkOrderPhoto $photo
    ) {
        $this->ensureWorkOrderAccess($workOrder);
        abort_if(request()->user()?->isTechnician(), 403, 'Tehnicienii nu pot șterge fotografii dintr-o lucrare.');

        if (
            (int) $photo->work_order_id !==
            (int) $workOrder->id
        ) {
            abort(404);
        }

        if (
            $photo->file &&
            Storage::disk('public')->exists($photo->file)
        ) {
            Storage::disk('public')->delete(
                $photo->file
            );
        }

        $photo->delete();

        return back()->with(
            'success',
            'Fotografia a fost stearsa.'
        );
    }

    /**
     * Formular editare lucrare.
     */
    public function edit(WorkOrder $workOrder)
    {
        abort_if(request()->user()?->isTechnician(), 403, 'Tehnicienii nu pot modifica planificarea unei lucrări.');

        $workOrder->load([
            'client',
            'employee',
            'employees',
            'license',
            'photos',
            'timeEntries.employee',
            'materialsUsed.product',
        ]);

        return Inertia::render('WorkOrders/Edit', [
            'workOrder' => $workOrder,

            'clients' => Client::orderBy('name')->get(),

            'employees' => Employee::orderBy('name')->get(),

            'licenses' => License::where('active', true)
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

            'products' => Product::where('active', true)
                ->orderBy('name')
                ->get([
                    'id',
                    'name',
                    'code',
                    'ean',
                    'unit',
                    'stock_quantity',
                    'purchase_price',
                ]),
        ]);
    }

    /**
     * Actualizare lucrare.
     */
    public function update(
        Request $request,
        WorkOrder $workOrder
    ) {
        abort_if($request->user()?->isTechnician(), 403, 'Tehnicienii nu pot modifica planificarea, tehnicienii alocați sau materialele unei lucrări.');

        $previousStatus = $workOrder->status;
        $previousScheduledDate = $workOrder->scheduled_date?->format('Y-m-d');
        $previousScheduledTime = $workOrder->scheduled_time ? substr((string) $workOrder->scheduled_time, 0, 5) : null;
        $previousEmployeeIds = $workOrder->employees()
            ->pluck('employees.id')
            ->map(fn ($id) => (int) $id)
            ->values()
            ->all();

        if (empty($previousEmployeeIds) && $workOrder->employee_id) {
            $previousEmployeeIds = [(int) $workOrder->employee_id];
        }

        $validated = $request->validate([
            'client_id' => [
                'required',
                'exists:clients,id',
            ],

            'employee_id' => [
                'nullable',
                'exists:employees,id',
            ],

            'employee_ids' => [
                'nullable',
                'array',
            ],

            'employee_ids.*' => [
                'integer',
                'exists:employees,id',
            ],

            'license_id' => [
                'nullable',
                'exists:licenses,id',
            ],

            'type' => [
                'required',
                'string',
                'max:255',
            ],

            'revision_period' => [
                'nullable',
                'in:trimestriala,semestriala,anuala,la_cerere',
            ],

            'priority' => [
                'required',
                'string',
                'max:50',
            ],

            'status' => [
                'required',
                'string',
                'max:50',
            ],

            'scheduled_date' => [
                'nullable',
                'date',
            ],

            'scheduled_time' => [
                'nullable',
            ],

            'materials' => [
                'nullable',
                'string',
            ],

            'materials_used' => [
                'nullable',
                'array',
            ],

            'materials_used.*.product_id' => [
                'required',
                'integer',
                'exists:products,id',
            ],

            'materials_used.*.quantity' => [
                'required',
                'numeric',
                'min:0.01',
            ],

            'notes' => [
                'nullable',
                'string',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'address' => [
                'nullable',
                'string',
            ],

            'contact_person' => [
                'nullable',
                'string',
            ],

            'phone' => [
                'nullable',
                'string',
            ],
        ]);

        if (
            !empty($validated['scheduled_date']) &&
            ($validated['status'] ?? 'noua') === 'noua'
        ) {
            $validated['status'] = 'programata';
        }

        if (
            empty($validated['scheduled_date']) &&
            $workOrder->status === 'programata' &&
            ($validated['status'] ?? null) === 'programata'
        ) {
            $validated['status'] = 'noua';
        }

        if (!ClientRevision::isRevisionWorkType($validated['type'])) {
            $validated['revision_period'] = null;
        }

        if ($previousStatus !== 'finalizata' && ($validated['status'] ?? null) === 'finalizata') {
            $validated['completed_at'] = now();
        }

        /*
        |--------------------------------------------------------------------------
        | TEHNICIENI
        |--------------------------------------------------------------------------
        */

        $employeeIds = collect(
            $validated['employee_ids'] ?? []
        )
            ->map(fn ($id) => (int) $id)
            ->filter(fn ($id) => $id > 0)
            ->unique()
            ->values()
            ->all();

        /*
        | Daca frontend-ul trimite doar employee_id,
        | il pastram ca tehnician principal.
        */
        if (
            empty($employeeIds) &&
            !empty($validated['employee_id'])
        ) {
            $employeeIds = [
                (int) $validated['employee_id'],
            ];
        }

        /*
        | Daca exista o lista de tehnicieni, primul devine
        | automat employee_id pentru compatibilitate.
        */
        if (
            !empty($employeeIds)
        ) {
            $validated['employee_id'] =
                $employeeIds[0];
        } else {
            $validated['employee_id'] = null;
        }

        unset($validated['employee_ids']);

        $materialsUsed = $this->normalizeMaterials(
            $validated['materials_used'] ?? []
        );

        unset($validated['materials_used']);

        DB::transaction(function () use (
            $workOrder,
            $validated,
            $employeeIds,
            $materialsUsed
        ) {
            $workOrder->update(
                $validated
            );

            $this->syncEmployees(
                $workOrder,
                $employeeIds
            );

            $this->syncMaterials(
                $workOrder,
                $materialsUsed,
                false
            );
        });

        $workOrder->refresh();

        if ($previousStatus !== 'finalizata' && $workOrder->status === 'finalizata') {
            ClientRevision::recordCompletion($workOrder);
        }

        $currentScheduledDate = $workOrder->scheduled_date?->format('Y-m-d');
        $currentScheduledTime = $workOrder->scheduled_time ? substr((string) $workOrder->scheduled_time, 0, 5) : null;
        $currentEmployeeIds = $workOrder->employees()
            ->pluck('employees.id')
            ->map(fn ($id) => (int) $id)
            ->values()
            ->all();

        $dedupeContext = 'update:' . $workOrder->id . ':' . $workOrder->updated_at?->format('YmdHis.u');

        if ($previousScheduledDate !== $currentScheduledDate) {
            $this->publishWorkOrderEvent(
                'work_order.rescheduled',
                $workOrder,
                $request->user(),
                ['dedupe_context' => $dedupeContext . ':date']
            );
        } elseif ($previousScheduledTime !== $currentScheduledTime) {
            $this->publishWorkOrderEvent(
                'work_order.time_changed',
                $workOrder,
                $request->user(),
                ['dedupe_context' => $dedupeContext . ':time']
            );
        }

        $addedEmployeeIds = array_values(array_diff($currentEmployeeIds, $previousEmployeeIds));
        $removedEmployeeIds = array_values(array_diff($previousEmployeeIds, $currentEmployeeIds));

        if (!empty($addedEmployeeIds) || !empty($removedEmployeeIds)) {
            $this->publishWorkOrderEvent(
                'work_order.technicians_changed',
                $workOrder,
                $request->user(),
                [
                    'added_employee_ids' => $addedEmployeeIds,
                    'removed_employee_ids' => $removedEmployeeIds,
                    'dedupe_context' => $dedupeContext . ':team:' . implode(',', $addedEmployeeIds) . ':' . implode(',', $removedEmployeeIds),
                ]
            );
        }

        if ($previousStatus !== $workOrder->status) {
            $statusEventKey = match ($workOrder->status) {
                'lucru' => 'work_order.started',
                'finalizata' => 'work_order.completed',
                'anulata' => 'work_order.cancelled',
                default => null,
            };

            if ($statusEventKey) {
                $this->publishWorkOrderEvent(
                    $statusEventKey,
                    $workOrder,
                    $request->user(),
                    ['dedupe_context' => $dedupeContext . ':status:' . $workOrder->status]
                );
            }
        }

        return redirect()
            ->route('work_orders.show', $workOrder)
            ->with(
                'success',
                'Lucrarea, tehnicienii si materialele au fost actualizate.'
            );
    }

    /**
     * Schimbare rapida status.
     *
     * Pontaj automat pentru TOTI tehnicienii alocati.
     */
    public function updateStatus(
        Request $request,
        WorkOrder $workOrder
    ) {
        abort_if($request->user()?->isTechnician(), 403, 'Tehnicienii nu pot schimba statusul general al unei lucrări.');

        $validated = $request->validate([
            'status' => [
                'required',
                'string',
                'in:noua,programata,lucru,finalizata,anulata',
            ],
        ]);

        $newStatus = $validated['status'];
        $oldStatus = $workOrder->status;

        if (
            $newStatus === 'programata' &&
            empty($workOrder->scheduled_date)
        ) {
            return back()->with(
                'error',
                'Pentru statusul "Programata" trebuie sa existe o data programata.'
            );
        }

        DB::transaction(function () use (
            $workOrder,
            $newStatus,
            $oldStatus
        ) {
            $now = now();

            /*
            |--------------------------------------------------------------------------
            | TEHNICIENII ALOCATI
            |--------------------------------------------------------------------------
            |
            | Folosim relatia noua.
            |
            | Daca lucrarea veche nu are inca tehnicieni in pivot,
            | folosim employee_id pentru compatibilitate.
            |
            */

            $employeeIds = $workOrder
                ->employees()
                ->pluck('employees.id')
                ->map(fn ($id) => (int) $id)
                ->unique()
                ->values()
                ->all();

            if (
                empty($employeeIds) &&
                !empty($workOrder->employee_id)
            ) {
                $employeeIds = [
                    (int) $workOrder->employee_id,
                ];

                /*
                | Sincronizam pivotul pentru lucrarile vechi.
                */
                $this->syncEmployees(
                    $workOrder,
                    $employeeIds
                );
            }

            /*
            |--------------------------------------------------------------------------
            | INTRARE IN LUCRU
            |--------------------------------------------------------------------------
            */

            if (
                $newStatus === 'lucru' &&
                $oldStatus !== 'lucru'
            ) {
                if (
                    empty($employeeIds)
                ) {
                    abort(
                        422,
                        'Lucrarea nu are niciun tehnician alocat. Aloca cel putin un tehnician inainte de a porni lucrarea.'
                    );
                }

                foreach (
                    $employeeIds
                    as $employeeId
                ) {
                    $openEntry =
                        WorkOrderTimeEntry::query()
                            ->where(
                                'work_order_id',
                                $workOrder->id
                            )
                            ->where(
                                'employee_id',
                                $employeeId
                            )
                            ->whereNull(
                                'ended_at'
                            )
                            ->latest('started_at')
                            ->first();

                    if (!$openEntry) {
                        WorkOrderTimeEntry::create([
                            'work_order_id' =>
                                $workOrder->id,

                            'employee_id' =>
                                $employeeId,

                            'started_at' =>
                                $now,

                            'ended_at' =>
                                null,

                            'duration_minutes' =>
                                null,

                            'notes' =>
                                'Pontaj automat generat la pornirea lucrarii.',
                        ]);
                    }
                }

                $workOrder->update([
                    'status' =>
                        'lucru',

                    'started_at' =>
                        $workOrder->started_at
                            ?? $now,
                ]);

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | FINALIZARE LUCRARE
            |--------------------------------------------------------------------------
            |
            | Inchidem TOATE intervalele deschise pentru lucrare.
            |--------------------------------------------------------------------------
            */

            if (
                $newStatus === 'finalizata' &&
                $oldStatus !== 'finalizata'
            ) {
                $openEntries =
                    WorkOrderTimeEntry::query()
                        ->where(
                            'work_order_id',
                            $workOrder->id
                        )
                        ->whereNull(
                            'ended_at'
                        )
                        ->get();

                foreach (
                    $openEntries
                    as $openEntry
                ) {
                    $endedAt = $now;

                    $durationMinutes =
                        $openEntry->started_at
                            ->diffInMinutes(
                                $endedAt
                            );

                    $openEntry->update([
                        'ended_at' =>
                            $endedAt,

                        'duration_minutes' =>
                            $durationMinutes,

                        'notes' =>
                            $openEntry->notes
                            ?: 'Pontaj automat inchis la finalizarea lucrarii.',
                    ]);
                }

                $workOrder->update([
                    'status' =>
                        'finalizata',

                    'completed_at' =>
                        $now,
                ]);

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | ANULARE
            |--------------------------------------------------------------------------
            |
            | Inchidem TOATE intervalele deschise.
            |--------------------------------------------------------------------------
            */

            if (
                $newStatus === 'anulata' &&
                $oldStatus !== 'anulata'
            ) {
                $openEntries =
                    WorkOrderTimeEntry::query()
                        ->where(
                            'work_order_id',
                            $workOrder->id
                        )
                        ->whereNull(
                            'ended_at'
                        )
                        ->get();

                foreach (
                    $openEntries
                    as $openEntry
                ) {
                    $endedAt = $now;

                    $durationMinutes =
                        $openEntry->started_at
                            ->diffInMinutes(
                                $endedAt
                            );

                    $openEntry->update([
                        'ended_at' =>
                            $endedAt,

                        'duration_minutes' =>
                            $durationMinutes,

                        'notes' =>
                            $openEntry->notes
                            ?: 'Pontaj automat inchis la anularea lucrarii.',
                    ]);
                }

                $workOrder->update([
                    'status' =>
                        'anulata',
                ]);

                return;
            }

            /*
            |--------------------------------------------------------------------------
            | RESTUL STATUSURILOR
            |--------------------------------------------------------------------------
            */

            $workOrder->update([
                'status' =>
                    $newStatus,
            ]);
        });

        $statusEventKey = match ($newStatus) {
            'programata' => 'work_order.scheduled',
            'lucru' => 'work_order.started',
            'finalizata' => 'work_order.completed',
            'anulata' => 'work_order.cancelled',
            default => null,
        };

        if ($statusEventKey && $oldStatus !== $newStatus) {
            $workOrder->refresh();

            if ($newStatus === 'finalizata') {
                ClientRevision::recordCompletion($workOrder);
            }

            $this->publishWorkOrderEvent(
                $statusEventKey,
                $workOrder,
                $request->user(),
                ['dedupe_context' => 'status:' . $workOrder->id . ':' . $oldStatus . ':' . $newStatus . ':' . $workOrder->updated_at?->format('YmdHis.u')]
            );
        }

        $statusMessages = [
            'noua' =>
                'Lucrarea a fost trecuta in statusul "Noua".',

            'programata' =>
                'Lucrarea a fost programata.',

            'lucru' =>
                'Lucrarea a fost pornita, iar pontajul a inceput automat pentru toti tehnicienii alocati.',

            'finalizata' =>
                'Lucrarea a fost finalizata, iar pontajele au fost inchise automat.',

            'anulata' =>
                'Lucrarea a fost anulata, iar pontajele deschise au fost inchise automat.',
        ];

        return back()->with(
            'success',
            $statusMessages[$newStatus]
                ?? 'Statusul lucrarii a fost actualizat.'
        );
    }

    /**
     * Publică un eveniment de notificare numai după ce modificarea lucrării a fost confirmată.
     *
     * @param array<string, mixed> $payload
     */
    protected function publishWorkOrderEvent(
        string $eventKey,
        WorkOrder $workOrder,
        ?User $actor,
        array $payload = [],
    ): void {
        $workOrder->loadMissing('client');

        DomainNotificationEvent::dispatch(
            $eventKey,
            $workOrder,
            $actor,
            $payload,
        );
    }

    /**
     * Sincronizeaza tehnicienii lucrarii.
     */
    protected function syncEmployees(
        WorkOrder $workOrder,
        array $employeeIds
    ): void {
        $employeeIds = collect($employeeIds)
            ->map(fn ($id) => (int) $id)
            ->filter(fn ($id) => $id > 0)
            ->unique()
            ->values()
            ->all();

        /*
        |--------------------------------------------------------------------------
        | Daca exista pontaje deschise, nu permitem eliminarea
        | tehnicianului din lucrare.
        |--------------------------------------------------------------------------
        */

        if (
            $workOrder->exists &&
            !empty($employeeIds)
        ) {
            $openEmployeeIds =
                WorkOrderTimeEntry::query()
                    ->where(
                        'work_order_id',
                        $workOrder->id
                    )
                    ->whereNull(
                        'ended_at'
                    )
                    ->pluck('employee_id')
                    ->map(fn ($id) => (int) $id)
                    ->unique()
                    ->values()
                    ->all();

            $removedEmployees =
                array_diff(
                    $openEmployeeIds,
                    $employeeIds
                );

            if (
                !empty($removedEmployees)
            ) {
                abort(
                    422,
                    'Nu poti elimina un tehnician care are un pontaj deschis pe aceasta lucrare. Opreste mai intai pontajul tehnicianului.'
                );
            }
        }

        $workOrder->employees()->sync(
            $employeeIds
        );
    }

    /**
     * Proces-verbal editabil + PDF.
     */
    public function report(
        Request $request,
        WorkOrder $workOrder
    ) {
        $this->ensureWorkOrderAccess($workOrder);

        $workOrder->load([
            'client',
            'employee',
            'employees',
            'license',
            'photos',
        ]);

        $latestQuote = Quote::with([
            'items.product',
            'client',
            'license',
        ])
            ->where(
                'work_order_id',
                $workOrder->id
            )
            ->latest()
            ->first();

        if ($request->isMethod('post')) {

            $validated = $request->validate([
                'report_title' => [
                    'required',
                    'string',
                    'max:255',
                ],

                'document_date' => [
                    'required',
                    'date',
                ],

                'work_order_number' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'quote_number' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'quote_title' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'client_name' => [
                    'required',
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

                'technician_name' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'technician_position' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'work_type' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'scheduled_date' => [
                    'nullable',
                    'date',
                ],

                'scheduled_time' => [
                    'nullable',
                    'string',
                    'max:20',
                ],

                'work_address' => [
                    'nullable',
                    'string',
                    'max:1000',
                ],

                'description' => [
                    'nullable',
                    'string',
                ],

                'work_performed' => [
                    'nullable',
                    'string',
                ],

                'conclusion' => [
                    'nullable',
                    'string',
                ],

                'observations' => [
                    'nullable',
                    'string',
                ],

                'commission_president' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'commission_members' => [
                    'nullable',
                    'string',
                ],

                'beneficiary_representative' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'contractor_representative' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'reception_result' => [
                    'nullable',
                    'string',
                    'in:admis,admis_cu_obiectii,respins',
                ],

                'deficiencies' => [
                    'nullable',
                    'string',
                ],

                'remediation_deadline' => [
                    'nullable',
                    'date',
                ],

                'commission_observations' => [
                    'nullable',
                    'string',
                ],

                'provider_signature_name' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'client_signature_name' => [
                    'nullable',
                    'string',
                    'max:255',
                ],
            ]);

            $reportType = $request->input(
                'report_type',
                'interventie'
            );

            $pdf = Pdf::loadView(
                'work_orders.report',
                [
                    'workOrder' =>
                        $workOrder,

                    'latestQuote' =>
                        $latestQuote,

                    'reportData' =>
                        $validated,

                    'reportType' =>
                        $reportType,

                    'generatedAt' =>
                        now(),
                ]
            );

            $pdf->setPaper(
                'A4',
                'portrait'
            );

            $safeNumber =
                preg_replace(
                    '/[^A-Za-z0-9\-_]/',
                    '_',
                    $validated[
                        'work_order_number'
                    ] ?: (
                        $workOrder->number
                        ?? 'Lucrare'
                    )
                );

            $fileName =
                'Proces-Verbal-' .
                $safeNumber .
                '.pdf';

            return $pdf->stream(
                $fileName
            );
        }

        $reportType =
            $request->query(
                'type',
                'interventie'
            );

        $reportTitles = [
            'interventie' =>
                'PROCES-VERBAL DE INTERVENTIE',

            'service' =>
                'PROCES-VERBAL DE SERVICE',

            'punere_in_functiune' =>
                'PROCES-VERBAL DE PUNERE IN FUNCTIUNE',

            'receptie' =>
                'PROCES-VERBAL DE RECEPTIE LA TERMINAREA LUCRARILOR',

            'constatare' =>
                'PROCES-VERBAL DE CONSTATARE',

            'lucrare' =>
                'PROCES-VERBAL',
        ];

        $defaultTitle =
            $reportTitles[$reportType]
            ?? 'PROCES-VERBAL DE INTERVENTIE';

        if (
            $reportType === 'lucrare'
        ) {
            $defaultTitle =
                $latestQuote?->title
                ?? $workOrder->type
                ?? 'PROCES-VERBAL';
        }

        return view(
            'work_orders.report_edit',
            [
                'workOrder' =>
                    $workOrder,

                'latestQuote' =>
                    $latestQuote,

                'reportType' =>
                    $reportType,

                'defaultTitle' =>
                    $defaultTitle,
            ]
        );
    }

    /**
     * Stergere lucrare.
     *
     * Materialele sunt returnate in stoc.
     */
    public function destroy(
        WorkOrder $workOrder
    ) {
        abort_if(request()->user()?->isTechnician(), 403, 'Tehnicienii nu pot șterge lucrări.');

        DB::transaction(function () use ($workOrder) {

            $workOrder->load([
                'materialsUsed.product',
                'photos',
            ]);

            foreach (
                $workOrder->photos
                as $photo
            ) {
                if (
                    $photo->file &&
                    Storage::disk('public')->exists(
                        $photo->file
                    )
                ) {
                    Storage::disk('public')->delete(
                        $photo->file
                    );
                }

                $photo->delete();
            }

            foreach (
                $workOrder->materialsUsed
                as $material
            ) {

                $product =
                    Product::query()
                        ->lockForUpdate()
                        ->find(
                            $material->product_id
                        );

                if (!$product) {
                    continue;
                }

                $stockBefore =
                    (float)
                    $product->stock_quantity;

                $quantity =
                    (float)
                    $material->quantity;

                $stockAfter =
                    $stockBefore +
                    $quantity;

                StockMovement::create([
                    'product_id' =>
                        $product->id,

                    'type' =>
                        'in',

                    'quantity' =>
                        $quantity,

                    'stock_before' =>
                        $stockBefore,

                    'stock_after' =>
                        $stockAfter,

                    'unit_price' =>
                        $material->unit_price
                        ?? $product->purchase_price,

                    'reference_type' =>
                        'work_order_reversal',

                    'reference_id' =>
                        $workOrder->id,

                    'document_number' =>
                        $workOrder->number,

                    'reason' =>
                        'Returnare materiale la stergerea lucrarii',

                    'work_order_id' =>
                        $workOrder->id,

                    'user_id' =>
                        auth()->id(),

                    'notes' =>
                        'Material returnat automat in stoc la stergerea lucrarii.',
                ]);

                $product->update([
                    'stock_quantity' =>
                        $stockAfter,
                ]);
            }

            /*
            |--------------------------------------------------------------------------
            | Stergem explicit alocarile tehnicienilor.
            |--------------------------------------------------------------------------
            */
            WorkOrderEmployee::query()
                ->where(
                    'work_order_id',
                    $workOrder->id
                )
                ->delete();

            /*
            |--------------------------------------------------------------------------
            | Stergem lucrarea.
            |--------------------------------------------------------------------------
            */
            $workOrder->delete();
        });

        return redirect()
            ->route('work_orders.index')
            ->with(
                'success',
                'Lucrarea a fost stearsa, iar materialele au fost returnate in stoc.'
            );
    }

    /**
     * QR lucrare.
     */
    public function qr(
        WorkOrder $workOrder
    ) {
        $this->ensureWorkOrderAccess($workOrder);

        $url = URL::signedRoute(
            'work_orders.scan',
            [
                'workOrder' =>
                    $workOrder->id,
            ]
        );

        $qr =
            QrCode::format('svg')
                ->size(500)
                ->margin(2)
                ->errorCorrection('H')
                ->generate($url);

        return response($qr)
            ->header(
                'Content-Type',
                'image/svg+xml'
            )
            ->header(
                'Cache-Control',
                'no-store, no-cache, must-revalidate'
            );
    }

    /**
     * Scanare QR.
     */
    public function scan(
        WorkOrder $workOrder
    ) {
        $this->ensureWorkOrderAccess($workOrder);

        return redirect()->route(
            'work_orders.show',
            $workOrder
        );
    }

    /**
     * Normalizeaza materialele.
     */
    protected function normalizeMaterials(
        array $materials
    ): array {
        $normalized = [];

        foreach ($materials as $material) {

            $productId =
                (int) (
                    $material['product_id']
                    ?? 0
                );

            $quantity =
                (float) (
                    $material['quantity']
                    ?? 0
                );

            if (
                $productId <= 0 ||
                $quantity <= 0
            ) {
                continue;
            }

            if (
                isset(
                    $normalized[$productId]
                )
            ) {
                $normalized[$productId]['quantity'] +=
                    $quantity;
            } else {
                $normalized[$productId] = [
                    'product_id' =>
                        $productId,

                    'quantity' =>
                        $quantity,
                ];
            }
        }

        return array_values(
            $normalized
        );
    }



    /**
     * Sincronizare materiale.
     */
    protected function syncMaterials(
        WorkOrder $workOrder,
        array $newMaterials,
        bool $creating = false
    ): void {
        $oldMaterials =
            $workOrder->materialsUsed()
                ->get()
                ->keyBy('product_id');

        $newMaterialsByProduct =
            collect($newMaterials)
                ->keyBy('product_id');

        $allProductIds =
            collect(
                array_merge(
                    $oldMaterials
                        ->keys()
                        ->all(),

                    $newMaterialsByProduct
                        ->keys()
                        ->all()
                )
            )
                ->map(
                    fn ($id) =>
                        (int) $id
                )
                ->unique()
                ->values();

        foreach (
            $allProductIds
            as $productId
        ) {

            $oldMaterial =
                $oldMaterials->get(
                    $productId
                );

            $newMaterial =
                $newMaterialsByProduct->get(
                    $productId
                );

            $oldQuantity =
                $oldMaterial
                    ? (float)
                        $oldMaterial->quantity
                    : 0;

            $newQuantity =
                $newMaterial
                    ? (float)
                        $newMaterial['quantity']
                    : 0;

            $difference =
                $newQuantity -
                $oldQuantity;

            if (
                abs($difference) <
                0.00001
            ) {

                if (
                    $oldMaterial &&
                    $newMaterial
                ) {
                    $this->updateMaterialRow(
                        $oldMaterial,
                        $newQuantity
                    );
                }

                continue;
            }

            $product =
                Product::query()
                    ->lockForUpdate()
                    ->findOrFail(
                        $productId
                    );

            $currentStock =
                (float)
                $product->stock_quantity;

            if (
                $difference > 0
            ) {

                $this->createStockOut(
                    $workOrder,
                    $product,
                    $difference,
                    $currentStock
                );
            }

            if (
                $difference < 0
            ) {

                $this->createStockIn(
                    $workOrder,
                    $product,
                    abs($difference),
                    $currentStock
                );
            }

            if (
                $newQuantity > 0
            ) {

                $unitPrice =
                    $oldMaterial?->unit_price
                    ?? $product->purchase_price
                    ?? 0;

                $totalPrice =
                    round(
                        $newQuantity *
                        (float) $unitPrice,
                        2
                    );

                if ($oldMaterial) {

                    $oldMaterial->update([
                        'quantity' =>
                            $newQuantity,

                        'unit_price' =>
                            $unitPrice,

                        'total_price' =>
                            $totalPrice,
                    ]);

                } else {

                    WorkOrderMaterial::create([
                        'work_order_id' =>
                            $workOrder->id,

                        'product_id' =>
                            $product->id,

                        'quantity' =>
                            $newQuantity,

                        'unit_price' =>
                            $unitPrice,

                        'total_price' =>
                            $totalPrice,
                    ]);
                }

            } elseif ($oldMaterial) {

                $oldMaterial->delete();
            }
        }
    }

    /**
     * Iesire stoc.
     */
    protected function createStockOut(
        WorkOrder $workOrder,
        Product $product,
        float $quantity,
        float $stockBefore
    ): void {
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
                ', necesar suplimentar: ' .
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
                $product->purchase_price,

            'reference_type' =>
                'work_order_material',

            'reference_id' =>
                $workOrder->id,

            'document_number' =>
                $workOrder->number,

            'reason' =>
                'Consum material in lucrare',

            'work_order_id' =>
                $workOrder->id,

            'user_id' =>
                auth()->id(),

            'notes' =>
                'Consum automat de material din lucrare.',
        ]);

        $product->update([
            'stock_quantity' =>
                $stockAfter,
        ]);
    }

    /**
     * Intrare stoc.
     */
    protected function createStockIn(
        WorkOrder $workOrder,
        Product $product,
        float $quantity,
        float $stockBefore
    ): void {
        $stockAfter =
            $stockBefore +
            $quantity;

        StockMovement::create([
            'product_id' =>
                $product->id,

            'type' =>
                'in',

            'quantity' =>
                $quantity,

            'stock_before' =>
                $stockBefore,

            'stock_after' =>
                $stockAfter,

            'unit_price' =>
                $product->purchase_price,

            'reference_type' =>
                'work_order_material_return',

            'reference_id' =>
                $workOrder->id,

            'document_number' =>
                $workOrder->number,

            'reason' =>
                'Returnare material din lucrare',

            'work_order_id' =>
                $workOrder->id,

            'user_id' =>
                auth()->id(),

            'notes' =>
                'Material returnat automat in stoc la modificarea consumului.',
        ]);

        $product->update([
            'stock_quantity' =>
                $stockAfter,
        ]);
    }

    /**
     * Actualizeaza randul materialului.
     */
    protected function updateMaterialRow(
        WorkOrderMaterial $material,
        float $quantity
    ): void {
        $unitPrice =
            $material->unit_price ??
            0;

                $material->update([
            'quantity' =>
                $quantity,
            'total_price' =>
                round(
                    $quantity *
                    (float) $unitPrice,
                    2
                ),
        ]);
    }

    public function storeDocument(Request $request, WorkOrder $workOrder)
    {
        $this->ensureWorkOrderAccess($workOrder);
        $validated = $request->validate(['documents' => ['required', 'array', 'min:1'], 'documents.*' => ['required', 'file', 'max:20480']]);

        foreach ($validated['documents'] as $document) {
            $workOrder->documents()->create([
                'original_name' => $document->getClientOriginalName(),
                'path' => $document->store('work-order-documents/' . $workOrder->id, 'public'),
                'mime_type' => $document->getClientMimeType(),
                'size' => $document->getSize(),
                'uploaded_by' => $request->user()->id,
            ]);
        }

        return back()->with('success', 'Documentele au fost încărcate.');
    }

    public function downloadDocument(WorkOrder $workOrder, \App\Models\DocumentAttachment $document)
    {
        $this->ensureWorkOrderAccess($workOrder);
        abort_unless($document->attachable_type === WorkOrder::class && (int) $document->attachable_id === (int) $workOrder->id, 404);
        abort_unless(Storage::disk('public')->exists($document->path), 404, 'Fișierul nu mai există.');

        return Storage::disk('public')->download($document->path, $document->original_name);
    }

    public function destroyDocument(WorkOrder $workOrder, \App\Models\DocumentAttachment $document)
    {
        $this->ensureWorkOrderAccess($workOrder);
        abort_if(request()->user()?->isTechnician(), 403, 'Tehnicienii nu pot șterge documente dintr-o lucrare.');
        abort_unless($document->attachable_type === WorkOrder::class && (int) $document->attachable_id === (int) $workOrder->id, 404);
        Storage::disk('public')->delete($document->path);
        $document->delete();

        return back()->with('success', 'Documentul a fost șters.');
    }

    protected function ensureWorkOrderAccess(WorkOrder $workOrder): void
    {
        $user = request()->user();

        if (!$user?->isTechnician()) {
            return;
        }

        abort_unless($user->employee_id, 403, 'Contul de tehnician nu este asociat unui angajat.');

        $isAssigned = (int) $workOrder->employee_id === (int) $user->employee_id
            || $workOrder->employees()->whereKey($user->employee_id)->exists();

        abort_unless($isAssigned, 403, 'Poți accesa numai lucrările la care ești alocat.');
    }
}
