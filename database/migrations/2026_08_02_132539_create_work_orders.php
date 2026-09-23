<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;


return new class extends Migration
{


    public function up(): void
    {


        Schema::create('work_orders', function (Blueprint $table) {


            $table->id();



            // Client

            $table->foreignId('client_id')
                ->constrained()
                ->cascadeOnDelete();



            // Tehnician

            $table->foreignId('employee_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();




            // Detalii lucrare

            $table->string('work_type');

            $table->string('priority')
                ->default('normal');


            $table->string('status')
                ->default('noua');



            // Programare

            $table->dateTime('scheduled_at')
                ->nullable();



            // Materiale și observații

            $table->text('materials')
                ->nullable();


            $table->text('notes')
                ->nullable();




            $table->timestamps();


        });


    }





    public function down(): void
    {


        Schema::dropIfExists('work_orders');


    }


};