<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SalarySlip extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'payroll_rule_id',
        'created_by',
        'period_start',
        'period_end',
        'period_label',
        'status',
        'calculation_mode',
        'tax_facility_code',
        'scheduled_hours',
        'worked_hours',
        'overtime_hours',
        'medical_leave_days',
        'annual_leave_days',
        'gross_base',
        'gross_income',
        'non_cash_benefits',
        'personal_deduction',
        'cas_base',
        'cas_rate',
        'cas_amount',
        'cass_base',
        'cass_rate',
        'cass_amount',
        'income_tax_base',
        'income_tax_rate',
        'income_tax_amount',
        'other_deductions',
        'net_pay',
        'employer_cam_base',
        'employer_cam_rate',
        'employer_cam_amount',
        'employer_total_cost',
        'calculation_snapshot',
        'notes',
        'verified_at',
        'verified_by',
        'finalized_at',
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
        'verified_at' => 'datetime',
        'finalized_at' => 'datetime',
        'calculation_snapshot' => 'array',
        'scheduled_hours' => 'decimal:2',
        'worked_hours' => 'decimal:2',
        'overtime_hours' => 'decimal:2',
        'medical_leave_days' => 'decimal:2',
        'annual_leave_days' => 'decimal:2',
        'gross_base' => 'decimal:2',
        'gross_income' => 'decimal:2',
        'non_cash_benefits' => 'decimal:2',
        'personal_deduction' => 'decimal:2',
        'cas_base' => 'decimal:2',
        'cas_rate' => 'decimal:4',
        'cas_amount' => 'decimal:2',
        'cass_base' => 'decimal:2',
        'cass_rate' => 'decimal:4',
        'cass_amount' => 'decimal:2',
        'income_tax_base' => 'decimal:2',
        'income_tax_rate' => 'decimal:4',
        'income_tax_amount' => 'decimal:2',
        'other_deductions' => 'decimal:2',
        'net_pay' => 'decimal:2',
        'employer_cam_base' => 'decimal:2',
        'employer_cam_rate' => 'decimal:4',
        'employer_cam_amount' => 'decimal:2',
        'employer_total_cost' => 'decimal:2',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function payrollRule(): BelongsTo
    {
        return $this->belongsTo(PayrollRule::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(SalarySlipItem::class)->orderBy('sort_order')->orderBy('id');
    }

    public function isFinalized(): bool
    {
        return $this->status === 'finalized';
    }
}
