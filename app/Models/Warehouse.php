<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
class Warehouse extends Model { protected $fillable=['name','code','type','address','responsible','active']; protected $casts=['active'=>'boolean']; public function stocks(): HasMany { return $this->hasMany(ProductStock::class); } }
