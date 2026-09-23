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
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();

            /*
            |--------------------------------------------------------------------------
            | Produs
            |--------------------------------------------------------------------------
            */

            $table->foreignId('product_id')
                ->constrained('products')
                ->cascadeOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Tip mișcare
            |--------------------------------------------------------------------------
            |
            | in       = intrare în stoc
            | out      = ieșire din stoc
            | adjustment = ajustare inventar
            |
            */

            $table->enum('type', [
                'in',
                'out',
                'adjustment',
            ]);

            /*
            |--------------------------------------------------------------------------
            | Cantitate
            |--------------------------------------------------------------------------
            */

            $table->decimal('quantity', 12, 2);

            /*
            |--------------------------------------------------------------------------
            | Stoc înainte / după operație
            |--------------------------------------------------------------------------
            */

            $table->decimal('stock_before', 12, 2)
                ->default(0);

            $table->decimal('stock_after', 12, 2)
                ->default(0);

            /*
            |--------------------------------------------------------------------------
            | Preț
            |--------------------------------------------------------------------------
            */

            $table->decimal('unit_price', 12, 2)
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Document / motiv
            |--------------------------------------------------------------------------
            */

            $table->string('reference_type')
                ->nullable();

            $table->unsignedBigInteger('reference_id')
                ->nullable();

            $table->string('document_number')
                ->nullable();

            $table->string('reason')
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Lucrare
            |--------------------------------------------------------------------------
            */

            $table->foreignId('work_order_id')
                ->nullable()
                ->constrained('work_orders')
                ->nullOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Utilizator
            |--------------------------------------------------------------------------
            */

            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Observații
            |--------------------------------------------------------------------------
            */

            $table->text('notes')
                ->nullable();

            $table->timestamps();

            /*
            |--------------------------------------------------------------------------
            | Indexuri
            |--------------------------------------------------------------------------
            */

            $table->index([
                'reference_type',
                'reference_id',
            ]);

            $table->index('document_number');
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};