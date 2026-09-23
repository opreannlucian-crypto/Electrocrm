<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('salary_slips', function (Blueprint $table): void {
            $table->dropUnique('salary_slips_employee_id_period_start_unique');
            $table->index(['employee_id', 'period_start']);
        });
    }

    public function down(): void
    {
        Schema::table('salary_slips', function (Blueprint $table): void {
            $table->dropIndex('salary_slips_employee_id_period_start_index');
            $table->unique(['employee_id', 'period_start']);
        });
    }
};
