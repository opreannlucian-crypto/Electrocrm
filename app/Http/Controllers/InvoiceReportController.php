<?php

namespace App\Http\Controllers;

use App\Exports\InvoiceFinancialReportExport;
use App\Services\Reports\InvoiceFinancialReport;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class InvoiceReportController extends Controller
{
    public function index(Request $request, InvoiceFinancialReport $report)
    {
        $this->ensureFinancialAccess($request);
        $data = $report->build($this->filters($request));

        return Inertia::render('Reports/Invoices/Index', [
            ...$data,
            'clients' => $report->selectableClients(),
            'statusOptions' => InvoiceFinancialReport::STATUS_OPTIONS,
        ]);
    }

    public function excel(Request $request, InvoiceFinancialReport $report): Response
    {
        $this->ensureFinancialAccess($request);
        $data = $report->build($this->filters($request));
        $path = InvoiceFinancialReportExport::generate($data);

        return response()
            ->download($path, basename($path), [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ])
            ->deleteFileAfterSend(true);
    }

    public function pdf(Request $request, InvoiceFinancialReport $report): Response
    {
        $this->ensureFinancialAccess($request);
        $data = $report->build($this->filters($request));
        $filename = sprintf('raport_facturi_%s_%s.pdf', $data['filters']['date_from'], $data['filters']['date_to']);

        return Pdf::loadView('reports.invoices.pdf', $data)
            ->setPaper('a4', 'landscape')
            ->download($filename);
    }

    /**
     * @return array<string, mixed>
     */
    private function filters(Request $request): array
    {
        return $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
            'client_id' => ['nullable', 'integer', 'exists:clients,id'],
            'status' => ['nullable', 'string'],
        ]);
    }

    private function ensureFinancialAccess(Request $request): void
    {
        abort_unless(
            $request->user()?->isAdministrator() || $request->user()?->isSalesManager(),
            403,
            'Raportul financiar este disponibil doar administratorului și managerului de vânzări.'
        );
    }
}
