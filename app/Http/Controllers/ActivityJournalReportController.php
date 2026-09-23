<?php

namespace App\Http\Controllers;

use App\Models\DashboardActivity;
use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActivityJournalReportController extends Controller
{
    public function index(Request $request)
    {
        abort_if($request->user()?->isTechnician(), 403);

        $filters = $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
            'employee_id' => ['nullable', 'exists:employees,id'],
            'status' => ['nullable', 'in:all,assigned,in_progress,completed'],
        ]);
        $from = $filters['date_from'] ?? now()->startOfMonth()->toDateString();
        $to = $filters['date_to'] ?? now()->endOfMonth()->toDateString();
        $status = $filters['status'] ?? 'all';

        $activities = DashboardActivity::with(['assignedEmployee:id,name', 'creator:id,name'])
            ->whereBetween('activity_date', [$from, $to])
            ->when($filters['employee_id'] ?? null, fn ($query, $id) => $query->where('assigned_employee_id', $id))
            ->when($status !== 'all', fn ($query) => $query->where('status', $status))
            ->orderBy('activity_date')
            ->orderBy('status')
            ->latest('id')
            ->get()
            ->map(fn (DashboardActivity $activity) => [
                'id' => $activity->id,
                'date' => $activity->activity_date?->format('d.m.Y'),
                'title' => $activity->title,
                'notes' => $activity->notes,
                'employee' => $activity->assignedEmployee?->name ?? 'Nealocat',
                'created_by' => $activity->creator?->name ?? '—',
                'status' => $activity->status,
                'completed_at' => $activity->completed_at?->format('d.m.Y H:i'),
            ]);

        return Inertia::render('ActivityJournalReports/Index', [
            'activities' => $activities,
            'employees' => Employee::where('active', true)->orderBy('name')->get(['id', 'name']),
            'filters' => ['date_from' => $from, 'date_to' => $to, 'employee_id' => $filters['employee_id'] ?? '', 'status' => $status],
            'totals' => [
                'all' => $activities->count(),
                'assigned' => $activities->where('status', 'assigned')->count(),
                'in_progress' => $activities->where('status', 'in_progress')->count(),
                'completed' => $activities->where('status', 'completed')->count(),
            ],
        ]);
    }
}
