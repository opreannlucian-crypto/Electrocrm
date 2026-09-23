<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceItem extends Model
{
    protected $fillable = ['invoice_id','product_id','service_id','type','name','unit','quantity','unit_price','cost_unit','discount','vat_rate','net_amount','vat_amount','gross_amount'];
    protected $casts = ['quantity'=>'decimal:2','unit_price'=>'decimal:2','cost_unit'=>'decimal:2','discount'=>'decimal:2','vat_rate'=>'decimal:2','net_amount'=>'decimal:2','vat_amount'=>'decimal:2','gross_amount'=>'decimal:2'];
    public function invoice(): BelongsTo { return $this->belongsTo(Invoice::class); }
    public function product(): BelongsTo { return $this->belongsTo(Product::class); }
    public function service(): BelongsTo { return $this->belongsTo(Service::class); }
}
