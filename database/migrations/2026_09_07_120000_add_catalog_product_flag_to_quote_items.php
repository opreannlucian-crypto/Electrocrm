<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quote_items', function (Blueprint $table) {
            $table->boolean('catalog_product_created')
                ->default(false)
                ->after('product_id');
        });

        DB::table('quote_items')
            ->where('type', 'material')
            ->whereNull('product_id')
            ->orderBy('id')
            ->each(function (object $item) {
                $name = trim((string) $item->name);
                $product = DB::table('products')->where('name', $name)->first();
                $created = false;

                if (!$product) {
                    $productId = DB::table('products')->insertGetId([
                        'name' => $name,
                        'unit' => trim((string) $item->unit) ?: 'buc',
                        'stock_quantity' => 0,
                        'purchase_price' => 0,
                        'sale_price' => (float) $item->unit_price,
                        'vat_rate' => 21,
                        'minimum_stock' => 0,
                        'active' => true,
                        'notes' => 'Creat automat din material introdus liber într-o ofertă.',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    $product = (object) ['id' => $productId];
                    $created = true;
                }

                DB::table('quote_items')->where('id', $item->id)->update([
                    'product_id' => $product->id,
                    'catalog_product_created' => $created,
                ]);

                $workOrderId = DB::table('quotes')
                    ->where('id', $item->quote_id)
                    ->value('work_order_id');

                if ($workOrderId && !DB::table('work_order_materials')
                    ->where('work_order_id', $workOrderId)
                    ->where('product_id', $product->id)
                    ->exists()) {
                    DB::table('work_order_materials')->insert([
                        'work_order_id' => $workOrderId,
                        'product_id' => $product->id,
                        'quantity' => $item->quantity,
                        'unit_price' => 0,
                        'total_price' => 0,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            });
    }

    public function down(): void
    {
        Schema::table('quote_items', function (Blueprint $table) {
            $table->dropColumn('catalog_product_created');
        });
    }
};
