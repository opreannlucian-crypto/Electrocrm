<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierBalanceReportController extends Controller
{
    public function index(Request $request)
    {
        abort_unless(
            $request->user()?->isAdministrator() || $request->user()?->isSalesManager(),
            403,
            'Raportul furnizorilor este disponibil doar administratorului și managerului de vânzări.'
        );

        $suppliers = Supplier::query()
            ->withSum('receptions as received_total', 'total')
            ->withSum('receptions as paid_at_reception_total', 'paid_amount')
            ->withSum('payments as paid_total', 'amount')
            ->withCount('receptions')
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

        return Inertia::render('SupplierBalanceReports/Index', [
            'suppliers' => $suppliers,
            'totals' => [
                'received_total' => round($suppliers->sum('received_total'), 2),
                'paid_total' => round($suppliers->sum('paid_total'), 2),
                'balance' => round($suppliers->sum('balance'), 2),
            ],
        ]);
    }
}
