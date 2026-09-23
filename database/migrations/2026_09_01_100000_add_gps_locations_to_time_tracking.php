<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->decimal('start_latitude', 10, 7)->nullable()->after('check_in');
            $table->decimal('start_longitude', 10, 7)->nullable()->after('start_latitude');
            $table->decimal('start_accuracy', 8, 2)->nullable()->after('start_longitude');
            $table->decimal('stop_latitude', 10, 7)->nullable()->after('check_out');
            $table->decimal('stop_longitude', 10, 7)->nullable()->after('stop_latitude');
            $table->decimal('stop_accuracy', 8, 2)->nullable()->after('stop_longitude');
        });

        Schema::table('work_order_time_entries', function (Blueprint $table) {
            $table->decimal('start_latitude', 10, 7)->nullable()->after('started_at');
            $table->decimal('start_longitude', 10, 7)->nullable()->after('start_latitude');
            $table->decimal('start_accuracy', 8, 2)->nullable()->after('start_longitude');
            $table->decimal('stop_latitude', 10, 7)->nullable()->after('ended_at');
            $table->decimal('stop_longitude', 10, 7)->nullable()->after('stop_latitude');
            $table->decimal('stop_accuracy', 8, 2)->nullable()->after('stop_longitude');
        });
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropColumn(['start_latitude', 'start_longitude', 'start_accuracy', 'stop_latitude', 'stop_longitude', 'stop_accuracy']);
        });

        Schema::table('work_order_time_entries', function (Blueprint $table) {
            $table->dropColumn(['start_latitude', 'start_longitude', 'start_accuracy', 'stop_latitude', 'stop_longitude', 'stop_accuracy']);
        });
    }
};
