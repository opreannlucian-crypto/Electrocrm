<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class QuoteTemplate extends Model { protected $fillable=['name','type','license_id','title','discount','vat_rate','notes','items','created_by']; protected $casts=['items'=>'array','discount'=>'decimal:2','vat_rate'=>'decimal:2']; public function license():BelongsTo{return $this->belongsTo(License::class);} public function creator():BelongsTo{return $this->belongsTo(User::class,'created_by');} }
