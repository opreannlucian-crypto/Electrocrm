<?php

namespace App\Services\Payroll;

use App\Models\Employee;
use App\Models\PayrollRule;

class SalarySlipCalculator
{
    /**
     * Calculează un fluturaș pornind de la brut, regulă datată și componente explicite.
     * Nu deduce automat facilități fiscale doar din funcție sau departament.
     */
    public function calculate(Employee $employee, PayrollRule $rule, array $payload): array
    {
        $rates = $rule->rates ?? [];
        $overrides = $payload['rate_overrides'] ?? [];

        $casRate = $this->rate($overrides['cas_rate'] ?? null, $rates['cas_rate'] ?? 0);
        $cassRate = $this->rate($overrides['cass_rate'] ?? null, $rates['cass_rate'] ?? 0);
        $incomeTaxRate = $this->rate($overrides['income_tax_rate'] ?? null, $rates['income_tax_rate'] ?? 0);
        $camRate = $this->rate($overrides['employer_cam_rate'] ?? null, $rates['employer_cam_rate'] ?? 0);
        $overtimePremiumRate = max(0, $this->number($overrides['overtime_premium_rate'] ?? $rates['overtime_premium_rate'] ?? 100));
        $overtimeCompensationMode = $payload['overtime_compensation_mode'] ?? $rates['overtime_compensation_mode'] ?? 'paid_premium';
        $overtimeCompensationMode = in_array($overtimeCompensationMode, ['paid_premium', 'paid_time_off'], true) ? $overtimeCompensationMode : 'paid_premium';

        $scheduledHours = $this->number($payload['scheduled_hours'] ?? $employee->monthly_norm_hours ?? $rates['monthly_norm_hours'] ?? 0);
        $workedHours = array_key_exists('worked_hours', $payload) && $payload['worked_hours'] !== null && $payload['worked_hours'] !== ''
            ? $this->number($payload['worked_hours'])
            : $scheduledHours;
        $overtimeHours = $this->number($payload['overtime_hours'] ?? 0);
        $medicalLeaveDays = $this->number($payload['medical_leave_days'] ?? 0);
        $annualLeaveDays = $this->number($payload['annual_leave_days'] ?? 0);
        $grossMonthly = $this->number($payload['gross_base'] ?? $employee->salary ?? 0);
        $calculationMode = $payload['calculation_mode'] ?? 'full_month';

        $grossBase = $grossMonthly;
        if ($calculationMode === 'pro_rata' && $scheduledHours > 0) {
            $grossBase = round($grossMonthly * min(1, max(0, $workedHours / $scheduledHours)), 2);
        }

        $items = [];
        $overtimeHourlyRate = $scheduledHours > 0 ? round($grossMonthly / $scheduledHours, 4) : 0;
        $overtimeBaseAmount = 0.0;
        $overtimePremiumAmount = 0.0;
        $overtimeTotalAmount = 0.0;

        if ($overtimeHours > 0 && $overtimeCompensationMode === 'paid_premium' && $overtimeHourlyRate > 0) {
            $overtimeBaseAmount = round($overtimeHours * $overtimeHourlyRate, 2);
            $overtimePremiumAmount = round($overtimeBaseAmount * $overtimePremiumRate / 100, 2);
            $overtimeTotalAmount = round($overtimeBaseAmount + $overtimePremiumAmount, 2);
            $items[] = [
                'category' => 'income',
                'code' => 'OVERTIME',
                'description' => "Plata ore suplimentare ({$overtimePremiumRate}% majorare)",
                'quantity' => $overtimeHours,
                'rate' => round($overtimeHourlyRate * (1 + $overtimePremiumRate / 100), 4),
                'amount' => $overtimeTotalAmount,
                'include_cas' => true,
                'include_cass' => true,
                'include_income_tax' => true,
                'cash_effect' => true,
                'support_source' => 'employer',
                'metadata' => [
                    'base_hourly_rate' => $overtimeHourlyRate,
                    'base_amount' => $overtimeBaseAmount,
                    'premium_rate' => $overtimePremiumRate,
                    'premium_amount' => $overtimePremiumAmount,
                    'compensation_mode' => $overtimeCompensationMode,
                ],
                'sort_order' => 0,
            ];
        }

        foreach ($payload['items'] ?? [] as $index => $item) {
            $hasQuantityAndRate = array_key_exists('quantity', $item) && $item['quantity'] !== ''
                && array_key_exists('rate', $item) && $item['rate'] !== '';
            $quantity = array_key_exists('quantity', $item) && $item['quantity'] !== '' ? $this->number($item['quantity']) : null;
            $rate = array_key_exists('rate', $item) && $item['rate'] !== '' ? $this->number($item['rate']) : null;
            $amount = $hasQuantityAndRate
                ? round($quantity * $rate, 2)
                : $this->number($item['amount'] ?? 0);

            if ($amount <= 0 || empty($item['description'])) {
                continue;
            }

            $items[] = [
                'category' => in_array($item['category'] ?? '', ['income', 'benefit', 'medical_leave', 'deduction'], true) ? $item['category'] : 'income',
                'code' => trim((string) ($item['code'] ?? '')) ?: null,
                'description' => trim((string) $item['description']),
                'quantity' => $quantity,
                'rate' => $rate,
                'amount' => $amount,
                'include_cas' => $this->bool($item['include_cas'] ?? true),
                'include_cass' => $this->bool($item['include_cass'] ?? true),
                'include_income_tax' => $this->bool($item['include_income_tax'] ?? true),
                'cash_effect' => $this->bool($item['cash_effect'] ?? true),
                'support_source' => trim((string) ($item['support_source'] ?? '')) ?: null,
                'metadata' => $item['metadata'] ?? null,
                'sort_order' => count($items),
            ];
        }

        $positiveItems = array_filter($items, fn (array $item) => $item['category'] !== 'deduction');
        $deductionItems = array_filter($items, fn (array $item) => $item['category'] === 'deduction');

        $grossIncome = $grossBase + array_sum(array_map(fn (array $item) => $item['amount'], $positiveItems));
        $cashIncome = $grossBase + array_sum(array_map(fn (array $item) => $item['cash_effect'] ? $item['amount'] : 0, $positiveItems));
        $nonCashBenefits = array_sum(array_map(fn (array $item) => $item['category'] === 'benefit' && !$item['cash_effect'] ? $item['amount'] : 0, $positiveItems));

        $casBase = $grossBase + array_sum(array_map(fn (array $item) => $item['include_cas'] ? $item['amount'] : 0, $positiveItems));
        $cassBase = $grossBase + array_sum(array_map(fn (array $item) => $item['include_cass'] ? $item['amount'] : 0, $positiveItems));
        $incomeTaxEligible = $grossBase + array_sum(array_map(fn (array $item) => $item['include_income_tax'] ? $item['amount'] : 0, $positiveItems));

        $personalDeduction = $this->number($payload['personal_deduction'] ?? 0);
        $casAmount = round($casBase * $casRate / 100, 2);
        $cassAmount = round($cassBase * $cassRate / 100, 2);
        $incomeTaxBase = max(0, round($incomeTaxEligible - $casAmount - $cassAmount - $personalDeduction, 2));
        $incomeTaxAmount = round($incomeTaxBase * $incomeTaxRate / 100, 2);
        $otherDeductions = round(array_sum(array_map(fn (array $item) => $item['amount'], $deductionItems)), 2);
        $netPay = round(max(0, $cashIncome - $casAmount - $cassAmount - $incomeTaxAmount - $otherDeductions), 2);
        $camBase = $grossIncome;
        $camAmount = round($camBase * $camRate / 100, 2);
        $employerTotalCost = round($grossIncome + $camAmount, 2);

        return [
            'items' => $items,
            'summary' => [
                'calculation_mode' => $calculationMode,
                'tax_facility_code' => trim((string) ($payload['tax_facility_code'] ?? $employee->tax_facility_code ?? '')) ?: null,
                'scheduled_hours' => $scheduledHours,
                'worked_hours' => $workedHours,
                'overtime_hours' => $overtimeHours,
                'medical_leave_days' => $medicalLeaveDays,
                'annual_leave_days' => $annualLeaveDays,
                'gross_base' => round($grossBase, 2),
                'gross_income' => round($grossIncome, 2),
                'non_cash_benefits' => round($nonCashBenefits, 2),
                'personal_deduction' => $personalDeduction,
                'cas_base' => round($casBase, 2),
                'cas_rate' => $casRate,
                'cas_amount' => $casAmount,
                'cass_base' => round($cassBase, 2),
                'cass_rate' => $cassRate,
                'cass_amount' => $cassAmount,
                'income_tax_base' => $incomeTaxBase,
                'income_tax_rate' => $incomeTaxRate,
                'income_tax_amount' => $incomeTaxAmount,
                'other_deductions' => $otherDeductions,
                'net_pay' => $netPay,
                'employer_cam_base' => round($camBase, 2),
                'employer_cam_rate' => $camRate,
                'employer_cam_amount' => $camAmount,
                'employer_total_cost' => $employerTotalCost,
            ],
            'snapshot' => [
                'rule_code' => $rule->code,
                'rule_name' => $rule->name,
                'rule_valid_from' => $rule->valid_from?->toDateString(),
                'rule_valid_to' => $rule->valid_to?->toDateString(),
                'rule_rates' => $rates,
                'rate_overrides' => $overrides,
                'annual_leave_days' => $annualLeaveDays,
                'overtime' => [
                    'compensation_mode' => $overtimeCompensationMode,
                    'hours' => $overtimeHours,
                    'base_hourly_rate' => $overtimeHourlyRate,
                    'premium_rate' => $overtimePremiumRate,
                    'base_amount' => $overtimeBaseAmount,
                    'premium_amount' => $overtimePremiumAmount,
                    'total_amount' => $overtimeTotalAmount,
                ],
                'dependent_count' => (int) ($payload['dependent_count'] ?? $employee->dependent_count ?? 0),
                'tax_facility_code' => trim((string) ($payload['tax_facility_code'] ?? $employee->tax_facility_code ?? '')) ?: null,
                'source_reference' => $rule->source_reference,
                'calculated_at' => now()->toIso8601String(),
            ],
        ];
    }

    private function rate(mixed $override, mixed $default): float
    {
        return max(0, min(100, $this->number($override !== null && $override !== '' ? $override : $default)));
    }

    private function number(mixed $value): float
    {
        return round((float) $value, 2);
    }

    private function bool(mixed $value): bool
    {
        return filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? (bool) $value;
    }
}
