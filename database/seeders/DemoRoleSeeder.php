<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Client;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class DemoRoleSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(NotificationRuleSeeder::class);

        $adminEmployee = Employee::create([
            'name' => 'Ana Administrator',
            'email' => 'ana.admin@electrocrm.test',
            'position' => 'Administrator',
            'department' => 'Management',
            'active' => true,
            'status' => 'Activ',
        ]);

        $salesEmployee = Employee::create([
            'name' => 'Mihai Vânzări',
            'email' => 'mihai.vanzari@electrocrm.test',
            'position' => 'Manager vânzări',
            'department' => 'Vânzări',
            'active' => true,
            'status' => 'Activ',
        ]);

        $technicianOne = Employee::create([
            'name' => 'Tudor Tehnician',
            'email' => 'tudor.tehnician@electrocrm.test',
            'position' => 'Tehnician electric',
            'department' => 'Execuție',
            'active' => true,
            'status' => 'Activ',
        ]);

        $technicianTwo = Employee::create([
            'name' => 'Elena Tehnician',
            'email' => 'elena.tehnician@electrocrm.test',
            'position' => 'Tehnician electric',
            'department' => 'Execuție',
            'active' => true,
            'status' => 'Activ',
        ]);

        $password = Hash::make('Testare2026!');

        User::create([
            'name' => 'Ana Administrator',
            'email' => 'admin@electrocrm.test',
            'password' => $password,
            'employee_id' => $adminEmployee->id,
            'role' => UserRole::Administrator->value,
        ]);

        User::create([
            'name' => 'Mihai Vânzări',
            'email' => 'vanzari@electrocrm.test',
            'password' => $password,
            'employee_id' => $salesEmployee->id,
            'role' => UserRole::SalesManager->value,
        ]);

        User::create([
            'name' => 'Tudor Tehnician',
            'email' => 'tehnician@electrocrm.test',
            'password' => $password,
            'employee_id' => $technicianOne->id,
            'role' => UserRole::Technician->value,
            'allowed_modules' => [
                'dashboard',
                'work_orders',
                'calendar',
                'attendance',
                'client_creation',
            ],
        ]);

        User::create([
            'name' => 'Elena Tehnician',
            'email' => 'tehnician2@electrocrm.test',
            'password' => $password,
            'employee_id' => $technicianTwo->id,
            'role' => UserRole::Technician->value,
            'allowed_modules' => [
                'dashboard',
                'work_orders',
                'calendar',
                'attendance',
            ],
        ]);

        $clientOne = Client::create([
            'type' => 'firma',
            'name' => 'Electro Test SRL',
            'cui' => 'RO12345678',
            'contact_person' => 'Radu Popescu',
            'phone' => '0712 000 001',
            'email' => 'contact@electrotest.test',
            'address' => 'Str. Energiei 10',
            'city' => 'București',
        ]);

        $clientTwo = Client::create([
            'type' => 'persoana_fizica',
            'name' => 'Ion Ionescu',
            'contact_person' => 'Ion Ionescu',
            'phone' => '0712 000 002',
            'email' => 'ion.ionescu@test.ro',
            'address' => 'Str. Lalelelor 5',
            'city' => 'București',
        ]);

        $this->createWorkOrder($clientOne->id, $technicianOne->id, 'DEMO-001', 'Intervenție tablou electric', 'programata');
        $this->createWorkOrder($clientTwo->id, $technicianTwo->id, 'DEMO-002', 'Mentenanță instalație electrică', 'lucru');
    }

    private function createWorkOrder(
        int $clientId,
        int $employeeId,
        string $number,
        string $type,
        string $status,
    ): void {
        $now = now();
        $columns = Schema::getColumnListing('work_orders');

        $data = [
            'client_id' => $clientId,
            'employee_id' => $employeeId,
            'priority' => 'normal',
            'status' => $status,
            'materials' => 'Materiale de demonstrație',
            'notes' => 'Lucrare creată pentru testarea rolurilor.',
            'created_at' => $now,
            'updated_at' => $now,
        ];

        $optionalColumns = [
            'number' => $number,
            'type' => $type,
            'work_type' => $type,
            'description' => 'Scenariu demonstrativ pentru restricțiile de acces ale tehnicienilor.',
            'address' => 'București',
            'contact_person' => 'Contact demonstrație',
            'phone' => '0712 000 000',
            'scheduled_date' => $now->toDateString(),
            'scheduled_time' => '10:00',
            'scheduled_at' => $now->copy()->setTime(10, 0),
        ];

        foreach ($optionalColumns as $column => $value) {
            if (in_array($column, $columns, true)) {
                $data[$column] = $value;
            }
        }

        $workOrderId = DB::table('work_orders')->insertGetId($data);

        if (Schema::hasTable('work_order_employees')) {
            DB::table('work_order_employees')->insert([
                'work_order_id' => $workOrderId,
                'employee_id' => $employeeId,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }
}
