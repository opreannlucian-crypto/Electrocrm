<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('cash_payments', function (Blueprint $table) {
            $table->string('operation_type', 10)->default('expense')->after('paid_at');
            $table->index(['operation_type', 'paid_at']);
        });
    }

    public function down(): void
    {
        Schema::table('cash_payments', function (Blueprint $table) {
            $table->dropIndex(['operation_type', 'paid_at']);
            $table->dropColumn('operation_type');
        });
    }
};
