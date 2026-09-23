<?php

namespace App\Http\Controllers;

use App\Models\Receipt;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReceiptReportController extends Controller
{
    public function index(Request $request)
    {
        abort_unless(
            $request->user()?->isAdministrator() || $request->user()?->isSalesManager(),
            403,
            'Raportul încasărilor este disponibil doar administratorului și managerului de vânzări.'
        );

        $filters = $request->validate([
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date', 'after_or_equal:from'],
            'register_type' => ['nullable', 'in:cash,bank'],
            'source_type' => ['nullable', 'in:invoice,bon,proforma,chitanta,other'],
            'payment_method' => ['nullable', 'in:cash,pos,bank_transfer,check,cod,other'],
        ]);

        $query = Receipt::query()
            ->with(['client:id,name', 'invoice:id,series,number'])
            ->orderByDesc('received_at')
            ->orderByDesc('id');

        foreach (['from', 'to', 'register_type', 'source_type', 'payment_method'] as $filter) {
            if (filled($filters[$filter] ?? null)) {
                $filter === 'from'
                    ? $query->whereDate('received_at', '>=', $filters[$filter])
                    : ($filter === 'to'
                        ? $query->whereDate('received_at', '<=', $filters[$filter])
                        : $query->where($filter, $filters[$filter]));
            }
        }

        $receipts = $query->get()->map(function (Receipt $receipt) {
            $amount = (float) $receipt->amount;

            return [
                'id' => $receipt->id,
                'received_at' => $receipt->received_at?->format('d.m.Y'),
                'client' => $receipt->client?->name,
                'source_type' => $receipt->source_type,
                'document' => trim(($receipt->document_series ?? '') . ' ' . ($receipt->document_number ?? '')) ?: null,
                'payment_method' => $receipt->payment_method,
                'register_type' => $receipt->register_type,
                'is_return' => $receipt->is_return,
                'amount' => round($amount, 2),
                'signed_amount' => round($receipt->is_return ? -$amount : $amount, 2),
            ];
        });

        return Inertia::render('ReceiptReports/Index', [
            'receipts' => $receipts,
            'filters' => $filters,
            'totals' => [
                'gross' => round($receipts->where('is_return', false)->sum('amount'), 2),
                'returns' => round($receipts->where('is_return', true)->sum('amount'), 2),
                'net' => round($receipts->sum('signed_amount'), 2),
                'cash' => round($receipts->where('register_type', 'cash')->sum('signed_amount'), 2),
                'bank' => round($receipts->where('register_type', 'bank')->sum('signed_amount'), 2),
            ],
        ]);
    }
}
