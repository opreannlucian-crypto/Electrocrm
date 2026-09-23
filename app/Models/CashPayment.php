<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashPayment extends Model
{
    protected $fillable = ['supplier_payment_id', 'client_id', 'paid_at', 'operation_type', 'expense_category', 'beneficiary', 'document_number', 'amount', 'notes', 'created_by'];

    protected $casts = ['paid_at' => 'date', 'amount' => 'decimal:2'];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function supplierPayment(): BelongsTo
    {
        return $this->belongsTo(SupplierPayment::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
