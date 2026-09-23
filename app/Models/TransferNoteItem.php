<?php
namespace App\Models; use Illuminate\Database\Eloquent\Model; use Illuminate\Database\Eloquent\Relations\BelongsTo;
class TransferNoteItem extends Model {protected $fillable=['transfer_note_id','product_id','product_name','unit','quantity'];protected $casts=['quantity'=>'decimal:2'];public function transferNote():BelongsTo{return $this->belongsTo(TransferNote::class);}public function product():BelongsTo{return $this->belongsTo(Product::class);}}
