<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class QuoteItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'quote_id',
        'product_id',
        'catalog_product_created',
        'type',
        'name',
        'unit',
        'quantity',
        'unit_price',
        'discount',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'discount' => 'decimal:2',
        'catalog_product_created' => 'boolean',
    ];

    public function quote()
    {
        return $this->belongsTo(
            Quote::class
        );
    }

    public function product()
    {
        return $this->belongsTo(
            Product::class
        );
    }
}
