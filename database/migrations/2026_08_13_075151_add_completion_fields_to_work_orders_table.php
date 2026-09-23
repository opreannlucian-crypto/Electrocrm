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
        Schema::table('work_orders', function (Blueprint $table) {
            $table->dateTime('started_at')->nullable()->after('scheduled_time');

            $table->dateTime('completed_at')->nullable()->after('started_at');

            $table->text('client_signature')->nullable()->after('completed_at');

            $table->text('technician_signature')->nullable()->after('client_signature');

            $table->text('completion_notes')->nullable()->after('technician_signature');

            $table->boolean('client_confirmation')
                ->default(false)
                ->after('completion_notes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('work_orders', function (Blueprint $table) {
            $table->dropColumn([
                'started_at',
                'completed_at',
                'client_signature',
                'technician_signature',
                'completion_notes',
                'client_confirmation',
            ]);
        });
    }
};