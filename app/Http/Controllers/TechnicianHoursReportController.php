<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Attendance;
use App\Models\WorkOrderTimeEntry;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TechnicianHoursReportController extends Controller
{
    public function index(Request $request)
    {
        abort_if($request->user()?->isTechnician(), 403);

        $period = $request->get('period', 'month');
        $anchor = Carbon::parse($request->get('date', now()->toDateString()));

        if ($period === 'day') {
            $start = $anchor->copy()->startOfDay();
            $end = $anchor->copy()->endOfDay();
        } elseif ($period === 'week') {
            $start = $anchor->copy()->startOfWeek();
            $end = $anchor->copy()->endOfWeek();
        } elseif ($period === 'year') {
            $start = $anchor->copy()->startOfYear();
            $end = $anchor->copy()->endOfYear();
        } elseif ($period === 'custom') {
            $start = Carbon::parse($request->get('start_date', now()->startOfMonth()->toDateString()))->startOfDay();
            $end = Carbon::parse($request->get('end_date', now()->toDateString()))->endOfDay();
            if ($end->lt($start)) {
                [$start, $end] = [$end->copy()->startOfDay(), $start->copy()->endOfDay()];
            }
        } else {
            $period = 'month';
            $start = $anchor->copy()->startOfMonth();
            $end = $anchor->copy()->endOfMonth();
        }

        $entries = WorkOrderTimeEntry::query()
            ->with(['employee:id,name,position', 'workOrder:id,number,type,address,client_id', 'workOrder.client:id,name'])
            ->whereNotNull('ended_at')
            ->whereBetween('started_at', [$start, $end])
            ->when($request->filled('employee_id'), fn ($query) => $query->where('employee_id', $request->integer('employee_id')))
            ->orderBy('started_at')
            ->get()
            ->map(function (WorkOrderTimeEntry $entry) {
                $minutes = $entry->duration_minutes ?? $entry->started_at->diffInMinutes($entry->ended_at);

                return [
                    'id' => $entry->id,
                    'employee_id' => $entry->employee_id,
                    'employee_name' => $entry->employee?->name ?? 'Tehnician șters',
                    'date' => $entry->started_at->toDateString(),
                    'started_at' => $entry->started_at->format('H:i'),
                    'ended_at' => $entry->ended_at->format('H:i'),
                    'minutes' => $minutes,
                    'hours' => round($minutes / 60, 2),
                    'work_order' => $entry->workOrder ? [
                        'id' => $entry->workOrder->id,
                        'number' => $entry->workOrder->number,
                        'client_name' => $entry->workOrder->client?->name,
                    ] : null,
                ];
            })
            ->values();

        $workMinutesByDay = $entries->groupBy(
            fn ($entry) => $entry['employee_id'] . '|' . $entry['date']
        )->map(fn ($dayEntries) => $dayEntries->sum('minutes'));

        $dailyRows = Attendance::query()
            ->with('employee:id,name')
            ->whereNotNull('check_in')
            ->whereNotNull('check_out')
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->when($request->filled('employee_id'), fn ($query) => $query->where('employee_id', $request->integer('employee_id')))
            ->orderBy('date')
            ->get()
            ->map(function (Attendance $attendance) use ($workMinutesByDay) {
                $startedAt = Carbon::parse($attendance->date->toDateString() . ' ' . $attendance->check_in);
                $endedAt = Carbon::parse($attendance->date->toDateString() . ' ' . $attendance->check_out);
                if ($endedAt->lt($startedAt)) {
                    $endedAt->addDay();
                }

                $grossMinutes = $startedAt->diffInMinutes($endedAt);
                $breakMinutes = (int) ($attendance->break_minutes ?? 0);
                $netMinutes = max(0, $grossMinutes - $breakMinutes);
                $workMinutes = (int) ($workMinutesByDay->get($attendance->employee_id . '|' . $attendance->date->toDateString(), 0));
                $differenceMinutes = $netMinutes - $workMinutes;

                return [
                    'employee_id' => $attendance->employee_id,
                    'employee_name' => $attendance->employee?->name ?? 'Tehnician șters',
                    'date' => $attendance->date->toDateString(),
                    'check_in' => substr((string) $attendance->check_in, 0, 5),
                    'check_out' => substr((string) $attendance->check_out, 0, 5),
                    'break_minutes' => $breakMinutes,
                    'net_minutes' => $netMinutes,
                    'work_minutes' => $workMinutes,
                    'unallocated_minutes' => max(0, $differenceMinutes),
                    'overallocated_minutes' => max(0, -$differenceMinutes),
                ];
            })
            ->values();

        $attendanceByEmployee = $dailyRows->groupBy('employee_id');
        $workByEmployee = $entries->groupBy('employee_id');
        $employeeIds = $attendanceByEmployee->keys()->merge($workByEmployee->keys())->unique();

        $summaries = $employeeIds->map(function ($employeeId) use ($attendanceByEmployee, $workByEmployee) {
            $attendanceDays = $attendanceByEmployee->get($employeeId, collect());
            $employeeEntries = $workByEmployee->get($employeeId, collect());
            $first = $attendanceDays->first() ?? $employeeEntries->first();
            $netMinutes = $attendanceDays->sum('net_minutes');
            $workMinutes = $employeeEntries->sum('minutes');

            return [
                'employee_id' => (int) $employeeId,
                'employee_name' => $first['employee_name'],
                'entries_count' => $employeeEntries->count(),
                'attendance_days' => $attendanceDays->count(),
                'day_minutes' => $netMinutes,
                'work_minutes' => $workMinutes,
                'unallocated_minutes' => max(0, $netMinutes - $workMinutes),
                'overallocated_minutes' => max(0, $workMinutes - $netMinutes),
            ];
        })->sortBy('employee_name')->values();

        return Inertia::render('TechnicianHoursReports/Index', [
            'employees' => Employee::where('active', true)->orderBy('name')->get(['id', 'name', 'position']),
            'entries' => $entries,
            'dailyRows' => $dailyRows,
            'summaries' => $summaries,
            'totalDayHours' => round($dailyRows->sum('net_minutes') / 60, 2),
            'totalWorkHours' => round($entries->sum('minutes') / 60, 2),
            'totalUnallocatedHours' => round($dailyRows->sum('unallocated_minutes') / 60, 2),
            'filters' => [
                'period' => $period,
                'date' => $anchor->toDateString(),
                'start_date' => $start->toDateString(),
                'end_date' => $end->toDateString(),
                'employee_id' => $request->get('employee_id', ''),
            ],
        ]);
    }
}
