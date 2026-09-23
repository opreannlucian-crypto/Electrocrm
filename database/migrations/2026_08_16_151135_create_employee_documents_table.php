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
        Schema::create('employee_documents', function (Blueprint $table) {
            $table->id();

            $table->foreignId('employee_id')
                ->constrained('employees')
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Identificare document
            |--------------------------------------------------------------------------
            */

            $table->string('category', 100);

            $table->string('name');

            $table->string('document_number', 255)
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Date document
            |--------------------------------------------------------------------------
            */

            $table->date('document_date')
                ->nullable();

            $table->date('valid_from')
                ->nullable();

            $table->date('valid_until')
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Perioada - utila pentru concedii, medicale etc.
            |--------------------------------------------------------------------------
            */

            $table->date('period_start')
                ->nullable();

            $table->date('period_end')
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Status
            |--------------------------------------------------------------------------
            */

            $table->string('status', 100)
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Descriere
            |--------------------------------------------------------------------------
            */

            $table->text('description')
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Fisier
            |--------------------------------------------------------------------------
            */

            $table->string('file_path');

            $table->string('original_name')
                ->nullable();

            $table->string('mime_type')
                ->nullable();

            $table->unsignedBigInteger('file_size')
                ->nullable();

            $table->timestamps();

            $table->index([
                'employee_id',
                'category',
            ]);

            $table->index([
                'employee_id',
                'document_date',
            ]);

            $table->index([
                'employee_id',
                'period_start',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists(
            'employee_documents'
        );
    }
};