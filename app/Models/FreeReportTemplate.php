<?php
namespace App\Models; use Illuminate\Database\Eloquent\Model;
class FreeReportTemplate extends Model { protected $fillable=['name','data','created_by']; protected $casts=['data'=>'array']; }
