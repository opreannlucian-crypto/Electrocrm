<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('free_reports', function (Blueprint $table) {
            $table->id();

            $table->string('number')->nullable();

            $table->string('title');

            $table->date('document_date')->nullable();

            $table->string('location')->nullable();

            /*
            |--------------------------------------------------------------------------
            | Beneficiar / Client
            |--------------------------------------------------------------------------
            */

            $table->string('client_name')->nullable();

            $table->string('client_cui')->nullable();

            $table->text('client_address')->nullable();

            $table->string('client_phone')->nullable();

            $table->string('contact_person')->nullable();

            /*
            |--------------------------------------------------------------------------
            | Legaturi optionale cu ElectroCRM
            |--------------------------------------------------------------------------
            */

            $table->foreignId('work_order_id')
                ->nullable()
                ->constrained('work_orders')
                ->nullOnDelete();

            $table->foreignId('quote_id')
                ->nullable()
                ->constrained('quotes')
                ->nullOnDelete();

            $table->foreignId('license_id')
                ->nullable()
                ->constrained('licenses')
                ->nullOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Licenta
            |--------------------------------------------------------------------------
            */

            $table->string('license_name')->nullable();

            $table->text('license_description')->nullable();

            /*
            |--------------------------------------------------------------------------
            | Continut proces-verbal
            |--------------------------------------------------------------------------
            */

            $table->text('participants')->nullable();

            $table->text('subject')->nullable();

            $table->longText('content')->nullable();

            $table->longText('findings')->nullable();

            $table->longText('conclusions')->nullable();

            $table->longText('observations')->nullable();

            /*
            |--------------------------------------------------------------------------
            | Semnaturi
            |--------------------------------------------------------------------------
            */

            $table->string('provider_signature_name')->nullable();

            $table->string('provider_signature_position')->nullable();

            $table->string('client_signature_name')->nullable();

            $table->string('client_signature_position')->nullable();

            /*
            |--------------------------------------------------------------------------
            | Utilizatorul care a creat documentul
            |--------------------------------------------------------------------------
            */

            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('free_reports');
    }
};