<?php

namespace App\Services\Reports;

use App\Models\Client;
use App\Models\Invoice;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class InvoiceFinancialReport
{
    public const STATUS_OPTIONS = [
        'draft' => 'Ciornă',
        'issued' => 'Emisă',
        'partially_paid' => 'Parțial plătită',
        'paid' => 'Plătită',
        'cancelled' => 'Anulată',
    ];

    /**
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    public function build(array $filters): array
    {
        $normalized = $this->normalizeFilters($filters);
        $invoices = $this->invoiceQuery($normalized)
            ->with('client:id,name,cui')
            ->orderByDesc('issue_date')
            ->orderByDesc('id')
            ->get();

        $rows = $invoices->map(fn (Invoice $invoice) => $this->row($invoice));
        $issuedRows = $rows->whereNotIn('status', ['draft', 'cancelled'])->values();
        $today = Carbon::today();

        $summary = [
            'invoice_count' => $issuedRows->count(),
            'invoiced_total' => round((float) $issuedRows->sum('total'), 2),
            'vat_total' => round((float) $issuedRows->sum('vat_total'), 2),
            'collected_total' => round((float) $issuedRows->sum('paid_amount'), 2),
            'outstanding_total' => round((float) $issuedRows->sum('balance'), 2),
            'overdue_total' => round((float) $issuedRows
                ->filter(fn (array $row) => $row['is_overdue'])
                ->sum('balance'), 2),
            'overdue_count' => $issuedRows
                ->filter(fn (array $row) => $row['is_overdue'])
                ->count(),
            'due_soon_total' => round((float) $issuedRows
                ->filter(function (array $row) use ($today) {
                    if (!$row['due_date'] || $row['balance'] <= 0) {
                        return false;
                    }

                    $dueDate = Carbon::parse($row['due_date']);

                    return $dueDate->greaterThanOrEqualTo($today)
                        && $dueDate->lessThanOrEqualTo($today->copy()->addDays(7));
                })
                ->sum('balance'), 2),
        ];

        return [
            'filters' => $normalized,
            'summary' => $summary,
            'monthly' => $this->monthly($issuedRows),
            'clients' => $this->topClients($issuedRows),
            'rows' => $rows->values()->all(),
            'overdue' => $issuedRows
                ->filter(fn (array $row) => $row['is_overdue'])
                ->sortByDesc('balance')
                ->values()
                ->take(10)
                ->all(),
        ];
    }

    /**
     * @param array<string, mixed> $filters
     * @return Builder<Invoice>
     */
    private function invoiceQuery(array $filters): Builder
    {
        return Invoice::query()
            ->whereBetween('issue_date', [$filters['date_from'], $filters['date_to']])
            ->when($filters['client_id'], fn (Builder $query, int $clientId) => $query->where('client_id', $clientId))
            ->when($filters['status'], fn (Builder $query, string $status) => $query->where('status', $status));
    }

    /**
     * @param array<string, mixed> $filters
     * @return array<string, mixed>
     */
    private function normalizeFilters(array $filters): array
    {
        $dateFrom = Carbon::parse($filters['date_from'] ?? now()->startOfMonth()->toDateString())->startOfDay();
        $dateTo = Carbon::parse($filters['date_to'] ?? now()->endOfMonth()->toDateString())->endOfDay();

        if ($dateTo->lessThan($dateFrom)) {
            [$dateFrom, $dateTo] = [$dateTo->copy()->startOfDay(), $dateFrom->copy()->endOfDay()];
        }

        return [
            'date_from' => $dateFrom->toDateString(),
            'date_to' => $dateTo->toDateString(),
            'client_id' => filled($filters['client_id'] ?? null) ? (int) $filters['client_id'] : null,
            'status' => array_key_exists((string) ($filters['status'] ?? ''), self::STATUS_OPTIONS)
                ? (string) $filters['status']
                : null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function row(Invoice $invoice): array
    {
        $total = round((float) $invoice->total, 2);
        $paid = round((float) $invoice->paid_amount, 2);
        $balance = max(0, round($total - $paid, 2));
        $isFinancialInvoice = !in_array($invoice->status, ['draft', 'cancelled'], true);
        $isOverdue = $isFinancialInvoice
            && $balance > 0
            && $invoice->due_date
            && $invoice->due_date->lt(Carbon::today());

        return [
            'id' => $invoice->id,
            'number' => $invoice->number,
            'issue_date' => $invoice->issue_date?->toDateString(),
            'due_date' => $invoice->due_date?->toDateString(),
            'status' => $invoice->status,
            'status_label' => self::STATUS_OPTIONS[$invoice->status] ?? $invoice->status,
            'client_id' => $invoice->client_id,
            'client_name' => $invoice->client?->name ?? 'Client șters',
            'client_cui' => $invoice->client?->cui,
            'subtotal' => round((float) $invoice->subtotal, 2),
            'vat_total' => round((float) $invoice->vat_total, 2),
            'total' => $total,
            'paid_amount' => $paid,
            'balance' => $balance,
            'is_overdue' => (bool) $isOverdue,
            'currency' => $invoice->currency ?: 'RON',
        ];
    }

    /**
     * @param Collection<int, array<string, mixed>> $rows
     * @return array<int, array<string, mixed>>
     */
    private function monthly(Collection $rows): array
    {
        return $rows
            ->groupBy(fn (array $row) => Carbon::parse($row['issue_date'])->format('Y-m'))
            ->sortKeys()
            ->map(function (Collection $monthRows, string $month) {
                return [
                    'month' => $month,
                    'label' => Carbon::createFromFormat('Y-m', $month)->locale('ro')->translatedFormat('M Y'),
                    'invoiced_total' => round((float) $monthRows->sum('total'), 2),
                    'collected_total' => round((float) $monthRows->sum('paid_amount'), 2),
                    'outstanding_total' => round((float) $monthRows->sum('balance'), 2),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @param Collection<int, array<string, mixed>> $rows
     * @return array<int, array<string, mixed>>
     */
    private function topClients(Collection $rows): array
    {
        return $rows
            ->groupBy('client_id')
            ->map(function (Collection $clientRows) {
                $first = $clientRows->first();

                return [
                    'client_id' => $first['client_id'],
                    'client_name' => $first['client_name'],
                    'invoiced_total' => round((float) $clientRows->sum('total'), 2),
                    'collected_total' => round((float) $clientRows->sum('paid_amount'), 2),
                    'outstanding_total' => round((float) $clientRows->sum('balance'), 2),
                ];
            })
            ->sortByDesc('invoiced_total')
            ->values()
            ->take(10)
            ->all();
    }

    /**
     * @return \Illuminate\Support\Collection<int, Client>
     */
    public function selectableClients(): Collection
    {
        return Client::query()->orderBy('name')->get(['id', 'name', 'cui']);
    }
}
