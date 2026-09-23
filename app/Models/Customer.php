<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $fillable = [

        'company_name',
        'contact_name',
        'cui',
        'phone',
        'email',
        'address',
        'city',
        'county',
        'type',
        'notes',

    ];
}