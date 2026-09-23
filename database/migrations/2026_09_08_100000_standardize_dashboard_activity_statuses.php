<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('dashboard_activities')->where('status', 'open')->update(['status' => 'assigned']);
    }

    public function down(): void
    {
        DB::table('dashboard_activities')->where('status', 'assigned')->update(['status' => 'open']);
    }
};
