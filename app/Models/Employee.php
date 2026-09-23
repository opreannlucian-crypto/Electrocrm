<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'email',
        'position',
        'department',
        'hire_date',
        'salary',
        'schedule',
        'status',
        'active',
        'notes',
        'cnp',
        'employment_type',
        'is_primary_job',
        'monthly_norm_hours',
        'dependent_count',
        'tax_facility_code',
        'payroll_settings',
    ];

    protected $casts = [
        'active' => 'boolean',
        'hire_date' => 'date',
        'salary' => 'decimal:2',
        'is_primary_job' => 'boolean',
        'monthly_norm_hours' => 'decimal:2',
        'payroll_settings' => 'array',
    ];

    /**
     * Utilizatorul asociat angajatului.
     */
    public function user(): HasOne
    {
        return $this->hasOne(
            User::class,
            'employee_id'
        );
    }

    /**
     * Pontajele angajatului.
     */
    public function attendances(): HasMany
    {
        return $this->hasMany(
            Attendance::class
        );
    }

    /**
     * Intervalele de timp lucrate pe lucrari.
     */
    public function workOrderTimeEntries(): HasMany
    {
        return $this->hasMany(
            WorkOrderTimeEntry::class
        )->latest('started_at');
    }

    /**
     * Lucrarile la care este alocat angajatul.
     */
    public function workOrders(): BelongsToMany
    {
        return $this->belongsToMany(
            WorkOrder::class,
            'work_order_employees'
        )->withTimestamps();
    }

    /**
     * Istoricul modificarilor angajatului.
     */
    public function histories(): HasMany
    {
        return $this->hasMany(
            EmployeeHistory::class
        )->latest();
    }

    /**
     * Documentele angajatului.
     */
    public function documents(): HasMany
    {
        return $this->hasMany(
            EmployeeDocument::class
        )->latest();
    }

    /**
     * Fluturașii salariali ai angajatului.
     */
    public function salarySlips(): HasMany
    {
        return $this->hasMany(SalarySlip::class)->latest('period_start');
    }
}