<?php

namespace App\Http\Controllers;

use App\Exports\SupplierBalanceReportExport;
use App\Models\Supplier;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class SupplierBalanceReportController extends Controller
{
    public function index(Request $request)
    {
        $this->ensureAccess($request);
        $data = $this->reportData($request);

        return Inertia::render('SupplierBalanceReports/Index', $data);
    }

    public function excel(Request $request): Response
    {
        $this->ensureAccess($request);
        $data = $this->reportData($request);
        $path = SupplierBalanceReportExport::generate($data['suppliers'], $data['totals']);

        return response()->download($path, basename($path), [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ])->deleteFileAfterSend(true);
    }

    public function pdf(Request $request): Response
    {
        $this->ensureAccess($request);
        $data = $this->reportData($request);

        return Pdf::loadView('reports.suppliers', $data)
            ->setPaper('a4', 'landscape')
            ->download('raport_sold_furnizori.pdf');
    }

    private function ensureAccess(Request $request): void
    {
        abort_unless(
            $request->user()?->isAdministrator() || $request->user()?->isSalesManager(),
            403,
            'Raportul furnizorilor este disponibil doar administratorului și managerului de vânzări.'
        );
    }

    /** @return array{suppliers: \Illuminate\Support\Collection, totals: array<string, float>, filters: array<string, string>} */
    private function reportData(Request $request): array
    {
        $filters = $request->validate(['search' => ['nullable', 'string', 'max:255']]);
        $search = trim((string) ($filters['search'] ?? ''));

        $suppliers = Supplier::query()
            ->withSum('receptions as received_total', 'total')
            ->withSum('receptions as paid_at_reception_total', 'paid_amount')
            ->withSum('payments as paid_total', 'amount')
            ->withCount('receptions')
            ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('cui', 'like', "%{$search}%");
            }))
            ->orderBy('name')
            ->get()
            ->map(function (Supplier $supplier) {
                $received = (float) ($supplier->received_total ?? 0);
                $paidAtReception = (float) ($supplier->paid_at_reception_total ?? 0);
                $payments = (float) ($supplier->paid_total ?? 0);
                $paid = $paidAtReception + $payments;
                $balance = $received - $paid;

                return [
                    'id' => $supplier->id,
                    'name' => $supplier->name,
                    'cui' => $supplier->cui,
                    'receptions_count' => $supplier->receptions_count,
                    'received_total' => round($received, 2),
                    'paid_total' => round($paid, 2),
                    'balance' => round($balance, 2),
                ];
            })
            ->sortByDesc('balance')
            ->values();

        return [
            'suppliers' => $suppliers,
            'totals' => [
                'received_total' => round($suppliers->sum('received_total'), 2),
                'paid_total' => round($suppliers->sum('paid_total'), 2),
                'balance' => round($suppliers->sum('balance'), 2),
            ],
            'filters' => ['search' => $search],
        ];
    }
}
