<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('client_revisions', function (Blueprint $table) {
            $table->foreignId('scheduled_work_order_id')
                ->nullable()
                ->after('last_work_order_id')
                ->constrained('work_orders')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('client_revisions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('scheduled_work_order_id');
        });
    }
};
