<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {

            $table->id();

            $table->string('company_name')
                ->nullable();

            $table->string('contact_name')
                ->nullable();

            $table->string('cui')
                ->nullable();

            $table->string('phone')
                ->nullable();

            $table->string('email')
                ->nullable();

            $table->text('address')
                ->nullable();

            $table->string('city')
                ->nullable();

            $table->string('county')
                ->nullable();

            $table->enum('type', [
                'Persoană juridică',
                'Persoană fizică'
            ])
            ->default('Persoană juridică');


            $table->text('notes')
                ->nullable();


            $table->timestamps();

        });
    }


    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};