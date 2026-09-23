<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PayrollRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'valid_from',
        'valid_to',
        'rates',
        'source_reference',
        'notes',
        'approved_by',
    ];

    protected $casts = [
        'valid_from' => 'date',
        'valid_to' => 'date',
        'rates' => 'array',
    ];

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function salarySlips(): HasMany
    {
        return $this->hasMany(SalarySlip::class);
    }

    public function appliesTo(string $date): bool
    {
        return $this->valid_from->lte($date)
            && (!$this->valid_to || $this->valid_to->gte($date));
    }
}
