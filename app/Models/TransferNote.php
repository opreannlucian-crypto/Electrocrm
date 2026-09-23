<?php
namespace App\Models; use Illuminate\Database\Eloquent\Model; use Illuminate\Database\Eloquent\Relations\{BelongsTo,HasMany};
class TransferNote extends Model {protected $fillable=['from_warehouse_id','to_warehouse_id','number','issued_at','notes','created_by'];protected $casts=['issued_at'=>'date'];public function fromWarehouse():BelongsTo{return $this->belongsTo(Warehouse::class,'from_warehouse_id');}public function toWarehouse():BelongsTo{return $this->belongsTo(Warehouse::class,'to_warehouse_id');}public function items():HasMany{return $this->hasMany(TransferNoteItem::class);}}
