<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {

            $table->id();


            // Date angajat
            $table->string('name');

            $table->string('phone')
                ->nullable();


            $table->string('email')
                ->nullable();


            // Rol în firmă
            $table->string('position')
                ->default('Tehnician');


            // Status
            $table->boolean('active')
                ->default(true);


            // Observații
            $table->text('notes')
                ->nullable();



            $table->timestamps();

        });
    }



    public function down(): void
    {
        Schema::dropIfExists('employees');
    }

};