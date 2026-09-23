<?php

namespace App\Http\Controllers;

use App\Models\WorkOrder;
use Inertia\Inertia;

class CalendarController extends Controller
{
    /**
     * Calendarul lucrărilor
     */
    public function index()
    {
        $events = $this->scheduledWorkOrders()
            ->get()
            ->map(function ($workOrder) {
                $date = $workOrder->scheduled_date
                    ? date(
                        'Y-m-d',
                        strtotime($workOrder->scheduled_date)
                    )
                    : null;

                $time = $workOrder->scheduled_time
                    ?: '09:00';

                $start = $date
                    ? $date . 'T' . $time
                    : null;

                /*
                |--------------------------------------------------------------------------
                | Durata implicită a unei lucrări
                |--------------------------------------------------------------------------
                |
                | Dacă nu avem o oră de final, considerăm o durată de 1 oră.
                | Calendarul va putea afișa astfel lucrarea ca eveniment
                | cu o durată vizibilă în modul săptămână/zi.
                |
                */

                $end = null;

                if ($start) {
                    try {
                        $end = date(
                            'Y-m-d\TH:i:s',
                            strtotime($start . ' +1 hour')
                        );
                    } catch (\Throwable $e) {
                        $end = null;
                    }
                }

                $color = $this->statusColor(
                    $workOrder->status
                );

                return [
                    /*
                    |--------------------------------------------------------------------------
                    | Date principale FullCalendar
                    |--------------------------------------------------------------------------
                    */

                    'id' => (string) $workOrder->id,

                    'title' =>
                        ($workOrder->number ?? 'Lucrare')
                        . ' - '
                        . ($workOrder->client->name ?? 'Client'),

                    'start' => $start,

                    'end' => $end,

                    'allDay' => false,

                    /*
                    |--------------------------------------------------------------------------
                    | Culori
                    |--------------------------------------------------------------------------
                    */

                    'color' => $color,

                    'backgroundColor' => $color,

                    'borderColor' => $color,

                    'textColor' => '#ffffff',

                    /*
                    |--------------------------------------------------------------------------
                    | Link direct către lucrare
                    |--------------------------------------------------------------------------
                    */

                    'url' => route(
                        'work_orders.show',
                        $workOrder->id
                    ),

                    /*
                    |--------------------------------------------------------------------------
                    | Date suplimentare
                    |--------------------------------------------------------------------------
                    */

                    'extendedProps' => [
                        'id' => $workOrder->id,

                        'number' =>
                            $workOrder->number ?? '-',

                        'client' =>
                            $workOrder->client->name ?? '-',

                        'phone' =>
                            $workOrder->client->phone ?? '-',

                        'email' =>
                            $workOrder->client->email ?? '-',

                        'address' =>
                            $workOrder->address
                            ?: ($workOrder->client->address ?? '-'),

                        'city' =>
                            $workOrder->client->city ?? '-',

                        'employee' =>
                            $workOrder->employee->name ?? '-',

                        'employee_id' =>
                            $workOrder->employee_id,

                        'type' =>
                            $workOrder->type ?? 'Lucrare',

                        'status' =>
                            $workOrder->status ?? 'noua',

                        'status_label' =>
                            $this->statusLabel(
                                $workOrder->status
                            ),

                        'priority' =>
                            $workOrder->priority ?? 'normala',

                        'priority_label' =>
                            $this->priorityLabel(
                                $workOrder->priority
                            ),

                        'scheduled_date' =>
                            $date,

                        'scheduled_time' =>
                            $workOrder->scheduled_time
                            ?: null,

                        'description' =>
                            $workOrder->description ?? '',

                        'notes' =>
                            $workOrder->notes ?? '',
                    ],
                ];
            })
            ->values();

        return Inertia::render(
            'Calendar',
            [
                'events' => $events,
            ]
        );
    }

    /**
     * Evenimentele calendarului.
     *
     * Păstrăm și endpoint-ul separat pentru situațiile
     * în care calendarul are nevoie să reîncarce evenimentele
     * fără să reîncarce întreaga pagină.
     */
    public function events()
    {
        $events = $this->scheduledWorkOrders()
            ->get()
            ->map(function ($workOrder) {
                return $this->formatEvent($workOrder);
            })
            ->values();

        return response()->json($events);
    }

    private function scheduledWorkOrders()
    {
        $workOrders = WorkOrder::with([
            'client',
            'employee',
            'employees',
        ])
            ->whereNotNull('scheduled_date')
            ->orderBy('scheduled_date')
            ->orderBy('scheduled_time');

        $user = request()->user();

        if ($user?->isTechnician()) {
            abort_unless($user->employee_id, 403, 'Contul de tehnician nu este asociat unui angajat.');

            $workOrders->where(function ($query) use ($user) {
                $query->where('employee_id', $user->employee_id)
                    ->orWhereHas('employees', fn ($employees) => $employees->whereKey($user->employee_id));
            });
        }

        return $workOrders;
    }

    /**
     * Formatare eveniment FullCalendar.
     */
    private function formatEvent(WorkOrder $workOrder): array
    {
        $date = $workOrder->scheduled_date
            ? date(
                'Y-m-d',
                strtotime($workOrder->scheduled_date)
            )
            : null;

        $time = $workOrder->scheduled_time
            ?: '09:00';

        $start = $date
            ? $date . 'T' . $time
            : null;

        $end = null;

        if ($start) {
            $end = date(
                'Y-m-d\TH:i:s',
                strtotime($start . ' +1 hour')
            );
        }

        $color = $this->statusColor(
            $workOrder->status
        );

        return [
            'id' => (string) $workOrder->id,

            'title' =>
                ($workOrder->number ?? 'Lucrare')
                . ' - '
                . ($workOrder->client->name ?? 'Client'),

            'start' => $start,

            'end' => $end,

            'allDay' => false,

            'color' => $color,

            'backgroundColor' => $color,

            'borderColor' => $color,

            'textColor' => '#ffffff',

            'url' => route(
                'work_orders.show',
                $workOrder->id
            ),

            'extendedProps' => [
                'id' => $workOrder->id,

                'number' =>
                    $workOrder->number ?? '-',

                'client' =>
                    $workOrder->client->name ?? '-',

                'phone' =>
                    $workOrder->client->phone ?? '-',

                'email' =>
                    $workOrder->client->email ?? '-',

                'address' =>
                    $workOrder->address
                    ?: ($workOrder->client->address ?? '-'),

                'city' =>
                    $workOrder->client->city ?? '-',

                'employee' =>
                    $workOrder->employee->name ?? '-',

                'employee_id' =>
                    $workOrder->employee_id,

                'type' =>
                    $workOrder->type ?? 'Lucrare',

                'status' =>
                    $workOrder->status ?? 'noua',

                'status_label' =>
                    $this->statusLabel(
                        $workOrder->status
                    ),

                'priority' =>
                    $workOrder->priority ?? 'normala',

                'priority_label' =>
                    $this->priorityLabel(
                        $workOrder->priority
                    ),

                'scheduled_date' =>
                    $date,

                'scheduled_time' =>
                    $workOrder->scheduled_time
                    ?: null,

                'description' =>
                    $workOrder->description ?? '',

                'notes' =>
                    $workOrder->notes ?? '',
            ],
        ];
    }

    /**
     * Culori status.
     */
    private function statusColor($status): string
    {
        return match ($status) {
            'noua' =>
                '#3b82f6',

            'programata' =>
                '#eab308',

            'lucru' =>
                '#f97316',

            'finalizata' =>
                '#22c55e',

            'anulata' =>
                '#ef4444',

            default =>
                '#64748b',
        };
    }

    /**
     * Denumire status.
     */
    private function statusLabel($status): string
    {
        return match ($status) {
            'noua' =>
                'Nouă',

            'programata' =>
                'Programată',

            'lucru' =>
                'În lucru',

            'finalizata' =>
                'Finalizată',

            'anulata' =>
                'Anulată',

            default =>
                $status
                    ? ucfirst($status)
                    : 'Necunoscut',
        };
    }

    /**
     * Denumire prioritate.
     */
    private function priorityLabel($priority): string
    {
        return match ($priority) {
            'urgenta',
            'urgent' =>
                'Urgentă',

            'ridicata',
            'high' =>
                'Ridicată',

            'normala',
            'normal',
            null,
            '' =>
                'Normală',

            'scazuta',
            'low' =>
                'Scăzută',

            default =>
                ucfirst($priority),
        };
    }
}