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
            'contract_templates',
            function (Blueprint $table) {
                $table->id();

                $table->string('name');

                $table->string('type')
                    ->nullable();

                $table->string('title')
                    ->nullable();

                $table->text('description')
                    ->nullable();

                $table->longText('content')
                    ->nullable();

                $table->decimal(
                    'default_value',
                    15,
                    2
                )
                    ->nullable();

                $table->string('default_duration')
                    ->nullable();

                $table->text('default_payment_terms')
                    ->nullable();

                $table->text('default_notes')
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

                $table->boolean('active')
                    ->default(true);

                $table->unsignedInteger('sort_order')
                    ->default(0);

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
            'contract_templates'
        );
    }
};