<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quote_items', function (Blueprint $table) {

            $table->foreignId('product_id')
                ->nullable()
                ->after('quote_id')
                ->constrained('products')
                ->nullOnDelete();

        });
    }

    public function down(): void
    {
        Schema::table('quote_items', function (Blueprint $table) {

            $table->dropForeign([
                'product_id'
            ]);

            $table->dropColumn('product_id');

        });
    }
};