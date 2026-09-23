<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Employee;
use App\Models\WorkOrderTimeEntry;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Exports\AttendanceExport;
use Barryvdh\DomPDF\Facade\Pdf;

class AttendanceController extends Controller
{
    /**
     * Afișează pontajul pentru luna selectată.
     *
     * Pontajul ține cont de:
     *
     * 1. Pontajul manual din Attendance.
     * 2. Timpul lucrat pe lucrări din WorkOrderTimeEntry.
     *
     * Dacă există pontaj manual cu ore > 0,
     * acesta are prioritate.
     *
     * Dacă există pontaj manual cu 0 ore,
     * iar există timp lucrat pe lucrări,
     * timpul lucrat pe lucrări este folosit.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        if ($user?->isTechnician()) {
            abort_unless($user->employee_id, 403, 'Contul de tehnician nu este asociat unui angajat.');
        }

        $month = (int) $request->get(
            'month',
            now()->month
        );

        $year = (int) $request->get(
            'year',
            now()->year
        );

        if ($month < 1 || $month > 12) {
            $month = now()->month;
        }

        if ($year < 2000 || $year > 2100) {
            $year = now()->year;
        }

        $startDate = Carbon::create(
            $year,
            $month,
            1
        )->startOfDay();

        $endDate = Carbon::create(
            $year,
            $month,
            1
        )->endOfMonth()->endOfDay();

        /*
        |--------------------------------------------------------------------------
        | ANGAJATI ACTIVI
        |--------------------------------------------------------------------------
        */

        $employees = Employee::query()
            ->where('active', true)
            ->orderBy('name');

        if ($user?->isTechnician()) {
            $employees->whereKey($user->employee_id);
        }

        $employees = $employees->get([
            'id',
            'name',
            'position',
        ]);

        /*
        |--------------------------------------------------------------------------
        | PONTAJE MANUALE
        |--------------------------------------------------------------------------
        */

        $attendances = Attendance::query()
            ->when($user?->isTechnician(), fn ($query) => $query->where('employee_id', $user->employee_id))
            ->where(
                'date',
                '>=',
                $startDate->toDateString()
            )
            ->where(
                'date',
                '<=',
                $endDate->toDateString()
            )
            ->get()
            ->groupBy('employee_id');

        /*
        |--------------------------------------------------------------------------
        | TIMP LUCRAT PE LUCRARI
        |--------------------------------------------------------------------------
        */

        $workTimeEntries = WorkOrderTimeEntry::query()
            ->when($user?->isTechnician(), fn ($query) => $query->where('employee_id', $user->employee_id))
            ->where(
                'started_at',
                '>=',
                $startDate
            )
            ->where(
                'started_at',
                '<=',
                $endDate
            )
            ->get()
            ->groupBy('employee_id');

        /*
        |--------------------------------------------------------------------------
        | ZILELE LUNII
        |--------------------------------------------------------------------------
        */

        $days = [];

        $currentDate = $startDate->copy();

        while ($currentDate->lte($endDate)) {
            $days[] = [
                'date' =>
                    $currentDate->toDateString(),

                'day' =>
                    $currentDate->day,

                'weekday' =>
                    $currentDate
                        ->locale('ro')
                        ->dayName,

                'is_weekend' =>
                    $currentDate->isWeekend(),
            ];

            $currentDate->addDay();
        }

        /*
        |--------------------------------------------------------------------------
        | RÂNDURI ANGAJATI
        |--------------------------------------------------------------------------
        */

        $rows = $employees
            ->map(function ($employee) use (
                $attendances,
                $workTimeEntries
            ) {

                /*
                |--------------------------------------------------------------------------
                | PONTAJE MANUALE
                |--------------------------------------------------------------------------
                */

                $employeeAttendances =
                    $attendances->get(
                        $employee->id,
                        collect()
                    )->keyBy(function ($attendance) {

                        return Carbon::parse(
                            $attendance->date
                        )->toDateString();
                    });

                /*
                |--------------------------------------------------------------------------
                | TIMP LUCRAT PE LUCRARI
                |--------------------------------------------------------------------------
                */

                $employeeWorkEntries =
                    $workTimeEntries->get(
                        $employee->id,
                        collect()
                    );

                $workOrderByDate = [];

                foreach (
                    $employeeWorkEntries
                    as $entry
                ) {

                    if (!$entry->started_at) {
                        continue;
                    }

                    $startedAt = Carbon::parse(
                        $entry->started_at
                    );

                    $date =
                        $startedAt->toDateString();

                    if (
                        $entry->duration_minutes !== null
                    ) {

                        $minutes =
                            (int)
                            $entry->duration_minutes;

                    } else {

                        $minutes =
                            $startedAt->diffInMinutes(
                                now()
                            );
                    }

                    if ($minutes < 0) {
                        $minutes = 0;
                    }

                    $workOrderByDate[$date] =
                        (
                            $workOrderByDate[$date]
                            ?? 0
                        ) + $minutes;
                }

                /*
                |--------------------------------------------------------------------------
                | TOATE DATELE
                |--------------------------------------------------------------------------
                */

                $allDates = collect(
                    array_unique(
                        array_merge(
                            $employeeAttendances
                                ->keys()
                                ->all(),

                            array_keys(
                                $workOrderByDate
                            )
                        )
                    )
                )
                    ->sort()
                    ->values();

                $combinedAttendances =
                    collect();

                foreach ($allDates as $date) {

                    $attendance =
                        $employeeAttendances->get(
                            $date
                        );

                    $workOrderMinutes =
                        (int) (
                            $workOrderByDate[$date]
                            ?? 0
                        );

                    $workOrderHours =
                        round(
                            $workOrderMinutes / 60,
                            2
                        );

                    /*
                    |--------------------------------------------------------------------------
                    | PRIORITATE PONTAJ MANUAL
                    |--------------------------------------------------------------------------
                    */

                    if (
                        $attendance &&
                        (float)
                            $attendance->worked_hours > 0
                    ) {

                        $workedHours =
                            (float)
                            $attendance->worked_hours;

                        $status =
                            $attendance->status;

                        $checkIn =
                            $attendance->check_in;

                        $checkOut =
                            $attendance->check_out;

                        $breakMinutes =
                            (int)
                            $attendance->break_minutes;

                        $notes =
                            $attendance->notes;

                        $attendanceId =
                            $attendance->id;

                    } elseif (
                        $workOrderMinutes > 0 &&
                        !$attendance
                    ) {

                        /*
                        |--------------------------------------------------------------------------
                        | PONTAJ GENERAT DIN LUCRARI
                        |--------------------------------------------------------------------------
                        */

                        $workedHours =
                            $workOrderHours;

                        $status =
                            'prezent';

                        $dayEntries =
                            $employeeWorkEntries
                                ->filter(function ($entry) use (
                                    $date
                                ) {

                                    return $entry->started_at &&
                                        Carbon::parse(
                                            $entry->started_at
                                        )->toDateString() === $date;
                                });

                        $firstEntry =
                            $dayEntries
                                ->sortBy('started_at')
                                ->first();

                        $lastEntry =
                            $dayEntries
                                ->sortByDesc(function ($entry) {

                                    return $entry->ended_at
                                        ?? $entry->started_at;
                                })
                                ->first();

                        $checkIn =
                            $firstEntry?->started_at
                                ? Carbon::parse(
                                    $firstEntry->started_at
                                )->format('H:i')
                                : null;

                        $checkOut =
                            $lastEntry?->ended_at
                                ? Carbon::parse(
                                    $lastEntry->ended_at
                                )->format('H:i')
                                : null;

                        $breakMinutes = 0;

                        $notes =
                            'Pontaj generat automat din timpul lucrat pe lucrari.';

                        $attendanceId = null;

                    } else {

                        /*
                        |--------------------------------------------------------------------------
                        | PONTAJ MANUAL CU 0 ORE
                        |--------------------------------------------------------------------------
                        */

                        if (!$attendance) {
                            continue;
                        }

                        $workedHours = 0;

                        $status =
                            $attendance->status;

                        $checkIn =
                            $attendance->check_in;

                        $checkOut =
                            $attendance->check_out;

                        $breakMinutes =
                            (int)
                            $attendance->break_minutes;

                        $notes =
                            $attendance->notes;

                        $attendanceId =
                            $attendance->id;
                    }

                    $combinedAttendances->put(
                        $date,
                        [
                            'id' =>
                                $attendanceId,

                            'date' =>
                                $date,

                            'check_in' =>
                                $checkIn
                                    ? (
                                        strlen(
                                            (string)
                                            $checkIn
                                        ) > 5
                                            ? Carbon::parse(
                                                $checkIn
                                            )->format('H:i')
                                            : substr(
                                                $checkIn,
                                                0,
                                                5
                                            )
                                    )
                                    : null,

                            'check_out' =>
                                $checkOut
                                    ? (
                                        strlen(
                                            (string)
                                            $checkOut
                                        ) > 5
                                            ? Carbon::parse(
                                                $checkOut
                                            )->format('H:i')
                                            : substr(
                                                $checkOut,
                                                0,
                                                5
                                            )
                                    )
                                    : null,

                            'break_minutes' =>
                                $breakMinutes,

                            'worked_hours' =>
                                round(
                                    $workedHours,
                                    2
                                ),

                            'work_order_hours' =>
                                $workOrderHours,

                            'work_order_minutes' =>
                                $workOrderMinutes,

                            'status' =>
                                $status,

                            'notes' =>
                                $notes,
                        ]
                    );
                }

                /*
                |--------------------------------------------------------------------------
                | TOTAL ORE
                |--------------------------------------------------------------------------
                */

                $totalWorkedHours =
                    $combinedAttendances->sum(
                        function ($attendance) {

                            return (float)
                                $attendance['worked_hours'];
                        }
                    );

                /*
                |--------------------------------------------------------------------------
                | TOTAL ORE LUCRATE PE LUCRARI
                |--------------------------------------------------------------------------
                */

                $totalWorkOrderHours =
                    $combinedAttendances->sum(
                        function ($attendance) {

                            return (float)
                                $attendance['work_order_hours'];
                        }
                    );

                /*
                |--------------------------------------------------------------------------
                | TOTAL ZILE
                |--------------------------------------------------------------------------
                */

                $totalDaysWorked =
                    $combinedAttendances
                        ->filter(
                            function ($attendance) {

                                return $attendance['status']
                                    === 'prezent'
                                    &&
                                    (float)
                                    $attendance['worked_hours']
                                    > 0;
                            }
                        )
                        ->count();

                /*
                |--------------------------------------------------------------------------
                | ORE SUPLIMENTARE
                |--------------------------------------------------------------------------
                */

                $totalOvertime = 0;

                foreach (
                    $combinedAttendances
                    as $attendance
                ) {

                    $totalOvertime += max(
                        0,
                        (float)
                            $attendance['worked_hours'] - 8
                    );
                }

                return [
                    'employee' =>
                        $employee,

                    'attendances' =>
                        $combinedAttendances
                            ->values(),

                    'total_worked_hours' =>
                        round(
                            $totalWorkedHours,
                            2
                        ),

                    'total_work_order_hours' =>
                        round(
                            $totalWorkOrderHours,
                            2
                        ),

                    'total_days_worked' =>
                        $totalDaysWorked,

                    'total_overtime' =>
                        round(
                            $totalOvertime,
                            2
                        ),
                ];
            })
            ->values();

        // Butoanele Start / Stop operează mereu ziua curentă, chiar când
        // utilizatorul consultă o altă lună în tabelul de pontaj.
        $todayAttendances = Attendance::query()
            ->whereDate('date', now()->toDateString())
            ->when($user?->isTechnician(), fn ($query) => $query->where('employee_id', $user->employee_id))
            ->get(['id', 'employee_id', 'date', 'check_in', 'check_out', 'worked_hours', 'status'])
            ->keyBy('employee_id')
            ->map(fn (Attendance $attendance) => $attendance->toArray());

        $currentMobileWeekStart = now()->startOfWeek(Carbon::MONDAY);
        $mobileWeekStart = $currentMobileWeekStart->copy();

        if ($request->filled('week_start')) {
            try {
                $mobileWeekStart = Carbon::parse($request->string('week_start')->toString())->startOfWeek(Carbon::MONDAY);
            } catch (\Throwable) {
                $mobileWeekStart = $currentMobileWeekStart->copy();
            }
        }

        $mobileWeekEnd = $mobileWeekStart->copy()->endOfWeek(Carbon::SUNDAY);
        $mobileWeekDays = collect(range(0, 6))->map(function (int $offset) use ($mobileWeekStart) {
            $date = $mobileWeekStart->copy()->addDays($offset);

            return [
                'date' => $date->toDateString(),
                'day' => $date->day,
                'weekday' => $date->locale('ro')->dayName,
                'is_weekend' => $date->isWeekend(),
            ];
        })->values();
        $mobileWeekAttendances = Attendance::query()
            ->whereBetween('date', [$mobileWeekStart->toDateString(), $mobileWeekEnd->toDateString()])
            ->when($user?->isTechnician(), fn ($query) => $query->where('employee_id', $user->employee_id))
            ->get(['id', 'employee_id', 'date', 'check_in', 'check_out', 'break_minutes', 'worked_hours', 'status', 'notes'])
            ->keyBy(fn (Attendance $attendance) => $attendance->date->toDateString())
            ->map(fn (Attendance $attendance) => $attendance->toArray());

        return Inertia::render(
            'Attendance/Index',
            [
                'month' =>
                    $month,

                'year' =>
                    $year,

                'monthName' =>
                    $startDate
                        ->locale('ro')
                        ->translatedFormat('F Y'),

                // Folosim aceeași zi de referință pentru toate dispozitivele.
                // Astfel butoanele Start / Stop ziua nu depind de ceasul telefonului.
                'today' => now()->toDateString(),

                'todayAttendances' => $todayAttendances,

                'mobileWeekDays' => $mobileWeekDays,
                'mobileWeekAttendances' => $mobileWeekAttendances,
                'mobileWeekStart' => $mobileWeekStart->toDateString(),
                'isMobileCurrentWeek' => $mobileWeekStart->isSameDay($currentMobileWeekStart),

                'days' =>
                    $days,

                'rows' =>
                    $rows,
            ]
        );
    }

    /**
     * START ZIUA
     *
     * Creeaza sau actualizeaza pontajul zilnic
     * pentru angajatul selectat.
     */
    public function startDay(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => [
                'required',
                'exists:employees,id',
            ],

            'date' => [
                'required',
                'date',
            ],

            'check_in' => [
                'nullable',
                'date_format:H:i',
            ],
            'gps_latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'gps_longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'gps_accuracy' => ['nullable', 'numeric', 'min:0', 'max:999999'],

            'break_minutes' => [
                'nullable',
                'integer',
                'min:0',
            ],

            'status' => [
                'nullable',
                'in:prezent,absent,concediu,medical,liber',
            ],

            'notes' => [
                'nullable',
                'string',
            ],
        ]);

        $this->ensureEmployeeAccess($request, (int) $validated['employee_id']);

        $employee = Employee::query()
            ->where('id', $validated['employee_id'])
            ->where('active', true)
            ->first();

        if (!$employee) {
            return back()->withErrors([
                'employee_id' =>
                    'Angajatul nu este activ sau nu exista.',
            ]);
        }

        $date = Carbon::parse(
            $validated['date']
        )->toDateString();

        $this->ensureTechnicianCurrentDate($request, $date);

        /*
        |--------------------------------------------------------------------------
        | VERIFICAM DACA EXISTA DEJA PONTAJ
        |--------------------------------------------------------------------------
        */

        $attendance = Attendance::query()
            ->where(
                'employee_id',
                $employee->id
            )
            ->whereDate(
                'date',
                $date
            )
            ->first();

        /*
        |--------------------------------------------------------------------------
        | DACA ZIUA ESTE DEJA PORNITA
        |--------------------------------------------------------------------------
        */

        if (
            $attendance &&
            $attendance->check_in
        ) {
            return back()->withErrors([
                'employee_id' =>
                    'Ziua pentru acest angajat este deja pornita.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | ORA START
        |--------------------------------------------------------------------------
        */

        $checkIn =
            $validated['check_in']
            ?? now()->format('H:i');

        $breakMinutes =
            (int) (
                $validated['break_minutes']
                ?? 30
            );

        /*
        |--------------------------------------------------------------------------
        | SALVARE
        |--------------------------------------------------------------------------
        */

        $data = [
            'employee_id' =>
                $employee->id,

            'date' =>
                $date,

            'check_in' =>
                $checkIn,
            'start_latitude' => $validated['gps_latitude'] ?? null,
            'start_longitude' => $validated['gps_longitude'] ?? null,
            'start_accuracy' => $validated['gps_accuracy'] ?? null,

            'check_out' =>
                null,

            'break_minutes' =>
                $breakMinutes,

            /*
            | Fara STOP avem 0 ore.
            */
            'worked_hours' =>
                0,

            'status' =>
                $validated['status']
                ?? 'prezent',

            'notes' =>
                $validated['notes']
                ?? 'Ziua a fost pornita din butonul Start ziua.',
        ];

        if ($attendance) {

            $attendance->update(
                $data
            );

        } else {

            Attendance::create(
                $data
            );
        }

        return back()->with(
            'success',
            'Ziua a fost pornita pentru ' .
                $employee->name .
                ' la ora ' .
                $checkIn .
                '.'
        );
    }

    /**
     * STOP ZIUA
     *
     * Inchide pontajul zilnic pentru angajatul selectat
     * si calculeaza automat orele lucrate.
     */
    public function stopDay(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => [
                'required',
                'exists:employees,id',
            ],

            'date' => [
                'required',
                'date',
            ],

            'check_out' => [
                'nullable',
                'date_format:H:i',
            ],
            'gps_latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'gps_longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'gps_accuracy' => ['nullable', 'numeric', 'min:0', 'max:999999'],
        ]);

        $this->ensureEmployeeAccess($request, (int) $validated['employee_id']);

        $employee = Employee::query()
            ->where('id', $validated['employee_id'])
            ->where('active', true)
            ->first();

        if (!$employee) {
            return back()->withErrors([
                'employee_id' =>
                    'Angajatul nu este activ sau nu exista.',
            ]);
        }

        $date = Carbon::parse(
            $validated['date']
        )->toDateString();

        $this->ensureTechnicianCurrentDate($request, $date);

        /*
        |--------------------------------------------------------------------------
        | GASIM PONTAJUL REAL
        |--------------------------------------------------------------------------
        */

        $attendance = Attendance::query()
            ->where(
                'employee_id',
                $employee->id
            )
            ->whereDate(
                'date',
                $date
            )
            ->first();

        if (!$attendance) {
            return back()->withErrors([
                'employee_id' =>
                    'Nu exista un pontaj pornit pentru acest angajat.',
            ]);
        }

        if (!$attendance->check_in) {
            return back()->withErrors([
                'employee_id' =>
                    'Ziua nu a fost pornita. Apasa mai intai Start ziua.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | DACA ZIUA ESTE DEJA OPRITA
        |--------------------------------------------------------------------------
        */

        if ($attendance->check_out) {
            return back()->withErrors([
                'employee_id' =>
                    'Ziua pentru acest angajat este deja oprita.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | ORA STOP
        |--------------------------------------------------------------------------
        */

        $checkOut =
            $validated['check_out']
            ?? now()->format('H:i');

        $breakMinutes =
            (int) (
                $attendance->break_minutes
                ?? 0
            );

        /*
        |--------------------------------------------------------------------------
        | CALCUL ORE
        |--------------------------------------------------------------------------
        */

        $workedHours =
            $this->calculateWorkedHours(
                $attendance->check_in,
                $checkOut,
                $breakMinutes,
                $attendance->status ?: 'prezent'
            );

        /*
        |--------------------------------------------------------------------------
        | UPDATE
        |--------------------------------------------------------------------------
        */

        $attendance->update([
            'check_out' =>
                $checkOut,
            'stop_latitude' => $validated['gps_latitude'] ?? null,
            'stop_longitude' => $validated['gps_longitude'] ?? null,
            'stop_accuracy' => $validated['gps_accuracy'] ?? null,

            'worked_hours' =>
                $workedHours,

            'status' =>
                $attendance->status
                ?: 'prezent',

            'notes' =>
                $attendance->notes
                ?: 'Ziua a fost oprita din butonul Stop ziua.',
        ]);

        return back()->with(
            'success',
            'Ziua a fost oprita pentru ' .
                $employee->name .
                ' la ora ' .
                $checkOut .
                '. Ore lucrate: ' .
                number_format(
                    $workedHours,
                    2,
                    '.',
                    ''
                ) .
                '.'
        );
    }

    /**
     * Salvează sau actualizează pontajul unei zile.
     *
     * Aceasta metoda este folosita pentru:
     *
     * - pontaj manual
     * - modificarea unui pontaj existent
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => [
                'required',
                'exists:employees,id',
            ],

            'date' => [
                'required',
                'date',
            ],

            'check_in' => [
                'nullable',
                'date_format:H:i',
            ],

            'check_out' => [
                'nullable',
                'date_format:H:i',
            ],

            'break_minutes' => [
                'nullable',
                'integer',
                'min:0',
            ],

            'status' => [
                'required',
                'in:prezent,absent,concediu,medical,liber',
            ],

            'notes' => [
                'nullable',
                'string',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | CALCUL ORE
        |--------------------------------------------------------------------------
        */

        $workedHours =
            $this->calculateWorkedHours(
                $validated['check_in'] ?? null,
                $validated['check_out'] ?? null,
                (int) (
                    $validated['break_minutes'] ?? 0
                ),
                $validated['status']
            );

        /*
        |--------------------------------------------------------------------------
        | DATA NORMALIZATA
        |--------------------------------------------------------------------------
        */

        $date = Carbon::parse(
            $validated['date']
        )->toDateString();

        $this->ensureTechnicianCurrentDate($request, $date);

        /*
        |--------------------------------------------------------------------------
        | PONTAJ EXISTENT
        |--------------------------------------------------------------------------
        */

        $attendance = Attendance::query()
            ->where(
                'employee_id',
                $validated['employee_id']
            )
            ->whereDate(
                'date',
                $date
            )
            ->first();

        /*
        |--------------------------------------------------------------------------
        | DATE PONTAJ
        |--------------------------------------------------------------------------
        */

        $this->ensureEmployeeAccess($request, (int) $validated['employee_id']);

        $data = [
            'employee_id' =>
                $validated['employee_id'],

            'date' =>
                $date,

            'check_in' =>
                $validated['check_in'] ?? null,

            'check_out' =>
                $validated['check_out'] ?? null,

            'break_minutes' =>
                (int) (
                    $validated['break_minutes'] ?? 0
                ),

            'worked_hours' =>
                $workedHours,

            'status' =>
                $validated['status'],

            'notes' =>
                $validated['notes'] ?? null,
        ];

        /*
        |--------------------------------------------------------------------------
        | UPDATE / CREATE
        |--------------------------------------------------------------------------
        */

        if ($attendance) {

            $attendance->update(
                $data
            );

        } else {

            Attendance::create(
                $data
            );
        }

        return back()->with(
            'success',
            'Pontajul a fost salvat.'
        );
    }

    /**
     * Salvează pontajul pentru TOTI angajatii activi.
     */
    public function bulkStore(Request $request)
    {
        abort_if($request->user()?->isTechnician(), 403, 'Tehnicienii nu pot salva pontaj pentru toți angajații.');

        $validated = $request->validate([
            'date' => [
                'required',
                'date',
            ],

            'check_in' => [
                'nullable',
                'date_format:H:i',
            ],

            'check_out' => [
                'nullable',
                'date_format:H:i',
            ],

            'break_minutes' => [
                'nullable',
                'integer',
                'min:0',
            ],

            'status' => [
                'required',
                'in:prezent,absent,concediu,medical,liber',
            ],

            'notes' => [
                'nullable',
                'string',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | VERIFICAM ZIUA
        |--------------------------------------------------------------------------
        */

        $date = Carbon::parse(
            $validated['date']
        )->startOfDay();

        if ($date->isWeekend()) {

            return back()->withErrors([
                'date' =>
                    'Nu poti aplica pontajul in weekend.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | ANGAJATI ACTIVI
        |--------------------------------------------------------------------------
        */

        $employees = Employee::query()
            ->where('active', true)
            ->orderBy('id')
            ->get();

        if ($employees->isEmpty()) {

            return back()->withErrors([
                'date' =>
                    'Nu exista angajati activi.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | CALCUL ORE
        |--------------------------------------------------------------------------
        */

        $breakMinutes =
            (int) (
                $validated['break_minutes'] ?? 0
            );

        $workedHours =
            $this->calculateWorkedHours(
                $validated['check_in'] ?? null,
                $validated['check_out'] ?? null,
                $breakMinutes,
                $validated['status']
            );

        /*
        |--------------------------------------------------------------------------
        | SALVARE
        |--------------------------------------------------------------------------
        */

        foreach ($employees as $employee) {

            $attendance =
                Attendance::query()
                    ->where(
                        'employee_id',
                        $employee->id
                    )
                    ->whereDate(
                        'date',
                        $date->toDateString()
                    )
                    ->first();

            $data = [
                'employee_id' =>
                    $employee->id,

                'date' =>
                    $date->toDateString(),

                'check_in' =>
                    $validated['check_in'] ?? null,

                'check_out' =>
                    $validated['check_out'] ?? null,

                'break_minutes' =>
                    $breakMinutes,

                'worked_hours' =>
                    $workedHours,

                'status' =>
                    $validated['status'],

                'notes' =>
                    $validated['notes'] ?? null,
            ];

            if ($attendance) {

                $attendance->update(
                    $data
                );

            } else {

                Attendance::create(
                    $data
                );
            }
        }

        return back()->with(
            'success',
            'Pontajul a fost aplicat tuturor angajatilor activi.'
        );
    }

    /**
     * Șterge pontajul.
     */
    public function destroy(
        Attendance $attendance
    ) {
        abort_if(request()->user()?->isTechnician(), 403, 'Tehnicienii nu pot șterge pontaje manuale.');

        $attendance->delete();

        return back()->with(
            'success',
            'Pontajul a fost sters.'
        );
    }

    /**
     * Calculează orele lucrate.
     */
    private function ensureEmployeeAccess(Request $request, int $employeeId): void
    {
        $user = $request->user();

        if (!$user?->isTechnician()) {
            return;
        }

        abort_unless($user->employee_id, 403, 'Contul de tehnician nu este asociat unui angajat.');
        abort_unless((int) $user->employee_id === $employeeId, 403, 'Poți opera doar propriul pontaj.');
    }

    private function ensureTechnicianCurrentDate(Request $request, string $date): void
    {
        if (!$request->user()?->isTechnician()) {
            return;
        }

        abort_unless($date === now()->toDateString(), 403, 'Tehnicienii pot modifica doar pontajul zilei curente.');
    }

    private function calculateWorkedHours(
        ?string $checkIn,
        ?string $checkOut,
        int $breakMinutes,
        string $status
    ): float {

        if ($status !== 'prezent') {
            return 0;
        }

        /*
        |--------------------------------------------------------------------------
        | START FARA STOP
        |--------------------------------------------------------------------------
        |
        | Cand apasam Start ziua avem doar check_in.
        | Orele vor fi 0 pana la apasarea Stop ziua.
        |
        */

        if (!$checkIn || !$checkOut) {
            return 0;
        }

        try {

            $start =
                Carbon::createFromFormat(
                    'H:i',
                    $checkIn
                );

            $end =
                Carbon::createFromFormat(
                    'H:i',
                    $checkOut
                );

            /*
            |--------------------------------------------------------------------------
            | TURE PESTE MIEZUL NOPTII
            |--------------------------------------------------------------------------
            */

            if (
                $end->lessThanOrEqualTo(
                    $start
                )
            ) {

                $end->addDay();
            }

            $minutes =
                $start->diffInMinutes(
                    $end
                );

            $minutes -= max(
                0,
                $breakMinutes
            );

            if ($minutes <= 0) {
                return 0;
            }

            return round(
                $minutes / 60,
                2
            );

        } catch (\Throwable $e) {

            return 0;
        }
    }

    /**
     * Export Excel.
     */
    public function exportExcel(Request $request)
    {
        abort_if($request->user()?->isTechnician(), 403, 'Tehnicienii nu pot exporta pontajul global.');

        [$exportStart, $exportEnd] = $this->selectedExportRange($request);

        $month = (int) $request->get(
            'month',
            now()->month
        );

        $year = (int) $request->get(
            'year',
            now()->year
        );

        if ($month < 1 || $month > 12) {
            $month = now()->month;
        }

        if ($year < 2000 || $year > 2100) {
            $year = now()->year;
        }

        $path = AttendanceExport::generate(
            $month,
            $year,
            $exportStart?->toDateString(),
            $exportEnd?->toDateString()
        );

        $filePeriod = $exportStart
            ? $this->exportFilePeriod($exportStart, $exportEnd)
            : $year . '_' . str_pad($month, 2, '0', STR_PAD_LEFT);

        return response()
            ->download(
                $path,
                'Pontaj_' . $filePeriod . '.xlsx'
            )
            ->deleteFileAfterSend(true);
    }

    /**
     * Export PDF.
     */
    public function exportPdf(Request $request)
    {
        abort_if($request->user()?->isTechnician(), 403, 'Tehnicienii nu pot exporta pontajul global.');

        [$exportStart, $exportEnd] = $this->selectedExportRange($request);

        $month = (int) $request->get(
            'month',
            now()->month
        );

        $year = (int) $request->get(
            'year',
            now()->year
        );

        if ($month < 1 || $month > 12) {
            $month = now()->month;
        }

        if ($year < 2000 || $year > 2100) {
            $year = now()->year;
        }

        $startDate = $exportStart?->copy()->startOfDay()
            ?? Carbon::create($year, $month, 1)->startOfMonth();

        $endDate = $exportEnd?->copy()->endOfDay()
            ?? $startDate->copy()->endOfMonth();

        $employees = Employee::query()
            ->where('active', true)
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'position',
            ]);

        $attendances = Attendance::query()
            ->whereBetween('date', [
                $startDate->toDateString(),
                $endDate->toDateString(),
            ])
            ->get()
            ->groupBy('employee_id');

        $workTimeEntries = WorkOrderTimeEntry::query()
            ->where(
                'started_at',
                '>=',
                $startDate
            )
            ->where(
                'started_at',
                '<=',
                $endDate
            )
            ->get()
            ->groupBy('employee_id');

        $days = [];

        $currentDate = $startDate->copy();

        while ($currentDate->lte($endDate)) {

            $days[] = [
                'date' =>
                    $currentDate->toDateString(),

                'day' =>
                    $currentDate->day,

                'weekday' =>
                    $currentDate
                        ->locale('ro')
                        ->dayName,

                'is_weekend' =>
                    $currentDate->isWeekend(),
            ];

            $currentDate->addDay();
        }

        $rows = $employees
            ->map(function ($employee) use (
                $attendances,
                $workTimeEntries
            ) {

                $employeeAttendances =
                    $attendances
                        ->get(
                            $employee->id,
                            collect()
                        )
                        ->keyBy(function ($attendance) {

                            return Carbon::parse(
                                $attendance->date
                            )->toDateString();
                        });

                $employeeWorkEntries =
                    $workTimeEntries->get(
                        $employee->id,
                        collect()
                    );

                $workOrderByDate = [];

                foreach (
                    $employeeWorkEntries
                    as $entry
                ) {

                    if (!$entry->started_at) {
                        continue;
                    }

                    $startedAt = Carbon::parse(
                        $entry->started_at
                    );

                    $date =
                        $startedAt->toDateString();

                    if (
                        $entry->duration_minutes !== null
                    ) {

                        $minutes =
                            (int)
                            $entry->duration_minutes;

                    } else {

                        $minutes =
                            $startedAt->diffInMinutes(
                                now()
                            );
                    }

                    if ($minutes < 0) {
                        $minutes = 0;
                    }

                    $workOrderByDate[$date] =
                        (
                            $workOrderByDate[$date]
                            ?? 0
                        ) + $minutes;
                }

                $allDates = collect(
                    array_unique(
                        array_merge(
                            $employeeAttendances
                                ->keys()
                                ->all(),

                            array_keys(
                                $workOrderByDate
                            )
                        )
                    )
                )
                    ->sort()
                    ->values();

                $combinedAttendances =
                    collect();

                foreach ($allDates as $date) {

                    $attendance =
                        $employeeAttendances->get(
                            $date
                        );

                    $workOrderMinutes =
                        (int) (
                            $workOrderByDate[$date]
                            ?? 0
                        );

                    $workOrderHours =
                        round(
                            $workOrderMinutes / 60,
                            2
                        );

                    if (
                        $attendance &&
                        (float)
                            $attendance->worked_hours > 0
                    ) {

                        $workedHours =
                            (float)
                            $attendance->worked_hours;

                        $status =
                            $attendance->status;

                        $checkIn =
                            $attendance->check_in;

                        $checkOut =
                            $attendance->check_out;

                        $breakMinutes =
                            (int)
                            $attendance->break_minutes;

                        $notes =
                            $attendance->notes;

                        $attendanceId =
                            $attendance->id;

                    } elseif (
                        $workOrderMinutes > 0 &&
                        !$attendance
                    ) {

                        $workedHours =
                            $workOrderHours;

                        $status =
                            'prezent';

                        $dayEntries =
                            $employeeWorkEntries
                                ->filter(function ($entry) use (
                                    $date
                                ) {

                                    return $entry->started_at &&
                                        Carbon::parse(
                                            $entry->started_at
                                        )->toDateString() === $date;
                                });

                        $firstEntry =
                            $dayEntries
                                ->sortBy('started_at')
                                ->first();

                        $lastEntry =
                            $dayEntries
                                ->sortByDesc(function ($entry) {

                                    return $entry->ended_at
                                        ?? $entry->started_at;
                                })
                                ->first();

                        $checkIn =
                            $firstEntry?->started_at
                                ? Carbon::parse(
                                    $firstEntry->started_at
                                )->format('H:i')
                                : null;

                        $checkOut =
                            $lastEntry?->ended_at
                                ? Carbon::parse(
                                    $lastEntry->ended_at
                                )->format('H:i')
                                : null;

                        $breakMinutes = 0;

                        $notes =
                            'Pontaj generat automat din timpul lucrat pe lucrari.';

                        $attendanceId = null;

                    } else {

                        if (!$attendance) {
                            continue;
                        }

                        $workedHours = 0;

                        $status =
                            $attendance->status;

                        $checkIn =
                            $attendance->check_in;

                        $checkOut =
                            $attendance->check_out;

                        $breakMinutes =
                            (int)
                            $attendance->break_minutes;

                        $notes =
                            $attendance->notes;

                        $attendanceId =
                            $attendance->id;
                    }

                    $combinedAttendances->put(
                        $date,
                        [
                            'id' =>
                                $attendanceId,

                            'date' =>
                                $date,

                            'check_in' =>
                                $checkIn
                                    ? (
                                        strlen(
                                            (string)
                                            $checkIn
                                        ) > 5
                                            ? Carbon::parse(
                                                $checkIn
                                            )->format('H:i')
                                            : substr(
                                                $checkIn,
                                                0,
                                                5
                                            )
                                    )
                                    : null,

                            'check_out' =>
                                $checkOut
                                    ? (
                                        strlen(
                                            (string)
                                            $checkOut
                                        ) > 5
                                            ? Carbon::parse(
                                                $checkOut
                                            )->format('H:i')
                                            : substr(
                                                $checkOut,
                                                0,
                                                5
                                            )
                                    )
                                    : null,

                            'break_minutes' =>
                                $breakMinutes,

                            'worked_hours' =>
                                round(
                                    $workedHours,
                                    2
                                ),

                            'work_order_hours' =>
                                $workOrderHours,

                            'work_order_minutes' =>
                                $workOrderMinutes,

                            'status' =>
                                $status,

                            'notes' =>
                                $notes,
                        ]
                    );
                }

                $totalWorkedHours =
                    $combinedAttendances->sum(
                        function ($attendance) {

                            return (float)
                                $attendance['worked_hours'];
                        }
                    );

                $totalWorkOrderHours =
                    $combinedAttendances->sum(
                        function ($attendance) {

                            return (float)
                                $attendance['work_order_hours'];
                        }
                    );

                $totalDaysWorked =
                    $combinedAttendances
                        ->where(
                            'status',
                            'prezent'
                        )
                        ->filter(
                            function ($attendance) {

                                return (float)
                                    $attendance['worked_hours'] > 0;
                            }
                        )
                        ->count();

                $totalOvertime = 0;

                foreach (
                    $combinedAttendances
                    as $attendance
                ) {

                    $totalOvertime += max(
                        0,
                        (float)
                            $attendance['worked_hours'] - 8
                    );
                }

                return [
                    'employee' =>
                        $employee->toArray(),

                    'attendances' =>
                        $combinedAttendances
                            ->values()
                            ->keyBy('date'),

                    'total_worked_hours' =>
                        round(
                            $totalWorkedHours,
                            2
                        ),

                    'total_work_order_hours' =>
                        round(
                            $totalWorkOrderHours,
                            2
                        ),

                    'total_days_worked' =>
                        $totalDaysWorked,

                    'total_overtime' =>
                        round(
                            $totalOvertime,
                            2
                        ),
                ];
            })
            ->values();

        $monthName = $exportStart
            ? $this->exportPeriodLabel($exportStart, $exportEnd)
            : $startDate->locale('ro')->translatedFormat('F Y');

        $pdf = Pdf::loadView(
            'attendance.pdf',
            [
                'month' =>
                    $month,

                'year' =>
                    $year,

                'monthName' =>
                    $monthName,

                'days' =>
                    $days,

                'rows' =>
                    $rows,
            ]
        );

        $pdf->setPaper(
            'a4',
            'landscape'
        );

        $filePeriod = $exportStart
            ? $this->exportFilePeriod($exportStart, $exportEnd)
            : $year . '_' . str_pad($month, 2, '0', STR_PAD_LEFT);

        return $pdf->download('Pontaj_' . $filePeriod . '.pdf');
    }

    private function selectedExportRange(Request $request): array
    {
        if (!$request->filled('from') && !$request->filled('date')) {
            return [null, null];
        }

        $date = $request->validate([
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from'],
            'date' => ['nullable', 'date_format:Y-m-d'],
        ]);

        $from = $date['from'] ?? $date['date'];
        $start = Carbon::createFromFormat('Y-m-d', $from)->startOfDay();
        $end = Carbon::createFromFormat('Y-m-d', $date['to'] ?? $from)->startOfDay();

        abort_if($start->diffInDays($end) > 366, 422, 'Intervalul de export poate avea cel mult 366 de zile.');

        return [$start, $end];
    }

    private function exportFilePeriod(Carbon $start, Carbon $end): string
    {
        return $start->isSameDay($end)
            ? $start->format('Y-m-d')
            : $start->format('Y-m-d') . '_pana_la_' . $end->format('Y-m-d');
    }

    private function exportPeriodLabel(Carbon $start, Carbon $end): string
    {
        return $start->isSameDay($end)
            ? 'Data: ' . $start->locale('ro')->translatedFormat('d F Y')
            : 'Perioada: ' . $start->format('d.m.Y') . ' – ' . $end->format('d.m.Y');
    }
}
