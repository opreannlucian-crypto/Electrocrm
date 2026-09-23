<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FreeReport extends Model
{
    protected $fillable = [
        'number',
        'title',
        'document_date',
        'location',

        'client_name',
        'client_cui',
        'client_address',
        'client_phone',
        'contact_person',

        'work_order_id',
        'quote_id',
        'license_id',

        'license_name',
        'license_description',

        'participants',
        'subject',
        'content',
        'findings',
        'conclusions',
        'observations',

        'provider_signature_name',
        'provider_signature_position',

        'client_signature_name',
        'client_signature_position',

        'user_id',
    ];

    protected $casts = [
        'document_date' => 'date',
    ];

    public function workOrder()
    {
        return $this->belongsTo(
            WorkOrder::class
        );
    }

    public function quote()
    {
        return $this->belongsTo(
            Quote::class
        );
    }

    public function license()
    {
        return $this->belongsTo(
            License::class
        );
    }

    public function user()
    {
        return $this->belongsTo(
            User::class
        );
    }
}