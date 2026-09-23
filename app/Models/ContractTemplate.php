<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ContractTemplate extends Model
{
    protected $fillable = [
        'name',
        'type',
        'title',
        'description',
        'content',

        'default_value',
        'default_duration',
        'default_payment_terms',
        'default_notes',

        'provider_signature_name',
        'provider_signature_position',

        'client_signature_name',
        'client_signature_position',

        'active',
        'sort_order',

        'user_id',
    ];

    protected $casts = [
        'default_value' => 'decimal:2',
        'active' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Utilizatorul care a creat sablonul.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(
            User::class
        );
    }

    /**
     * Contractele create din acest sablon.
     */
    public function contracts(): HasMany
    {
        return $this->hasMany(
            Contract::class,
            'template_id'
        );
    }
}