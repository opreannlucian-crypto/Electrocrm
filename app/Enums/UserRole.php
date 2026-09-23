<?php

namespace App\Enums;

enum UserRole: string
{
    case Administrator = 'administrator';
    case SalesManager = 'sales_manager';
    case Technician = 'technician';

    public function label(): string
    {
        return match ($this) {
            self::Administrator => 'Administrator',
            self::SalesManager => 'Manager vânzări',
            self::Technician => 'Tehnician',
        };
    }

    /**
     * @return array<string, string>
     */
    public static function options(): array
    {
        return collect(self::cases())
            ->mapWithKeys(fn (self $role) => [$role->value => $role->label()])
            ->all();
    }
}
