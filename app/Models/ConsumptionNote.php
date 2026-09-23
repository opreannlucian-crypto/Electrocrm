<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
class ConsumptionNote extends Model { protected $fillable=['warehouse_id','work_order_id','number','issued_at','recipient','notes','created_by']; protected $casts=['issued_at'=>'date']; public function warehouse():BelongsTo{return $this->belongsTo(Warehouse::class);} public function workOrder():BelongsTo{return $this->belongsTo(WorkOrder::class);} public function items():HasMany{return $this->hasMany(ConsumptionNoteItem::class);} }
