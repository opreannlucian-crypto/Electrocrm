<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::table('invoices', function(Blueprint $table){ $table->foreignId('created_by')->nullable()->after('work_order_id')->constrained('users')->nullOnDelete(); });
        Schema::table('invoice_items', function(Blueprint $table){ $table->decimal('cost_unit',14,2)->nullable()->after('unit_price'); });
        Schema::table('supplier_payments', function(Blueprint $table){ $table->string('expense_category',100)->nullable()->after('payment_method'); });
        Schema::table('cash_payments', function(Blueprint $table){ $table->string('expense_category',100)->nullable()->after('operation_type'); });
    }
    public function down(): void { Schema::table('cash_payments',fn(Blueprint $table)=>$table->dropColumn('expense_category')); Schema::table('supplier_payments',fn(Blueprint $table)=>$table->dropColumn('expense_category')); Schema::table('invoice_items',fn(Blueprint $table)=>$table->dropColumn('cost_unit')); Schema::table('invoices',fn(Blueprint $table)=>$table->dropConstrainedForeignId('created_by')); }
};
