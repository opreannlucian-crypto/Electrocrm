<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();

            // Angajat
            $table->foreignId('employee_id')
                ->constrained('employees')
                ->cascadeOnDelete();

            // Ziua pontajului
            $table->date('date');

            // Ora intrării
            $table->time('check_in')
                ->nullable();

            // Ora ieșirii
            $table->time('check_out')
                ->nullable();

            // Pauza în minute
            $table->unsignedInteger('break_minutes')
                ->default(0);

            // Ore lucrate calculate
            $table->decimal('worked_hours', 5, 2)
                ->default(0);

            // Status
            $table->string('status')
                ->default('prezent');

            // Observații
            $table->text('notes')
                ->nullable();

            $table->timestamps();

            // Un singur pontaj / angajat / zi
            $table->unique([
                'employee_id',
                'date'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};