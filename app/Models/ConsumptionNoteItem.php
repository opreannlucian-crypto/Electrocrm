<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class ConsumptionNoteItem extends Model { protected $fillable=['consumption_note_id','product_id','product_name','unit','quantity','unit_price','line_total']; protected $casts=['quantity'=>'decimal:2','unit_price'=>'decimal:2','line_total'=>'decimal:2']; public function consumptionNote():BelongsTo{return $this->belongsTo(ConsumptionNote::class);} public function product():BelongsTo{return $this->belongsTo(Product::class);} }
