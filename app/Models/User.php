<?php

namespace App\Models;

use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable([
    'name',
    'email',
    'password',
    'employee_id',
    'role',
    'allowed_modules',
])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    public const MODULES = [
        'dashboard' => 'Dashboard',
        'work_orders' => 'Lucrări proprii',
        'calendar' => 'Calendar propriu',
        'attendance' => 'Pontaj propriu',
        'client_creation' => 'Adăugare client nou',
    ];

    /**
     * Angajatul asociat contului de utilizator.
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }

    public function notificationDeliveries(): MorphMany
    {
        return $this->morphMany(NotificationDelivery::class, 'recipient');
    }

    public function notificationPreferences(): MorphMany
    {
        return $this->morphMany(NotificationPreference::class, 'notifiable');
    }

    public function isAdministrator(): bool
    {
        return $this->role === UserRole::Administrator;
    }

    public function isSalesManager(): bool
    {
        return $this->role === UserRole::SalesManager;
    }

    public function isTechnician(): bool
    {
        return $this->role === UserRole::Technician;
    }

    public function hasRole(UserRole|string ...$roles): bool
    {
        return collect($roles)
            ->map(fn (UserRole|string $role) => $role instanceof UserRole ? $role->value : $role)
            ->contains($this->role?->value ?? $this->role);
    }

    public function canAccessModule(string $module): bool
    {
        if ($this->isAdministrator() || $this->isSalesManager()) {
            return true;
        }

        if (!$this->isTechnician()) {
            return false;
        }

        return in_array($module, $this->permittedModules(), true);
    }

    /**
     * @return array<int, string>
     */
    public function permittedModules(): array
    {
        if ($this->isAdministrator() || $this->isSalesManager()) {
            return array_keys(self::MODULES);
        }

        $modules = $this->allowed_modules;

        if (is_array($modules)) {
            return array_values(array_intersect($modules, array_keys(self::MODULES)));
        }

        return array_keys(self::MODULES);
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            'allowed_modules' => 'array',
        ];
    }
}
