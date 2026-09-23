<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('employees', 'cnp')) {
            Schema::table('employees', function (Blueprint $table) {
                $table->string('cnp', 20)->nullable()->after('email');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('employees', 'cnp')) {
            Schema::table('employees', function (Blueprint $table) {
                $table->dropColumn('cnp');
            });
        }
    }
};
