<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'date',
        'check_in',
        'start_latitude',
        'start_longitude',
        'start_accuracy',
        'check_out',
        'stop_latitude',
        'stop_longitude',
        'stop_accuracy',
        'break_minutes',
        'worked_hours',
        'status',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'worked_hours' => 'decimal:2',
        'break_minutes' => 'integer',
        'start_latitude' => 'decimal:7',
        'start_longitude' => 'decimal:7',
        'start_accuracy' => 'decimal:2',
        'stop_latitude' => 'decimal:7',
        'stop_longitude' => 'decimal:7',
        'stop_accuracy' => 'decimal:2',
    ];

    /**
     * Angajatul căruia îi aparține pontajul.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
