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
        Schema::create(
            'contracts',
            function (Blueprint $table) {
                $table->id();

                $table->string('number')
                    ->unique();

                $table->string('title');

                $table->date('contract_date')
                    ->nullable();

                $table->string('type')
                    ->nullable();

                $table->string('status')
                    ->default('draft');

                $table->foreignId('client_id')
                    ->nullable()
                    ->constrained()
                    ->nullOnDelete();

                $table->foreignId('work_order_id')
                    ->nullable()
                    ->constrained(
                        'work_orders'
                    )
                    ->nullOnDelete();

                $table->foreignId('quote_id')
                    ->nullable()
                    ->constrained()
                    ->nullOnDelete();

                $table->foreignId('license_id')
                    ->nullable()
                    ->constrained()
                    ->nullOnDelete();

                $table->string('license_name')
                    ->nullable();

                $table->longText('license_description')
                    ->nullable();

                $table->string('location')
                    ->nullable();

                $table->string('contact_person')
                    ->nullable();

                $table->text('subject')
                    ->nullable();

                $table->decimal(
                    'value',
                    15,
                    2
                )
                    ->nullable();

                $table->string('currency')
                    ->default('RON');

                $table->string('duration')
                    ->nullable();

                $table->text('payment_terms')
                    ->nullable();

                $table->longText('content')
                    ->nullable();

                $table->longText('clauses')
                    ->nullable();

                $table->longText('observations')
                    ->nullable();

                $table->string(
                    'provider_signature_name'
                )
                    ->nullable();

                $table->string(
                    'provider_signature_position'
                )
                    ->nullable();

                $table->string(
                    'client_signature_name'
                )
                    ->nullable();

                $table->string(
                    'client_signature_position'
                )
                    ->nullable();

                $table->foreignId('template_id')
                    ->nullable()
                    ->constrained(
                        'contract_templates'
                    )
                    ->nullOnDelete();

                $table->foreignId('user_id')
                    ->nullable()
                    ->constrained()
                    ->nullOnDelete();

                $table->timestamps();
            }
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists(
            'contracts'
        );
    }
};