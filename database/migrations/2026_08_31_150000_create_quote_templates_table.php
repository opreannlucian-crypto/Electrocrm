<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration { public function up(): void { Schema::create('quote_templates', function (Blueprint $table) { $table->id(); $table->string('name'); $table->string('type',20)->default('oferta'); $table->foreignId('license_id')->nullable()->constrained()->nullOnDelete(); $table->string('title')->nullable(); $table->decimal('discount',5,2)->default(0); $table->decimal('vat_rate',5,2)->default(21); $table->text('notes')->nullable(); $table->json('items'); $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete(); $table->timestamps(); }); } public function down(): void { Schema::dropIfExists('quote_templates'); } };
