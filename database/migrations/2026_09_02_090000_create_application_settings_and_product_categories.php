<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('application_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('key', 100);
            $table->json('value')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'key']);
        });

        Schema::create('product_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150)->unique();
            $table->string('code', 30)->nullable()->unique();
            $table->string('inventory_account', 20)->default('371');
            $table->string('expense_account', 20)->default('607');
            $table->string('revenue_account', 20)->default('707');
            $table->text('notes')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('product_category_id')->nullable()->after('category')->constrained('product_categories')->nullOnDelete();
        });

        Schema::table('reception_items', function (Blueprint $table) {
            $table->foreignId('product_category_id')->nullable()->after('product_id')->constrained('product_categories')->nullOnDelete();
            $table->string('inventory_account', 20)->nullable()->after('product_category_id');
        });
    }

    public function down(): void
    {
        Schema::table('reception_items', function (Blueprint $table) {
            $table->dropConstrainedForeignId('product_category_id');
            $table->dropColumn('inventory_account');
        });
        Schema::table('products', fn (Blueprint $table) => $table->dropConstrainedForeignId('product_category_id'));
        Schema::dropIfExists('product_categories');
        Schema::dropIfExists('application_settings');
    }
};
