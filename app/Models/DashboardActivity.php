<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DashboardActivity extends Model
{
    protected $fillable = ['activity_date', 'title', 'notes', 'assigned_employee_id', 'status', 'completed_at', 'created_by'];

    protected $casts = ['activity_date' => 'date', 'completed_at' => 'datetime'];

    public function assignedEmployee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'assigned_employee_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
