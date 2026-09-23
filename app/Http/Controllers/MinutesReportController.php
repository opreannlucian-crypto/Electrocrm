<?php

namespace App\Http\Controllers;

use App\Models\FreeReport;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MinutesReportController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'client_name' => ['nullable', 'string', 'max:255'],
            'report_type' => ['nullable', 'string', 'max:255'],
        ]);

        $reports = FreeReport::query()
            ->with('workOrder')
            ->when($filters['date_from'] ?? null, fn ($query, $date) => $query->whereDate('document_date', '>=', $date))
            ->when($filters['date_to'] ?? null, fn ($query, $date) => $query->whereDate('document_date', '<=', $date))
            ->when($filters['client_name'] ?? null, fn ($query, $client) => $query->where('client_name', $client))
            ->when($filters['report_type'] ?? null, fn ($query, $type) => $query->where('title', $type))
            ->orderByDesc('document_date')
            ->orderByDesc('id')
            ->get()
            ->map(fn (FreeReport $report) => [
                'id' => $report->id,
                'number' => $report->number,
                'date' => $report->document_date?->format('Y-m-d'),
                'client_name' => $report->client_name,
                'report_type' => $report->title,
                'location' => $report->location,
                'work_order_number' => $report->workOrder?->number,
            ]);

        return Inertia::render('MinutesReports/Index', [
            'reports' => $reports,
            'clients' => FreeReport::query()->whereNotNull('client_name')->where('client_name', '!=', '')->distinct()->orderBy('client_name')->pluck('client_name')->values(),
            'types' => FreeReport::query()->whereNotNull('title')->where('title', '!=', '')->distinct()->orderBy('title')->pluck('title')->values(),
            'filters' => [
                'date_from' => $filters['date_from'] ?? '',
                'date_to' => $filters['date_to'] ?? '',
                'client_name' => $filters['client_name'] ?? '',
                'report_type' => $filters['report_type'] ?? '',
            ],
        ]);
    }
}
