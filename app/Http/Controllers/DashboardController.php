<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\DashboardActivity;
use App\Models\Employee;
use App\Models\Quote;
use App\Models\WorkOrder;
use App\Models\WorkOrderTimeEntry;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Dashboard principal
     */
    public function index()
    {
        /*
        |--------------------------------------------------------------------------
        | Data curentă
        |--------------------------------------------------------------------------
        */

        $today = now()->toDateString();

        if (request()->user()?->isTechnician()) {
            return $this->technicianDashboard(request()->user(), $today);
        }

        /*
        |--------------------------------------------------------------------------
        | Statistici generale
        |--------------------------------------------------------------------------
        */

        $stats = [
            'clients' => Client::count(),

            'employees' => Employee::count(),

            'workOrders' => WorkOrder::count(),

            'newWorkOrders' => WorkOrder::where(
                'status',
                'noua'
            )->count(),

            'workingWorkOrders' => WorkOrder::where(
                'status',
                'lucru'
            )->count(),

            'finishedWorkOrders' => WorkOrder::where(
                'status',
                'finalizata'
            )->count(),

            'scheduledToday' => WorkOrder::whereDate(
                'scheduled_date',
                $today
            )->count(),
            'activeWorkMinutes' => $this->activeWorkMinutes($today),
        ];

        $dashboardActivities = DashboardActivity::with(['assignedEmployee:id,name', 'creator:id,name'])
            ->whereDate('activity_date', '>=', $today)
            ->orderBy('status')
            ->orderBy('activity_date')
            ->latest('id')
            ->take(12)
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Statistici Oferte
        |--------------------------------------------------------------------------
        */

        $quoteStats = [
            'total' => Quote::where(
                'type',
                'oferta'
            )->count(),

            // O ofertă acceptată sau respinsă a fost deja trimisă; indicatorul
            // arată câte oferte au ieșit din stadiul de ciornă, nu doar cele
            // care așteaptă în prezent un răspuns.
            'sent' => Quote::where('type', 'oferta')
                ->whereIn('status', ['sent', 'accepted', 'rejected'])
                ->count(),

            'accepted' => Quote::where(
                'type',
                'oferta'
            )
                ->where(
                    'status',
                    'accepted'
                )
                ->count(),

            'rejected' => Quote::where(
                'type',
                'oferta'
            )
                ->where(
                    'status',
                    'rejected'
                )
                ->count(),

            'draft' => Quote::where(
                'type',
                'oferta'
            )
                ->where(
                    'status',
                    'draft'
                )
                ->count(),
        ];

        /*
        |--------------------------------------------------------------------------
        | Statistici Devize
        |--------------------------------------------------------------------------
        */

        $devizStats = [
            'total' => Quote::where(
                'type',
                'deviz'
            )->count(),

            'finalizat' => Quote::where(
                'type',
                'deviz'
            )
                ->where(
                    'status',
                    'finalizat'
                )
                ->count(),

            'draft' => Quote::where(
                'type',
                'deviz'
            )
                ->where(
                    'status',
                    'draft'
                )
                ->count(),
        ];

        /*
        |--------------------------------------------------------------------------
        | Valoarea ofertelor acceptate
        |--------------------------------------------------------------------------
        */

        $acceptedQuotes = Quote::with('items')
            ->where(
                'type',
                'oferta'
            )
            ->where(
                'status',
                'accepted'
            )
            ->get();

        $acceptedQuotesValue = 0;

        foreach ($acceptedQuotes as $quote) {
            $subtotal = 0;

            foreach ($quote->items as $item) {
                $quantity =
                    (float) $item->quantity;

                $unitPrice =
                    (float) $item->unit_price;

                $itemDiscount =
                    (float) ($item->discount ?? 0);

                $value =
                    $quantity * $unitPrice;

                $valueAfterItemDiscount =
                    $value -
                    (
                        $value *
                        $itemDiscount /
                        100
                    );

                $subtotal +=
                    $valueAfterItemDiscount;
            }

            $quoteDiscount =
                (float) ($quote->discount ?? 0);

            $afterDiscount =
                $subtotal -
                (
                    $subtotal *
                    $quoteDiscount /
                    100
                );

            $vatRate =
                (float) ($quote->vat_rate ?? 0);

            $vat =
                $afterDiscount *
                $vatRate /
                100;

            $total =
                $afterDiscount +
                $vat;

            $acceptedQuotesValue +=
                $total;
        }

        /*
        |--------------------------------------------------------------------------
        | Lucrări programate astăzi
        |--------------------------------------------------------------------------
        */

        $scheduledToday = WorkOrder::with([
            'client',
            'employee',
        ])
            ->whereDate(
                'scheduled_date',
                $today
            )
            ->orderByRaw(
                'CASE
                    WHEN scheduled_time IS NULL OR scheduled_time = ""
                    THEN 1
                    ELSE 0
                END'
            )
            ->orderBy(
                'scheduled_time'
            )
            ->orderBy(
                'id'
            )
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Ultimele lucrări
        |--------------------------------------------------------------------------
        */

        $latestWorkOrders = WorkOrder::with([
            'client',
            'employee',
        ])
            ->latest()
            ->take(8)
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Ultimele oferte și devize
        |--------------------------------------------------------------------------
        |
        | Luăm ambele tipuri pentru ca Dashboard.jsx să poată
        | separa corect ofertele de devize.
        |
        */

        $latestQuotes = Quote::with([
            'client',
            'workOrder',
            'items',
            'license',
        ])
            ->whereIn(
                'type',
                [
                    'oferta',
                    'deviz',
                ]
            )
            ->latest()
            ->take(10)
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Dashboard
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'Dashboard',
            [
                'stats' =>
                    $stats,

                'quoteStats' =>
                    $quoteStats,

                'devizStats' =>
                    $devizStats,

                'acceptedQuotesValue' =>
                    round(
                        $acceptedQuotesValue,
                        2
                    ),

                'scheduledToday' =>
                    $scheduledToday,

                'latestWorkOrders' =>
                    $latestWorkOrders,

                'latestQuotes' =>
                    $latestQuotes,

                'dashboardActivities' => $dashboardActivities,
                'activityEmployees' => Employee::where('active', true)->orderBy('name')->get(['id', 'name']),
            ]
        );
    }

    private function technicianDashboard(User $user, string $today): Response
    {
        abort_unless($user->employee_id, 403, 'Contul de tehnician nu este asociat unui angajat.');

        $workOrders = WorkOrder::query()
            ->where(function ($query) use ($user) {
                $query->where('employee_id', $user->employee_id)
                    ->orWhereHas('employees', fn ($employees) => $employees->whereKey($user->employee_id));
            });

        $stats = [
            'clients' => 0,
            'employees' => 0,
            'workOrders' => (clone $workOrders)->count(),
            'newWorkOrders' => (clone $workOrders)->where('status', 'noua')->count(),
            'workingWorkOrders' => (clone $workOrders)->where('status', 'lucru')->count(),
            'finishedWorkOrders' => (clone $workOrders)->where('status', 'finalizata')->count(),
            'scheduledToday' => (clone $workOrders)->whereDate('scheduled_date', $today)->count(),
            'activeWorkMinutes' => $this->activeWorkMinutes($today, $user->employee_id),
        ];

        $scheduledToday = (clone $workOrders)
            ->with(['client', 'employee'])
            ->whereDate('scheduled_date', $today)
            ->orderBy('scheduled_time')
            ->get();

        $latestWorkOrders = (clone $workOrders)
            ->with(['client', 'employee'])
            ->latest()
            ->take(8)
            ->get();

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'quoteStats' => [
                'total' => 0,
                'sent' => 0,
                'accepted' => 0,
                'rejected' => 0,
                'draft' => 0,
            ],
            'devizStats' => [
                'total' => 0,
                'finalizat' => 0,
                'draft' => 0,
            ],
            'acceptedQuotesValue' => 0,
            'scheduledToday' => $scheduledToday,
            'latestWorkOrders' => $latestWorkOrders,
            'latestQuotes' => [],
            'dashboardActivities' => DashboardActivity::with(['assignedEmployee:id,name', 'creator:id,name'])
                ->where('assigned_employee_id', $user->employee_id)->whereDate('activity_date', '>=', $today)->orderBy('status')->orderBy('activity_date')->take(12)->get(),
            'activityEmployees' => [],
        ]);
    }

    private function activeWorkMinutes(string $today, ?int $employeeId = null): int
    {
        return (int) WorkOrderTimeEntry::query()
            ->whereDate('started_at', $today)
            ->when($employeeId, fn ($query) => $query->where('employee_id', $employeeId))
            ->get()
            ->sum(fn (WorkOrderTimeEntry $entry) => $entry->ended_at
                ? ($entry->duration_minutes ?? $entry->started_at->diffInMinutes($entry->ended_at))
                : $entry->started_at->diffInMinutes(now()));
    }
}
