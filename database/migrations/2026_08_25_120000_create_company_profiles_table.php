<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_profiles', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('cui', 50)->nullable();
            $table->string('registration_number', 80)->nullable();
            $table->string('address')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('county', 100)->nullable();
            $table->string('postal_code', 20)->nullable();
            $table->string('email')->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('iban', 80)->nullable();
            $table->string('bank', 150)->nullable();
            $table->decimal('default_vat_rate', 5, 2)->default(21);
            $table->string('invoice_series', 20)->default('F');
            $table->text('invoice_footer')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('company_profiles'); }
};
