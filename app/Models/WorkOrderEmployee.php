<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkOrderEmployee extends Model
{
    protected $table = 'work_order_employees';

    protected $fillable = [
        'work_order_id',
        'employee_id',
    ];

    /**
     * Lucrarea.
     */
    public function workOrder(): BelongsTo
    {
        return $this->belongsTo(
            WorkOrder::class
        );
    }

    /**
     * Tehnicianul.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(
            Employee::class
        );
    }
}