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
        Schema::create('work_order_materials', function (Blueprint $table) {
            $table->id();

            /*
            |--------------------------------------------------------------------------
            | Lucrare
            |--------------------------------------------------------------------------
            */

            $table->foreignId('work_order_id')
                ->constrained('work_orders')
                ->cascadeOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Produs
            |--------------------------------------------------------------------------
            */

            $table->foreignId('product_id')
                ->constrained('products')
                ->restrictOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Cantitate consumata
            |--------------------------------------------------------------------------
            */

            $table->decimal('quantity', 12, 2);

            /*
            |--------------------------------------------------------------------------
            | Pret unitar la momentul consumului
            |--------------------------------------------------------------------------
            */

            $table->decimal('unit_price', 12, 2)
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Valoare totala
            |--------------------------------------------------------------------------
            */

            $table->decimal('total_price', 12, 2)
                ->nullable();

            $table->timestamps();

            /*
            |--------------------------------------------------------------------------
            | Indexuri
            |--------------------------------------------------------------------------
            */

            $table->index('work_order_id');
            $table->index('product_id');

            $table->unique([
                'work_order_id',
                'product_id',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_order_materials');
    }
};