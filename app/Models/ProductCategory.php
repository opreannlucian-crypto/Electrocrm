<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductCategory extends Model
{
    protected $fillable = ['name', 'code', 'inventory_account', 'expense_account', 'revenue_account', 'notes', 'active'];
    protected $casts = ['active' => 'boolean'];

    public function products(): HasMany { return $this->hasMany(Product::class); }
}
