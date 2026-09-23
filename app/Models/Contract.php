<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Contract extends Model
{
    protected $fillable = [
        'number',
        'title',
        'contract_date',
        'type',
        'status',

        'client_id',

        'work_order_id',
        'quote_id',

        'license_id',
        'license_name',
        'license_description',

        'location',
        'contact_person',

        'subject',

        'value',
        'currency',

        'duration',
        'payment_terms',

        'content',
        'clauses',
        'observations',

        'provider_signature_name',
        'provider_signature_position',

        'client_signature_name',
        'client_signature_position',

        'template_id',

        'user_id',
    ];

    protected $casts = [
        'contract_date' => 'date',
        'value' => 'decimal:2',
    ];

    /**
     * Clientul contractului.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(
            Client::class
        );
    }

    /**
     * Lucrarea asociata.
     */
    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(
            WorkOrder::class
        );
    }

    /**
     * Oferta / deviz asociat.
     */
    public function quote(): BelongsTo
    {
        return $this->belongsTo(
            Quote::class
        );
    }

    /**
     * Licenta / autorizatie.
     */
    public function license(): BelongsTo
    {
        return $this->belongsTo(
            License::class
        );
    }

    /**
     * Sablonul din care a fost creat contractul.
     */
    public function template(): BelongsTo
    {
        return $this->belongsTo(
            ContractTemplate::class,
            'template_id'
        );
    }

    /**
     * Utilizatorul care a creat contractul.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(
            User::class
        );
    }
}