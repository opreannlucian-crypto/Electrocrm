<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class WorkOrder extends Model
{
    protected $fillable = [
        'client_id',
        'employee_id',
        'license_id',
        'number',
        'type',
        'work_type',
        'address',
        'contact_person',
        'phone',
        'scheduled_date',
        'scheduled_time',
        'started_at',
        'completed_at',
        'status',
        'description',
        'materials',
        'notes',
        'priority',
        'client_signature',
        'technician_signature',
        'completion_notes',
        'client_confirmation',
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'client_confirmation' => 'boolean',
    ];

    /**
     * Clientul lucrarii.
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(
            Client::class
        );
    }

    /**
     * Angajatul principal al lucrarii.
     *
     * Pastrat pentru compatibilitate cu sistemul existent.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(
            Employee::class
        );
    }

    /**
     * Tehnicienii alocati lucrarii.
     *
     * O lucrare poate avea unul sau mai multi tehnicieni.
     */
    public function employees(): BelongsToMany
    {
        return $this->belongsToMany(
            Employee::class,
            'work_order_employees'
        )->withTimestamps();
    }

    /**
     * Licenta / autorizatia folosita pentru lucrare.
     */
    public function license(): BelongsTo
    {
        return $this->belongsTo(
            License::class
        );
    }

    /**
     * Fotografiile lucrarii.
     */
    public function photos(): HasMany
    {
        return $this->hasMany(
            WorkOrderPhoto::class
        );
    }

    /**
     * Intervalele de timp lucrate pe aceasta lucrare.
     */
    public function timeEntries(): HasMany
    {
        return $this->hasMany(
            WorkOrderTimeEntry::class
        )->latest('started_at');
    }

    /**
     * Materialele consumate pe lucrare.
     *
     * Alias folosit de WorkOrderController:
     * materialsUsed.product
     */
    public function materialsUsed(): HasMany
    {
        return $this->hasMany(
            WorkOrderMaterial::class
        );
    }

    /**
     * Alias pentru relatia materials().
     */
    public function materials(): HasMany
    {
        return $this->hasMany(
            WorkOrderMaterial::class
        );
    }

    /**
     * Miscarile de stoc generate de lucrare.
     *
     * Un WorkOrder poate avea mai multe miscari de stoc.
     */
    public function stockMovements(): HasMany
    {
        return $this->hasMany(
            StockMovement::class
        );
    }

    public function documents(): MorphMany
    {
        return $this->morphMany(DocumentAttachment::class, 'attachable')->latest();
    }
}
