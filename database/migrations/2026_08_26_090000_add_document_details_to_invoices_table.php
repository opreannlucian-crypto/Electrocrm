<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->string('work_order_number', 100)->nullable()->after('work_order_id');
            $table->date('delivery_date')->nullable()->after('due_date');
            $table->date('collection_date')->nullable()->after('delivery_date');
            $table->string('issuer_name', 150)->nullable()->after('notes');
            $table->string('issuer_identifier_type', 30)->nullable()->after('issuer_name');
            $table->text('issuer_identifier')->nullable()->after('issuer_identifier_type');
            $table->string('delegate_name', 150)->nullable()->after('issuer_identifier');
            $table->string('accompanying_document_number', 100)->nullable()->after('delegate_name');
            $table->string('vehicle_number', 50)->nullable()->after('accompanying_document_number');
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn([
                'work_order_number',
                'delivery_date',
                'collection_date',
                'issuer_name',
                'issuer_identifier_type',
                'issuer_identifier',
                'delegate_name',
                'accompanying_document_number',
                'vehicle_number',
            ]);
        });
    }
};
