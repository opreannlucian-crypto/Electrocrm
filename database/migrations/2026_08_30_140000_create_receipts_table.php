<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
 public function up(): void { Schema::create('receipts', function(Blueprint $table){
  $table->id(); $table->foreignId('client_id')->nullable()->constrained()->nullOnDelete(); $table->foreignId('invoice_id')->nullable()->constrained()->nullOnDelete();
  $table->string('source_type',30)->default('other'); $table->string('document_series',30)->nullable(); $table->string('document_number',80)->nullable();
  $table->date('received_at'); $table->decimal('amount',14,2); $table->decimal('vat_amount',14,2)->default(0); $table->string('payment_method',30); $table->string('register_type',20)->default('cash');
  $table->string('cash_register_number',80)->nullable(); $table->boolean('is_return')->default(false); $table->foreignId('reversal_of_id')->nullable()->constrained('receipts')->nullOnDelete();
  $table->string('z_report_number',80)->nullable(); $table->text('notes')->nullable(); $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete(); $table->timestamps();
  $table->index(['register_type','received_at']); $table->index(['source_type','received_at']);
 }); }
 public function down(): void { Schema::dropIfExists('receipts'); }
};
