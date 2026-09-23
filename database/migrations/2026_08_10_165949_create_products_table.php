<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();

            $table->string('name');

            $table->string('code')
                ->nullable()
                ->unique();

            $table->string('ean')
                ->nullable()
                ->unique();

            $table->string('category')
                ->nullable();

            $table->string('unit')
                ->default('buc');

            $table->decimal('stock_quantity', 12, 2)
                ->default(0);

            $table->decimal('purchase_price', 12, 2)
                ->default(0);

            $table->decimal('sale_price', 12, 2)
                ->default(0);

            $table->decimal('vat_rate', 5, 2)
                ->default(21);

            $table->decimal('minimum_stock', 12, 2)
                ->default(0);

            $table->boolean('active')
                ->default(true);

            $table->text('notes')
                ->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};