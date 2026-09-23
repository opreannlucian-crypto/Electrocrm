<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {

            if (!Schema::hasColumn('employees', 'department')) {
                $table->string('department')->nullable();
            }

            if (!Schema::hasColumn('employees', 'hire_date')) {
                $table->date('hire_date')->nullable();
            }

            if (!Schema::hasColumn('employees', 'salary')) {
                $table->decimal('salary', 10, 2)->nullable();
            }

            if (!Schema::hasColumn('employees', 'schedule')) {
                $table->string('schedule')->nullable();
            }

            if (!Schema::hasColumn('employees', 'status')) {
                $table->enum('status', [
                    'Activ',
                    'Concediu',
                    'Plecat'
                ])->default('Activ');
            }

        });
    }


    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {

            $columns = [
                'department',
                'hire_date',
                'salary',
                'schedule',
                'status'
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('employees', $column)) {
                    $table->dropColumn($column);
                }
            }

        });
    }
};