<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkOrderTimeEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'work_order_id',
        'employee_id',
        'started_at',
        'start_latitude',
        'start_longitude',
        'start_accuracy',
        'ended_at',
        'stop_latitude',
        'stop_longitude',
        'stop_accuracy',
        'duration_minutes',
        'notes',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'duration_minutes' => 'integer',
        'start_latitude' => 'decimal:7',
        'start_longitude' => 'decimal:7',
        'start_accuracy' => 'decimal:2',
        'stop_latitude' => 'decimal:7',
        'stop_longitude' => 'decimal:7',
        'stop_accuracy' => 'decimal:2',
    ];

    /**
     * Lucrarea asociata intervalului de pontaj.
     */
    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(
            WorkOrder::class,
            'work_order_id'
        );
    }

    /**
     * Angajatul asociat intervalului de pontaj.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(
            Employee::class,
            'employee_id'
        );
    }
}
