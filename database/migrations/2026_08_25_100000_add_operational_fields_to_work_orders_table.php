<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('work_orders', function (Blueprint $table) {
            if (!Schema::hasColumn('work_orders', 'number')) {
                $table->string('number')->nullable()->unique();
            }

            if (!Schema::hasColumn('work_orders', 'type')) {
                $table->string('type')->nullable();
            }

            if (!Schema::hasColumn('work_orders', 'address')) {
                $table->string('address')->nullable();
            }

            if (!Schema::hasColumn('work_orders', 'contact_person')) {
                $table->string('contact_person')->nullable();
            }

            if (!Schema::hasColumn('work_orders', 'phone')) {
                $table->string('phone')->nullable();
            }

            if (!Schema::hasColumn('work_orders', 'scheduled_date')) {
                $table->date('scheduled_date')->nullable();
            }

            if (!Schema::hasColumn('work_orders', 'scheduled_time')) {
                $table->time('scheduled_time')->nullable();
            }

            if (!Schema::hasColumn('work_orders', 'description')) {
                $table->text('description')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('work_orders', function (Blueprint $table) {
            foreach ([
                'number',
                'type',
                'address',
                'contact_person',
                'phone',
                'scheduled_date',
                'scheduled_time',
                'description',
            ] as $column) {
                if (Schema::hasColumn('work_orders', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
