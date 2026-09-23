<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('services')) {
            Schema::create('services', function (Blueprint $table) {
                $table->id();
                $table->string('name')->unique();
                $table->string('code', 100)->nullable()->unique();
                $table->string('unit', 20)->default('serviciu');
                $table->decimal('sale_price', 14, 2)->default(0);
                $table->decimal('vat_rate', 5, 2)->default(21);
                $table->boolean('active')->default(true);
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasColumn('invoice_items', 'service_id')) {
            Schema::table('invoice_items', function (Blueprint $table) {
                $table->foreignId('service_id')->nullable()->after('product_id')->constrained('services')->nullOnDelete();
            });
        }

        $transportProducts = DB::table('products')->whereRaw('lower(name) = ?', ['transport'])->get();
        foreach ($transportProducts as $product) {
            $serviceId = DB::table('services')->whereRaw('lower(name) = ?', ['transport'])->value('id');
            if (!$serviceId) {
                $serviceId = DB::table('services')->insertGetId([
                    'name' => $product->name,
                    'code' => $product->code,
                    'unit' => $product->unit ?: 'serviciu',
                    'sale_price' => $product->sale_price,
                    'vat_rate' => $product->vat_rate,
                    'active' => true,
                    'notes' => $product->notes,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
            DB::table('invoice_items')->where('product_id', $product->id)->update(['service_id' => $serviceId, 'product_id' => null, 'type' => 'serviciu']);
            // Păstrăm legăturile istorice din lucrări/documente, dar produsul nu mai este disponibil
            // în nomenclatorul activ sau în rapoartele de stoc.
            DB::table('product_stocks')->where('product_id', $product->id)->delete();
            DB::table('products')->where('id', $product->id)->update(['active' => false, 'stock_quantity' => 0, 'updated_at' => now()]);
        }
    }

    public function down(): void
    {
        Schema::table('invoice_items', function (Blueprint $table) {
            $table->dropConstrainedForeignId('service_id');
        });
        Schema::dropIfExists('services');
    }
};
