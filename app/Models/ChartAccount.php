<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class ChartAccount extends Model { protected $fillable = ['code','name','class','type','active']; protected $casts = ['active' => 'boolean']; }
