<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalarySlipItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'salary_slip_id',
        'category',
        'code',
        'description',
        'quantity',
        'rate',
        'amount',
        'include_cas',
        'include_cass',
        'include_income_tax',
        'cash_effect',
        'support_source',
        'metadata',
        'sort_order',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'rate' => 'decimal:4',
        'amount' => 'decimal:2',
        'include_cas' => 'boolean',
        'include_cass' => 'boolean',
        'include_income_tax' => 'boolean',
        'cash_effect' => 'boolean',
        'metadata' => 'array',
    ];

    public function salarySlip(): BelongsTo
    {
        return $this->belongsTo(SalarySlip::class);
    }
}
