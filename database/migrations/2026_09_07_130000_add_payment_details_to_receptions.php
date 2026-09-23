<?php

use App\Models\Reception;
use App\Models\SupplierPayment;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('receptions', function (Blueprint $table) {
            $table->string('payment_method', 30)->nullable()->after('paid_amount');
            $table->string('payment_reference', 100)->nullable()->after('payment_method');
        });
        Schema::table('cash_payments', function (Blueprint $table) {
            $table->foreignId('supplier_payment_id')->nullable()->after('id')->constrained()->nullOnDelete();
        });

        // Recepțiile create înainte de alegerea metodei de plată rămân vizibile
        // în Registrul de plăți. Metoda implicită este OP, deoarece nu era salvată.
        Reception::query()
            ->where('paid_now', true)
            ->whereNotNull('supplier_id')
            ->whereDoesntHave('supplierPayments')
            ->each(function (Reception $reception): void {
                $amount = (float) $reception->paid_amount ?: (float) $reception->total;

                if ($amount <= 0) {
                    return;
                }

                SupplierPayment::create([
                    'supplier_id' => $reception->supplier_id,
                    'reception_id' => $reception->id,
                    'paid_at' => $reception->received_at,
                    'amount' => $amount,
                    'payment_method' => 'bank_transfer',
                    'document_number' => $reception->number,
                    'notes' => 'Plată creată automat pentru recepția deja marcată achitată.',
                    'created_by' => $reception->created_by,
                ]);
            });
    }

    public function down(): void
    {
        Schema::table('cash_payments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('supplier_payment_id');
        });
        Schema::table('receptions', function (Blueprint $table) {
            $table->dropColumn(['payment_method', 'payment_reference']);
        });
    }
};
