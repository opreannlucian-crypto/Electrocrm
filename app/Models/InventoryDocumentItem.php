<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryDocumentItem extends Model
{
    protected $fillable = ['inventory_document_id', 'product_id', 'product_name', 'unit', 'book_quantity', 'counted_quantity', 'unit_price'];
    protected $casts = ['book_quantity' => 'decimal:3', 'counted_quantity' => 'decimal:3', 'unit_price' => 'decimal:2'];

    public function inventoryDocument(): BelongsTo { return $this->belongsTo(InventoryDocument::class); }
    public function product(): BelongsTo { return $this->belongsTo(Product::class); }
}
