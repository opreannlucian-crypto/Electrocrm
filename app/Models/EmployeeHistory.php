<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'user_id',
        'field',
        'old_value',
        'new_value',
        'action',
        'description',
    ];

    /**
     * Angajatul caruia ii apartine istoricul.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(
            Employee::class
        );
    }

    /**
     * Utilizatorul care a facut modificarea.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(
            User::class
        );
    }
}