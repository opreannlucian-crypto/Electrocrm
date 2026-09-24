<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('client_revisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained()->cascadeOnDelete();
            $table->string('type', 30);
            $table->string('period', 30);
            $table->date('last_revision_date')->nullable();
            $table->date('next_revision_date')->nullable()->index();
            $table->foreignId('last_work_order_id')->nullable()->constrained('work_orders')->nullOnDelete();
            $table->date('reminder_sent_for')->nullable();
            $table->timestamps();
            $table->unique(['client_id', 'type']);
        });

        Schema::table('work_orders', function (Blueprint $table) {
            $table->string('revision_period', 30)->nullable()->after('type');
        });
    }

    public function down(): void
    {
        Schema::table('work_orders', function (Blueprint $table) {
            $table->dropColumn('revision_period');
        });
        Schema::dropIfExists('client_revisions');
    }
};
