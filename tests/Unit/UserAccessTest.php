<?php

namespace Tests\Unit;

use App\Enums\UserRole;
use App\Models\User;
use PHPUnit\Framework\TestCase;

class UserAccessTest extends TestCase
{
    public function test_administrator_and_sales_manager_have_access_to_all_modules(): void
    {
        $administrator = new User(['role' => UserRole::Administrator->value]);
        $salesManager = new User(['role' => UserRole::SalesManager->value]);

        $this->assertTrue($administrator->canAccessModule('products'));
        $this->assertTrue($administrator->canAccessModule('users'));
        $this->assertTrue($salesManager->canAccessModule('products'));
        $this->assertTrue($salesManager->canAccessModule('contracts'));
        $this->assertTrue($administrator->canAccessModule('salary_slips'));
        $this->assertTrue($salesManager->canAccessModule('salary_slips'));
    }

    public function test_technician_access_respects_modules_selected_by_administrator(): void
    {
        $technician = new User([
            'role' => UserRole::Technician->value,
            'allowed_modules' => [
                'work_orders',
                'calendar',
                'attendance',
                'client_creation',
            ],
        ]);

        $this->assertTrue($technician->canAccessModule('work_orders'));
        $this->assertTrue($technician->canAccessModule('calendar'));
        $this->assertTrue($technician->canAccessModule('attendance'));
        $this->assertTrue($technician->canAccessModule('client_creation'));
        $this->assertFalse($technician->canAccessModule('clients'));
        $this->assertFalse($technician->canAccessModule('products'));
        $this->assertFalse($technician->canAccessModule('employees'));
        $this->assertFalse($technician->canAccessModule('salary_slips'));
    }
}
