<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Finalizeaza legatura dintre utilizator si angajat.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('employee_id')
                ->nullable()
                ->unique()
                ->constrained('employees')
                ->nullOnDelete();
        });
    }

    /**
     * Sterge legatura dintre utilizator si angajat.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign([
                'employee_id',
            ]);

            $table->dropUnique(
                'users_employee_id_unique'
            );

            $table->dropColumn(
                'employee_id'
            );
        });
    }
};