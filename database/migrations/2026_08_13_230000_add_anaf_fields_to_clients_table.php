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
        Schema::table('clients', function (Blueprint $table) {

            if (!Schema::hasColumn('clients', 'cui')) {
                $table->string('cui', 50)
                    ->nullable()
                    ->after('name');
            }

            if (!Schema::hasColumn('clients', 'tva_status')) {
                $table->string('tva_status', 50)
                    ->nullable()
                    ->after('cui');
            }

            if (!Schema::hasColumn('clients', 'anaf_name')) {
                $table->string('anaf_name', 255)
                    ->nullable()
                    ->after('tva_status');
            }

            if (!Schema::hasColumn('clients', 'anaf_checked_at')) {
                $table->timestamp('anaf_checked_at')
                    ->nullable()
                    ->after('anaf_name');
            }

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {

            if (Schema::hasColumn('clients', 'anaf_checked_at')) {
                $table->dropColumn('anaf_checked_at');
            }

            if (Schema::hasColumn('clients', 'anaf_name')) {
                $table->dropColumn('anaf_name');
            }

            if (Schema::hasColumn('clients', 'tva_status')) {
                $table->dropColumn('tva_status');
            }

            if (Schema::hasColumn('clients', 'cui')) {
                $table->dropColumn('cui');
            }

        });
    }
};