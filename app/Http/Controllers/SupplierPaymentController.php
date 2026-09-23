<?php

namespace App\Http\Controllers;

use App\Models\{CashPayment, Reception, Supplier, SupplierPayment};
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierPaymentController extends Controller
{
    public function index(Request $request)
    {
        $this->ensureFinancialAccess($request);
        return Inertia::render('SupplierPayments/Index', [
            'payments' => SupplierPayment::with(['supplier', 'reception'])->latest('paid_at')->latest('id')->get()
                ->map(function (SupplierPayment $payment) {
                    return array_merge($payment->toArray(), [
                        'paid_at' => $payment->paid_at?->format('d.m.Y'),
                    ]);
                }),
            'suppliers' => Supplier::where('active', true)->orderBy('name')->get(['id', 'name']),
            'receptions' => Reception::with('supplier')->whereNotNull('supplier_id')->latest('received_at')->get(['id', 'supplier_id', 'number', 'received_at', 'total']),
        ]);
    }

    public function store(Request $request)
    {
        $this->ensureFinancialAccess($request);
        $data = $request->validate([
            'supplier_id' => ['required', 'exists:suppliers,id'],
            'reception_id' => ['nullable', 'exists:receptions,id'],
            'paid_at' => ['required', 'date'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'payment_method' => ['required', 'in:bank_transfer,cash,card,check,other'],
            'expense_category' => ['nullable', 'string', 'max:100'],
            'reference' => ['nullable', 'string', 'max:100'],
            'document_number' => ['nullable', 'string', 'max:80'],
            'notes' => ['nullable', 'string', 'max:4000'],
        ]);
        if ($data['reception_id'] ?? null) {
            $reception = Reception::findOrFail($data['reception_id']);
            abort_unless((int) $reception->supplier_id === (int) $data['supplier_id'], 422, 'Recepția selectată aparține altui furnizor.');
        }
        $data['created_by'] = $request->user()->id;
        SupplierPayment::create($data);

        return back()->with('success', 'Plata către furnizor a fost înregistrată.');
    }

    public function destroy(Request $request, SupplierPayment $supplierPayment)
    {
        $this->ensureFinancialAccess($request);
        CashPayment::where('supplier_payment_id', $supplierPayment->id)->delete();
        $supplierPayment->delete();
        return back()->with('success', 'Plata către furnizor a fost ștearsă.');
    }

    private function ensureFinancialAccess(Request $request): void
    {
        abort_unless($request->user()?->isAdministrator() || $request->user()?->isSalesManager(), 403, 'Registrul de plăți este disponibil doar administratorului și managerului de vânzări.');
    }
}
