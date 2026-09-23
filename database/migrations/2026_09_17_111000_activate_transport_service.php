<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('services')->whereRaw('lower(name) = ?', ['transport'])->update(['active' => true, 'updated_at' => now()]);
    }

    public function down(): void
    {
    }
};
