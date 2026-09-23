<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('products')->whereIn('vat_rate', [5, 9])->update(['vat_rate' => 11]);
        DB::table('products')->where('vat_rate', 19)->update(['vat_rate' => 21]);
    }

    public function down(): void
    {
        // Nu putem identifica în siguranță dacă un produs de 11% provenea din cota de 5% sau 9%.
    }
};
