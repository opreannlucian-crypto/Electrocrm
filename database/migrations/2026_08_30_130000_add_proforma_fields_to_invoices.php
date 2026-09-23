<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table): void {
            $table->string('document_type', 20)->default('invoice')->after('number');
            $table->foreignId('converted_invoice_id')->nullable()->constrained('invoices')->nullOnDelete()->after('document_type');
            $table->index(['document_type', 'issue_date']);
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table): void {
            $table->dropForeign(['converted_invoice_id']);
            $table->dropIndex(['document_type', 'issue_date']);
            $table->dropColumn(['document_type', 'converted_invoice_id']);
        });
    }
};
