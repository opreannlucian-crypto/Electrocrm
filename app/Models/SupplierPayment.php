<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasOne};

class SupplierPayment extends Model
{
    protected $fillable = ['supplier_id', 'reception_id', 'paid_at', 'amount', 'payment_method', 'expense_category', 'reference', 'document_number', 'notes', 'created_by'];
    protected $casts = ['paid_at' => 'date', 'amount' => 'decimal:2'];

    public function supplier(): BelongsTo { return $this->belongsTo(Supplier::class); }
    public function reception(): BelongsTo { return $this->belongsTo(Reception::class); }
    public function creator(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }
    public function cashPayment(): HasOne { return $this->hasOne(CashPayment::class); }
}
