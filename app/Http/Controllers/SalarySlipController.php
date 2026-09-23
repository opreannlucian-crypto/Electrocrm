<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\CompanyProfile;
use App\Models\Employee;
use App\Models\PayrollRule;
use App\Models\SalarySlip;
use App\Models\WorkOrderTimeEntry;
use App\Services\Payroll\SalarySlipCalculator;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SalarySlipController extends Controller
{
    public function index(Request $request)
    {
        $this->ensurePayrollAccess($request);

        $year = (int) $request->integer('year', now()->year);
        $month = (int) $request->integer('month', now()->month);
        $month = $month >= 1 && $month <= 12 ? $month : now()->month;
        $year = $year >= 2000 && $year <= 2100 ? $year : now()->year;
        $periodStart = Carbon::create($year, $month, 1)->toDateString();

        return Inertia::render('SalarySlips/Index', [
            'year' => $year,
            'month' => $month,
            'monthName' => Carbon::create($year, $month, 1)->locale('ro')->translatedFormat('F Y'),
            'salarySlips' => SalarySlip::query()
                ->with('employee:id,name,position')
                ->whereDate('period_start', $periodStart)
                ->orderBy('status')
                ->orderBy(Employee::select('name')->whereColumn('employees.id', 'salary_slips.employee_id'))
                ->get(),
        ]);
    }

    public function create(Request $request)
    {
        $this->ensurePayrollAccess($request);

        $year = (int) $request->integer('year', now()->year);
        $month = (int) $request->integer('month', now()->month);
        $period = Carbon::create($year, $month, 1);

        return Inertia::render('SalarySlips/Create', [
            'employees' => Employee::query()->where('active', true)->orderBy('name')->get([
                'id', 'name', 'position', 'salary', 'employment_type', 'is_primary_job', 'monthly_norm_hours', 'dependent_count', 'tax_facility_code',
            ]),
            'rules' => PayrollRule::query()->orderByDesc('valid_from')->get(),
            'period' => [
                'start' => $period->startOfMonth()->toDateString(),
                'end' => $period->endOfMonth()->toDateString(),
                'label' => $period->locale('ro')->translatedFormat('F Y'),
            ],
        ]);
    }

    public function store(Request $request, SalarySlipCalculator $calculator)
    {
        $this->ensurePayrollAccess($request);
        $data = $this->validatePayload($request);

        $existingSlip = SalarySlip::query()
            ->where('employee_id', $data['employee_id'])
            ->whereDate('period_start', $data['period_start'])
            ->first();

        if ($existingSlip) {
            if ($existingSlip->isFinalized()) {
                return $this->redirectToSlip($existingSlip, 'Există deja un fluturaș finalizat pentru angajatul și perioada selectate.', 'error');
            }

            $employee = Employee::query()->findOrFail($data['employee_id']);
            $rule = $this->resolveRule($data);
            $calculation = $calculator->calculate($employee, $rule, $data);

            DB::transaction(function () use ($existingSlip, $data, $rule, $calculation) {
                $existingSlip->update(array_merge(['payroll_rule_id' => $rule->id], $this->storedPayload($data, $calculation)));
                $existingSlip->items()->delete();
                $existingSlip->items()->createMany($calculation['items']);
            });

            return $this->redirectToSlip($existingSlip, 'Fluturașul existent a fost recalculat și deschis.');
        }

        $employee = Employee::query()->findOrFail($data['employee_id']);
        $rule = $this->resolveRule($data);
        $calculation = $calculator->calculate($employee, $rule, $data);

        $slip = DB::transaction(function () use ($request, $data, $employee, $rule, $calculation) {
            $slip = SalarySlip::create(array_merge([
                'employee_id' => $employee->id,
                'payroll_rule_id' => $rule->id,
                'created_by' => $request->user()->id,
            ], $this->storedPayload($data, $calculation)));
            $slip->items()->createMany($calculation['items']);
            return $slip;
        });

        return $this->redirectToSlip($slip, 'Fluturașul a fost calculat în stadiul ciornă. Verifică-l înainte de finalizare.');
    }

    public function show(Request $request, SalarySlip $salarySlip)
    {
        $this->ensurePayrollAccess($request);

        return Inertia::render('SalarySlips/Show', [
            'salarySlip' => $salarySlip->load([
                'employee:id,name,cnp,position,department,hire_date',
                'items',
                'payrollRule',
                'createdBy:id,name',
                'verifiedBy:id,name',
            ]),
        ]);
    }

    public function edit(Request $request, SalarySlip $salarySlip)
    {
        $this->ensurePayrollAccess($request);
        abort_if($salarySlip->isFinalized(), 422, 'Un fluturaș finalizat nu poate fi modificat. Creează o rectificare documentată.');

        return Inertia::render('SalarySlips/Edit', [
            'salarySlip' => $salarySlip->load('items'),
            'employees' => Employee::query()->where('active', true)->orderBy('name')->get([
                'id', 'name', 'position', 'salary', 'employment_type', 'is_primary_job', 'monthly_norm_hours', 'dependent_count', 'tax_facility_code',
            ]),
            'rules' => PayrollRule::query()->orderByDesc('valid_from')->get(),
        ]);
    }

    public function update(Request $request, SalarySlip $salarySlip, SalarySlipCalculator $calculator)
    {
        $this->ensurePayrollAccess($request);
        abort_if($salarySlip->isFinalized(), 422, 'Un fluturaș finalizat nu poate fi modificat. Creează o rectificare documentată.');

        $data = $this->validatePayload($request);
        abort_if($salarySlip->employee_id !== (int) $data['employee_id'], 422, 'Angajatul nu poate fi schimbat după creare. Creează un fluturaș nou.');

        $periodConflict = SalarySlip::query()
            ->where($salarySlip->getKeyName(), '!=', $salarySlip->getKey())
            ->where('employee_id', $data['employee_id'])
            ->whereDate('period_start', $data['period_start'])
            ->first();

        if ($periodConflict) {
            $message = $periodConflict->isFinalized()
                ? 'Există deja un fluturaș finalizat pentru noua perioadă selectată.'
                : 'Există deja o ciornă pentru noua perioadă selectată.';

            return back()->withErrors(['period_start' => $message]);
        }

        $employee = Employee::query()->findOrFail($data['employee_id']);
        $rule = $this->resolveRule($data);
        $calculation = $calculator->calculate($employee, $rule, $data);

        DB::transaction(function () use ($salarySlip, $data, $rule, $calculation) {
            $salarySlip->update(array_merge(['payroll_rule_id' => $rule->id], $this->storedPayload($data, $calculation)));
            $salarySlip->items()->delete();
            $salarySlip->items()->createMany($calculation['items']);
        });

        return $this->redirectToSlip($salarySlip, 'Fluturașul a fost recalculat.');
    }

    public function rectify(Request $request, SalarySlip $salarySlip, SalarySlipCalculator $calculator)
    {
        $this->ensurePayrollAccess($request);
        abort_unless($salarySlip->isFinalized(), 422, 'Rectificarea se creează pentru un fluturaș finalizat.');

        $data = $request->validate([
            'scheduled_hours' => ['required', 'numeric', 'min:0'],
            'worked_hours' => ['required', 'numeric', 'min:0'],
            'overtime_hours' => ['required', 'numeric', 'min:0'],
            'annual_leave_days' => ['required', 'numeric', 'min:0'],
            'overtime_premium_rate' => ['required', 'numeric', 'min:0', 'max:500'],
        ]);

        $employee = $salarySlip->employee;
        $rule = $salarySlip->payrollRule;
        $items = $salarySlip->items()
            ->get()
            ->reject(fn ($item) => $item->code === 'OVERTIME')
            ->map(fn ($item) => [
                'category' => $item->category,
                'code' => $item->code,
                'description' => $item->description,
                'quantity' => $item->quantity,
                'rate' => $item->rate,
                'amount' => $item->amount,
                'include_cas' => (bool) $item->include_cas,
                'include_cass' => (bool) $item->include_cass,
                'include_income_tax' => (bool) $item->include_income_tax,
                'cash_effect' => (bool) $item->cash_effect,
                'support_source' => $item->support_source,
            ])->values()->all();

        $payload = [
            'period_start' => $salarySlip->period_start->toDateString(),
            'period_end' => $salarySlip->period_end->toDateString(),
            'period_label' => $salarySlip->period_label . ' — rectificare',
            'calculation_mode' => $salarySlip->calculation_mode,
            'gross_base' => $salarySlip->gross_base,
            'scheduled_hours' => $data['scheduled_hours'],
            'worked_hours' => $data['worked_hours'],
            'overtime_hours' => $data['overtime_hours'],
            'overtime_compensation_mode' => 'paid_premium',
            'medical_leave_days' => $salarySlip->medical_leave_days,
            'annual_leave_days' => $data['annual_leave_days'],
            'personal_deduction' => $salarySlip->personal_deduction,
            'dependent_count' => data_get($salarySlip->calculation_snapshot, 'dependent_count', 0),
            'tax_facility_code' => $salarySlip->tax_facility_code,
            'rate_overrides' => [
                'cas_rate' => $salarySlip->cas_rate,
                'cass_rate' => $salarySlip->cass_rate,
                'income_tax_rate' => $salarySlip->income_tax_rate,
                'employer_cam_rate' => $salarySlip->employer_cam_rate,
                'overtime_premium_rate' => $data['overtime_premium_rate'],
            ],
            'items' => $items,
            'notes' => 'Rectificare a fluturașului #' . $salarySlip->id . ': ' . $data['scheduled_hours'] . ' ore normă, ' . $data['worked_hours'] . ' ore lucrate, ' . $data['overtime_hours'] . ' ore suplimentare cu majorare ' . $data['overtime_premium_rate'] . '%, ' . $data['annual_leave_days'] . ' zi/zile concediu de odihnă.',
        ];

        $calculation = $calculator->calculate($employee, $rule, $payload);
        $rectification = DB::transaction(function () use ($request, $salarySlip, $rule, $payload, $calculation) {
            $slip = SalarySlip::create(array_merge([
                'employee_id' => $salarySlip->employee_id,
                'payroll_rule_id' => $rule->id,
                'created_by' => $request->user()->id,
            ], $this->storedPayload($payload, $calculation), [
                'calculation_snapshot' => array_merge($calculation['snapshot'], ['rectifies_salary_slip_id' => $salarySlip->id]),
            ]));
            $slip->items()->createMany($calculation['items']);
            return $slip;
        });

        return $this->redirectToSlip($rectification, 'Rectificarea a fost creată și calculată.');
    }

    public function finalize(Request $request, SalarySlip $salarySlip)
    {
        $this->ensurePayrollAccess($request);
        abort_if($salarySlip->isFinalized(), 422, 'Fluturașul este deja finalizat.');

        $salarySlip->update([
            'status' => 'finalized',
            'verified_at' => now(),
            'verified_by' => $request->user()->id,
            'finalized_at' => now(),
        ]);

        return back()->with('success', 'Fluturașul a fost finalizat și blocat pentru modificare.');
    }

    public function pdf(Request $request, SalarySlip $salarySlip)
    {
        $this->ensurePayrollAccess($request);

        $salarySlip->load(['employee', 'items', 'payrollRule', 'verifiedBy']);
        $company = CompanyProfile::current();

        return Pdf::loadView('salary-slips.pdf', compact('salarySlip', 'company'))
            ->setPaper('a4')
            ->stream('fluturas-' . $salarySlip->employee->name . '-' . $salarySlip->period_start->format('Y-m') . '.pdf');
    }

    public function attendancePreview(Request $request, Employee $employee)
    {
        $this->ensurePayrollAccess($request);
        $request->validate(['period_start' => ['required', 'date'], 'period_end' => ['required', 'date', 'after_or_equal:period_start']]);

        return response()->json($this->attendanceSummary($employee, $request->string('period_start')->toString(), $request->string('period_end')->toString()));
    }

    private function redirectToSlip(SalarySlip $salarySlip, string $message, string $level = 'success'): \Illuminate\Http\RedirectResponse
    {
        return redirect('/salary-slips/' . $salarySlip->getKey())
            ->with($level, $message);
    }

    private function ensurePayrollAccess(Request $request): void
    {
        $user = $request->user();
        abort_unless($user && ($user->isAdministrator() || $user->isSalesManager()), 403, 'Nu ai permisiunea de a accesa modulul salarial.');
    }

    private function resolveRule(array $data): PayrollRule
    {
        if (!empty($data['payroll_rule_id'])) {
            return PayrollRule::query()->findOrFail($data['payroll_rule_id']);
        }

        return PayrollRule::query()
            ->whereDate('valid_from', '<=', $data['period_end'])
            ->where(fn ($query) => $query->whereNull('valid_to')->orWhereDate('valid_to', '>=', $data['period_start']))
            ->orderByDesc('valid_from')
            ->firstOrFail();
    }

    private function storedPayload(array $data, array $calculation): array
    {
        return array_merge([
            'period_start' => $data['period_start'],
            'period_end' => $data['period_end'],
            'period_label' => $data['period_label'],
            'status' => 'draft',
            'notes' => $data['notes'] ?? null,
            'calculation_snapshot' => $calculation['snapshot'],
        ], $calculation['summary']);
    }

    private function validatePayload(Request $request): array
    {
        return $request->validate([
            'employee_id' => ['required', 'exists:employees,id'],
            'payroll_rule_id' => ['nullable', 'exists:payroll_rules,id'],
            'period_start' => ['required', 'date'],
            'period_end' => ['required', 'date', 'after_or_equal:period_start'],
            'period_label' => ['required', 'string', 'max:100'],
            'calculation_mode' => ['required', 'in:full_month,pro_rata'],
            'gross_base' => ['nullable', 'numeric', 'min:0'],
            'scheduled_hours' => ['nullable', 'numeric', 'min:0'],
            'worked_hours' => ['nullable', 'numeric', 'min:0'],
            'overtime_hours' => ['nullable', 'numeric', 'min:0'],
            'overtime_compensation_mode' => ['nullable', 'in:paid_premium,paid_time_off'],
            'medical_leave_days' => ['nullable', 'numeric', 'min:0'],
            'annual_leave_days' => ['nullable', 'numeric', 'min:0'],
            'dependent_count' => ['nullable', 'integer', 'min:0', 'max:20'],
            'tax_facility_code' => ['nullable', 'string', 'max:100'],
            'personal_deduction' => ['nullable', 'numeric', 'min:0'],
            'rate_overrides' => ['nullable', 'array'],
            'rate_overrides.cas_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'rate_overrides.cass_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'rate_overrides.income_tax_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'rate_overrides.employer_cam_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'rate_overrides.overtime_premium_rate' => ['nullable', 'numeric', 'min:0', 'max:500'],
            'notes' => ['nullable', 'string', 'max:5000'],
            'items' => ['nullable', 'array', 'max:50'],
            'items.*.category' => ['nullable', 'in:income,benefit,medical_leave,deduction'],
            'items.*.code' => ['nullable', 'string', 'max:100'],
            'items.*.description' => ['nullable', 'string', 'max:255'],
            'items.*.quantity' => ['nullable', 'numeric', 'min:0'],
            'items.*.rate' => ['nullable', 'numeric', 'min:0'],
            'items.*.amount' => ['nullable', 'numeric', 'min:0'],
            'items.*.include_cas' => ['nullable', 'boolean'],
            'items.*.include_cass' => ['nullable', 'boolean'],
            'items.*.include_income_tax' => ['nullable', 'boolean'],
            'items.*.cash_effect' => ['nullable', 'boolean'],
            'items.*.support_source' => ['nullable', 'string', 'max:30'],
        ]);
    }

    private function attendanceSummary(Employee $employee, string $periodStart, string $periodEnd): array
    {
        $attendances = Attendance::query()
            ->where('employee_id', $employee->id)
            ->whereBetween('date', [$periodStart, $periodEnd])
            ->get()
            ->keyBy(fn (Attendance $attendance) => $attendance->date->toDateString());

        $workEntries = WorkOrderTimeEntry::query()
            ->where('employee_id', $employee->id)
            ->whereBetween('started_at', [Carbon::parse($periodStart)->startOfDay(), Carbon::parse($periodEnd)->endOfDay()])
            ->get()
            ->groupBy(fn (WorkOrderTimeEntry $entry) => Carbon::parse($entry->started_at)->toDateString());

        $dailyHours = [];
        foreach ($attendances as $date => $attendance) {
            if ((float) $attendance->worked_hours > 0) {
                $dailyHours[$date] = (float) $attendance->worked_hours;
            }
        }
        foreach ($workEntries as $date => $entries) {
            if (array_key_exists($date, $dailyHours) || $attendances->has($date)) {
                continue;
            }
            $dailyHours[$date] = round($entries->sum(fn (WorkOrderTimeEntry $entry) => (float) ($entry->duration_minutes ?? 0)) / 60, 2);
        }

        $workedHours = round(array_sum($dailyHours), 2);
        $overtimeHours = round(array_sum(array_map(fn (float $hours) => max(0, $hours - 8), $dailyHours)), 2);
        $medicalLeaveDays = $attendances->filter(fn (Attendance $attendance) => $attendance->status === 'medical')->count();
        $annualLeaveDays = $attendances->filter(fn (Attendance $attendance) => $attendance->status === 'concediu')->count();

        return compact('workedHours', 'overtimeHours', 'medicalLeaveDays', 'annualLeaveDays');
    }
}
