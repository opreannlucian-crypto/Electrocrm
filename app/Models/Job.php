<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Job extends Model
{
    protected $table = 'work_orders';

    protected $fillable = [
        'client_id',
        'employee_id',
        'number',
        'type',
        'work_type',
        'priority',
        'address',
        'contact_person',
        'phone',
        'scheduled_date',
        'scheduled_time',
        'status',
        'description',
        'materials',
        'notes',
    ];

    protected $casts = [
        'scheduled_date' => 'date',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }
}
