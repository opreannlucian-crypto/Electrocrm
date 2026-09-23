<?php

use App\Models\Employee;
use App\Models\PayrollRule;
use App\Models\SalarySlip;
use App\Services\Payroll\SalarySlipCalculator;
use Illuminate\Support\Facades\DB;

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$source = SalarySlip::with('items')->findOrFail(3);
$employee = Employee::findOrFail($source->employee_id);
$rule = PayrollRule::findOrFail($source->payroll_rule_id);

$items = $source->items
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
    'period_start' => $source->period_start->toDateString(),
    'period_end' => $source->period_end->toDateString(),
    'period_label' => $source->period_label . ' — rectificare',
    'calculation_mode' => 'full_month',
    'gross_base' => $source->gross_base,
    'scheduled_hours' => 184,
    'worked_hours' => 176,
    'overtime_hours' => 2,
    'overtime_compensation_mode' => 'paid_premium',
    'medical_leave_days' => 0,
    'annual_leave_days' => 1,
    'personal_deduction' => $source->personal_deduction,
    'dependent_count' => data_get($source->calculation_snapshot, 'dependent_count', 0),
    'tax_facility_code' => $source->tax_facility_code,
    'rate_overrides' => [
        'cas_rate' => $source->cas_rate,
        'cass_rate' => $source->cass_rate,
        'income_tax_rate' => $source->income_tax_rate,
        'employer_cam_rate' => $source->employer_cam_rate,
        'overtime_premium_rate' => 200,
    ],
    'items' => $items,
    'notes' => 'Rectificare pentru fluturașul finalizat nr. 3: 184 ore normă, 176 ore lucrate, 2 ore suplimentare cu majorare 200%, 1 zi concediu de odihnă.',
];

$calculation = app(SalarySlipCalculator::class)->calculate($employee, $rule, $payload);

$rectification = DB::transaction(function () use ($source, $payload, $calculation) {
    $slip = SalarySlip::create(array_merge([
        'employee_id' => $source->employee_id,
        'payroll_rule_id' => $source->payroll_rule_id,
        'created_by' => $source->created_by,
    ], [
        'period_start' => $payload['period_start'],
        'period_end' => $payload['period_end'],
        'period_label' => $payload['period_label'],
        'status' => 'draft',
        'notes' => $payload['notes'],
        'calculation_snapshot' => array_merge($calculation['snapshot'], ['rectifies_salary_slip_id' => $source->id]),
    ], $calculation['summary']));
    $slip->items()->createMany($calculation['items']);
    return $slip->fresh(['items']);
});

echo json_encode([
    'id' => $rectification->id,
    'period_label' => $rectification->period_label,
    'scheduled_hours' => $rectification->scheduled_hours,
    'worked_hours' => $rectification->worked_hours,
    'overtime_hours' => $rectification->overtime_hours,
    'annual_leave_days' => $rectification->annual_leave_days,
    'gross_income' => $rectification->gross_income,
    'net_pay' => $rectification->net_pay,
    'items' => $rectification->items->map(fn ($item) => [$item->code, $item->description, $item->amount])->all(),
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . PHP_EOL;
