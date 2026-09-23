<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'ean',
        'category',
        'unit',
        'stock_quantity',
        'purchase_price',
        'sale_price',
        'vat_rate',
        'minimum_stock',
        'active',
        'notes',
    ];

    protected $casts = [
        'stock_quantity' => 'decimal:2',
        'purchase_price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'vat_rate' => 'decimal:2',
        'minimum_stock' => 'decimal:2',
        'active' => 'boolean',
    ];

    /*
    |--------------------------------------------------------------------------
    | Miscari de stoc
    |--------------------------------------------------------------------------
    */

    public function stockMovements()
    {
        return $this->hasMany(
            StockMovement::class
        );
    }

    public function productCategory(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Materiale consumate in lucrari
    |--------------------------------------------------------------------------
    */

    public function workOrderMaterials()
    {
        return $this->hasMany(
            WorkOrderMaterial::class
        );
    }
}
