<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryDocument extends Model
{
    protected $fillable = ['warehouse_id', 'number', 'inventoried_at', 'status', 'notes', 'created_by', 'applied_at', 'applied_by'];
    protected $casts = ['inventoried_at' => 'date', 'applied_at' => 'datetime'];

    public function warehouse(): BelongsTo { return $this->belongsTo(Warehouse::class); }
    public function items(): HasMany { return $this->hasMany(InventoryDocumentItem::class); }
}
