<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Quote extends Model
{
    protected $fillable = [
        'work_order_id',
        'client_id',
        'prepared_by',
        'license_id',
        'number',
        'type',
        'title',
        'date',
        'status',
        'discount',
        'vat_rate',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'discount' => 'decimal:2',
        'vat_rate' => 'decimal:2',
    ];

    /**
     * Clientul ofertei
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * Lucrarea asociată
     */
    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class);
    }

    /**
     * Licența / autorizația
     */
    public function license(): BelongsTo
    {
        return $this->belongsTo(License::class);
    }

    /**
     * Produsele și manopera
     */
    public function items(): HasMany
    {
        return $this->hasMany(QuoteItem::class);
    }
}
