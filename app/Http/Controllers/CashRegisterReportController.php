<?php

namespace App\Http\Controllers;

use App\Exports\CashRegisterExport;
use App\Models\CashPayment;
use App\Models\Client;
use App\Models\CashRegisterOpening;
use App\Models\InvoicePayment;
use App\Models\Receipt;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class CashRegisterReportController extends Controller
{
    public function index(Request $request)
    {
        abort_unless(
            $request->user()?->isAdministrator() || $request->user()?->isSalesManager(),
            403,
            'Registrul de casă este disponibil doar administratorului și managerului de vânzări.'
        );

        $data = $this->reportData($request);

        return Inertia::render('Reports/CashRegister/Index', $data + [
            'clients' => Client::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function excel(Request $request): Response
    {
        $this->ensureFinancialAccess($request);
        $data = $this->reportData($request);
        $path = CashRegisterExport::generate($data);

        return response()->download($path, basename($path), [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ])->deleteFileAfterSend(true);
    }

    public function pdf(Request $request): Response
    {
        $this->ensureFinancialAccess($request);
        $data = $this->reportData($request);
        $filename = sprintf('registru_casa_%s_%s.pdf', $data['filters']['date_from'], $data['filters']['date_to']);

        return Pdf::loadView('reports.cash-register.pdf', $data)
            ->setPaper('a4', 'landscape')
            ->download($filename);
    }

    private function reportData(Request $request): array
    {
        $this->syncInvoicePayments();
        $filters = $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'operation' => ['nullable', 'in:all,income,expense'],
        ]);
        $from = $filters['date_from'] ?? now()->startOfMonth()->toDateString();
        $to = $filters['date_to'] ?? now()->toDateString();

        $openingRecord = CashRegisterOpening::query()->whereDate('opening_date', '<=', $from)->latest('opening_date')->first();
        $ledgerStart = $openingRecord?->opening_date?->toDateString();
        $signedAmount = DB::raw('CASE WHEN is_return = 1 THEN -amount ELSE amount END');
        $openingReceiptsQuery = Receipt::query()
            ->where('register_type', 'cash')
            ->whereDate('received_at', '<', $from);
        $openingManualQuery = CashPayment::query()->whereDate('paid_at', '<', $from);
        if ($ledgerStart) {
            $openingReceiptsQuery->whereDate('received_at', '>=', $ledgerStart);
            $openingManualQuery->whereDate('paid_at', '>=', $ledgerStart);
        }
        $openingReceipts = (float) $openingReceiptsQuery->sum($signedAmount);
        $openingManualOperations = (float) $openingManualQuery
            ->selectRaw("COALESCE(SUM(CASE WHEN operation_type = 'income' THEN amount ELSE -amount END), 0) as balance")
            ->value('balance');
        $openingBalance = (float) ($openingRecord?->amount ?? 0) + $openingReceipts + $openingManualOperations;

        $receipts = Receipt::with(['client', 'invoice'])
            ->where('register_type', 'cash')
            ->whereDate('received_at', '>=', $from)
            ->whereDate('received_at', '<=', $to)
            ->orderBy('received_at')
            ->orderBy('id')
            ->get();

        $payments = CashPayment::query()->with('client:id,name')
            ->whereDate('paid_at', '>=', $from)
            ->whereDate('paid_at', '<=', $to)
            ->orderBy('paid_at')
            ->orderBy('id')
            ->get();
        $cashIn = (float) $receipts->where('is_return', false)->sum('amount');
        $receiptReturns = (float) $receipts->where('is_return', true)->sum('amount');
        $manualCashIn = (float) $payments->where('operation_type', 'income')->sum('amount');
        $cashPayments = (float) $payments->where('operation_type', 'expense')->sum('amount');
        $receiptTransactions = $receipts->map(fn (Receipt $receipt) => [
            'id' => "receipt-{$receipt->id}",
            'date' => $receipt->received_at->toDateString(),
            'type' => $receipt->is_return ? 'Retur numerar' : 'Încasare',
            'document' => trim(($receipt->document_series ?? '') . ' ' . ($receipt->document_number ?? '')) ?: '—',
            'partner' => $receipt->client?->name ?? '—',
            'description' => $receipt->notes,
            'in' => $receipt->is_return ? 0 : (float) $receipt->amount,
            'out' => $receipt->is_return ? (float) $receipt->amount : 0,
            'can_delete' => false,
        ])->all();
        $paymentTransactions = $payments->map(fn (CashPayment $payment) => [
            'id' => "payment-{$payment->id}",
            'date' => $payment->paid_at->toDateString(),
            'type' => $payment->operation_type === 'income' ? 'Încasare numerar' : 'Plată numerar',
            'document' => $payment->document_number ?: '—',
            'partner' => $payment->client?->name ?? $payment->beneficiary,
            'description' => $payment->notes,
            'in' => $payment->operation_type === 'income' ? (float) $payment->amount : 0,
            'out' => $payment->operation_type === 'income' ? 0 : (float) $payment->amount,
            'can_delete' => true,
            'payment_id' => $payment->id,
        ])->all();
        $allTransactions = collect($receiptTransactions)->merge($paymentTransactions)
            ->sortBy(fn (array $transaction) => $transaction['date'] . $transaction['id'])->values();
        $operation = $filters['operation'] ?? 'all';
        $transactions = match ($operation) {
            'income' => $allTransactions->filter(fn (array $transaction) => $transaction['in'] > 0)->values(),
            'expense' => $allTransactions->filter(fn (array $transaction) => $transaction['out'] > 0)->values(),
            default => $allTransactions,
        };

        $transactions = $transactions->map(function (array $transaction) {
            $transaction['date'] = \Carbon\Carbon::parse($transaction['date'])->format('d.m.Y');
            return $transaction;
        });

        return [
            'transactions' => $transactions,
            'filters' => ['date_from' => $from, 'date_to' => $to, 'operation' => $operation],
            'summary' => [
                'opening_balance' => $openingBalance,
                'opening_date' => $openingRecord?->opening_date?->format('d.m.Y'),
                'cash_in' => $cashIn + $manualCashIn,
                'cash_out' => $receiptReturns + $cashPayments,
                'closing_balance' => $openingBalance + $cashIn + $manualCashIn - $receiptReturns - $cashPayments,
            ],
        ];
    }

    public function store(Request $request)
    {
        $this->ensureFinancialAccess($request);
        $data = $request->validate([
            'paid_at' => ['required', 'date'],
            'client_id' => ['nullable', 'exists:clients,id'],
            'operation_type' => ['required', 'in:income,expense'],
            'expense_category' => ['nullable', 'string', 'max:100'],
            'beneficiary' => ['required', 'string', 'max:180'],
            'document_number' => ['nullable', 'string', 'max:80'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'notes' => ['nullable', 'string', 'max:4000'],
        ]);
        if ($data['client_id'] ?? null) {
            $client = Client::findOrFail($data['client_id']);
        } else {
            $client = Client::query()->whereRaw('LOWER(name) = ?', [mb_strtolower(trim($data['beneficiary']))])->first();
            $client ??= Client::create(['name' => trim($data['beneficiary']), 'type' => 'persoana_fizica']);
        }
        $data['client_id'] = $client->id;
        $data['beneficiary'] = $client->name;
        $data['created_by'] = $request->user()->id;
        CashPayment::create($data);

        return back()->with('success', $data['operation_type'] === 'income' ? 'Încasarea numerar a fost înregistrată în registrul de casă.' : 'Plata numerar a fost înregistrată în registrul de casă.');
    }

    public function destroy(Request $request, CashPayment $cashPayment)
    {
        $this->ensureFinancialAccess($request);
        $cashPayment->delete();

        return back()->with('success', 'Plata numerar a fost ștearsă din registrul de casă.');
    }

    public function setOpeningBalance(Request $request)
    {
        $this->ensureFinancialAccess($request);
        $data = $request->validate([
            'opening_date' => ['required', 'date'],
            'amount' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);
        CashRegisterOpening::updateOrCreate(
            ['opening_date' => $data['opening_date']],
            ['amount' => $data['amount'], 'notes' => $data['notes'] ?? null, 'created_by' => $request->user()->id]
        );

        return back()->with('success', 'Soldul inițial al casei a fost salvat pentru data aleasă.');
    }

    private function ensureFinancialAccess(Request $request): void
    {
        abort_unless(
            $request->user()?->isAdministrator() || $request->user()?->isSalesManager(),
            403,
            'Registrul de casă este disponibil doar administratorului și managerului de vânzări.'
        );
    }

    private function syncInvoicePayments(): void
    {
        InvoicePayment::with('invoice')->whereDoesntHave('receipt')->orderBy('id')->each(function (InvoicePayment $payment) {
            $invoice = $payment->invoice;
            if (!$invoice) return;
            $method = match ($payment->method) {'cash' => 'cash', 'transfer' => 'bank_transfer', 'card' => 'pos', default => 'other'};
            Receipt::firstOrCreate(['invoice_payment_id' => $payment->id], [
                'client_id' => $invoice->client_id, 'invoice_id' => $invoice->id,
                'source_type' => $invoice->document_type === 'proforma' ? 'proforma' : 'invoice',
                'document_series' => $invoice->series, 'document_number' => $invoice->number,
                'received_at' => $payment->paid_at, 'amount' => $payment->amount, 'vat_amount' => 0,
                'payment_method' => $method, 'register_type' => $method === 'cash' ? 'cash' : 'bank',
                'notes' => $payment->notes,
            ]);
        });
    }
}
