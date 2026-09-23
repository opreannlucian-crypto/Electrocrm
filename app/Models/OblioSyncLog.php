<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OblioSyncLog extends Model
{
    protected $fillable = [
        'invoice_id',
        'operation',
        'direction',
        'status',
        'attempt',
        'http_status',
        'idempotency_key',
        'request_summary',
        'response_summary',
        'error_message',
        'occurred_at',
    ];

    protected function casts(): array
    {
        return [
            'request_summary' => 'array',
            'response_summary' => 'array',
            'occurred_at' => 'datetime',
        ];
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }
}
