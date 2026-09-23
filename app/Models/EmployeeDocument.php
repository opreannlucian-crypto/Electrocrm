<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'user_id',
        'category',
        'name',
        'document_number',
        'document_date',
        'valid_from',
        'valid_until',
        'period_start',
        'period_end',
        'status',
        'description',
        'file_path',
        'original_name',
        'mime_type',
        'file_size',
    ];

    protected $casts = [
        'document_date' => 'date',
        'valid_from' => 'date',
        'valid_until' => 'date',
        'period_start' => 'date',
        'period_end' => 'date',
        'file_size' => 'integer',
    ];

    /**
     * Angajatul caruia ii apartine documentul.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(
            Employee::class
        );
    }

    /**
     * Utilizatorul care a incarcat documentul.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(
            User::class
        );
    }
}