<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'code', 'unit', 'sale_price', 'vat_rate', 'active', 'notes'];

    protected $casts = [
        'sale_price' => 'decimal:2',
        'vat_rate' => 'decimal:2',
        'active' => 'boolean',
    ];
}
