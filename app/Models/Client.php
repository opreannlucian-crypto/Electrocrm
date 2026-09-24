<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Client extends Model
{
    protected $fillable = [

        'type',
        'name',
        'cui',

        'tva_status',
        'anaf_name',
        'anaf_checked_at',

        'contact_person',
        'phone',
        'email',
        'address',
        'city',
        'notes',

    ];


    public function jobs()
    {
        return $this->hasMany(Job::class);
    }


    public function quotes()
    {
        return $this->hasMany(
            Quote::class
        );
    }


    public function workOrders()
    {
        return $this->hasMany(WorkOrder::class);
    }

    public function projects()
    {
        return $this->hasMany(Project::class);
    }

    public function documents(): MorphMany
    {
        return $this->morphMany(DocumentAttachment::class, 'attachable')->latest();
    }
}
