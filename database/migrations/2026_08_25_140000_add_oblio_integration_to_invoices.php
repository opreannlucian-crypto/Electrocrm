<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->string('oblio_status')->nullable()->index()->after('efactura_confirmed_at');
            $table->string('oblio_cif', 32)->nullable()->after('oblio_status');
            $table->string('oblio_series', 32)->nullable()->after('oblio_cif');
            $table->string('oblio_number', 64)->nullable()->after('oblio_series');
            $table->text('oblio_document_url')->nullable()->after('oblio_number');
            $table->string('oblio_idempotency_key', 128)->nullable()->unique()->after('oblio_document_url');
            $table->string('oblio_payload_hash', 64)->nullable()->after('oblio_idempotency_key');
            $table->text('oblio_error_message')->nullable()->after('oblio_payload_hash');
            $table->timestamp('oblio_last_synced_at')->nullable()->after('oblio_error_message');
            $table->timestamp('oblio_issued_at')->nullable()->after('oblio_last_synced_at');
        });

        Schema::create('oblio_sync_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->nullable()->constrained()->nullOnDelete();
            $table->string('operation')->index();
            $table->string('direction')->default('outbound')->index();
            $table->string('status')->index();
            $table->unsignedSmallInteger('attempt')->default(1);
            $table->unsignedSmallInteger('http_status')->nullable();
            $table->string('idempotency_key', 128)->nullable()->index();
            $table->json('request_summary')->nullable();
            $table->json('response_summary')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('occurred_at')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('oblio_sync_logs');

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropUnique(['oblio_idempotency_key']);
            $table->dropColumn([
                'oblio_status',
                'oblio_cif',
                'oblio_series',
                'oblio_number',
                'oblio_document_url',
                'oblio_idempotency_key',
                'oblio_payload_hash',
                'oblio_error_message',
                'oblio_last_synced_at',
                'oblio_issued_at',
            ]);
        });
    }
};
