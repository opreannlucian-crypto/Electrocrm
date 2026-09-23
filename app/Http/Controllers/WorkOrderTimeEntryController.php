<?php

namespace App\Http\Controllers;

use App\Models\WorkOrder;
use App\Models\WorkOrderTimeEntry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class WorkOrderTimeEntryController extends Controller
{
    /**
     * Porneste pontajul pentru o lucrare.
     */
    public function start(
        Request $request,
        WorkOrder $workOrder
    ): RedirectResponse {
        $employeeId = $this->employeeForRequest($request, $workOrder);
        $location = $this->locationFromRequest($request);

        $alreadyStarted = WorkOrderTimeEntry::query()
            ->where('work_order_id', $workOrder->id)
            ->where('employee_id', $employeeId)
            ->whereNull('ended_at')
            ->exists();

        if ($alreadyStarted) {
            return back()->with(
                'error',
                'Pontajul pentru aceasta lucrare este deja pornit.'
            );
        }

        $otherActiveEntry = WorkOrderTimeEntry::query()
            ->where('employee_id', $employeeId)
            ->whereNull('ended_at')
            ->with('workOrder')
            ->first();

        if ($otherActiveEntry) {
            $otherWorkOrder = $otherActiveEntry->workOrder;

            return back()->with(
                'error',
                'Angajatul are deja o lucrare pornita: ' .
                (
                    $otherWorkOrder?->number
                    ?: 'Lucrare #' . $otherActiveEntry->work_order_id
                ) .
                '. Terminati lucrarea curenta inainte de a porni alta.'
            );
        }

        $now = now();

        WorkOrderTimeEntry::create([
            'work_order_id' => $workOrder->id,
            'employee_id' => $employeeId,
            'started_at' => $now,
            'start_latitude' => $location['gps_latitude'] ?? null,
            'start_longitude' => $location['gps_longitude'] ?? null,
            'start_accuracy' => $location['gps_accuracy'] ?? null,
            'ended_at' => null,
            'duration_minutes' => null,
            'notes' => null,
        ]);

        if (!$workOrder->started_at) {
            $workOrder->update([
                'started_at' => $now,
                'status' => 'lucru',
            ]);
        } elseif ($workOrder->status !== 'lucru') {
            $workOrder->update(['status' => 'lucru']);
        }

        return back()->with(
            'success',
            'Pontajul pentru lucrare a fost pornit.'
        );
    }

    /**
     * Opreste pontajul pentru o lucrare.
     */
    public function stop(
        Request $request,
        WorkOrder $workOrder
    ): RedirectResponse {
        $employeeId = $this->employeeForRequest($request, $workOrder);
        $location = $this->locationFromRequest($request);

        $timeEntry = WorkOrderTimeEntry::query()
            ->where('work_order_id', $workOrder->id)
            ->where('employee_id', $employeeId)
            ->whereNull('ended_at')
            ->latest('started_at')
            ->first();

        if (!$timeEntry) {
            return back()->with(
                'error',
                'Nu exista un pontaj activ pentru aceasta lucrare.'
            );
        }

        $endedAt = now();

        $durationMinutes = $timeEntry->started_at
            ->diffInMinutes($endedAt);

        $timeEntry->update([
            'ended_at' => $endedAt,
            'stop_latitude' => $location['gps_latitude'] ?? null,
            'stop_longitude' => $location['gps_longitude'] ?? null,
            'stop_accuracy' => $location['gps_accuracy'] ?? null,
            'duration_minutes' => $durationMinutes,
        ]);

        if (!WorkOrderTimeEntry::query()->where('work_order_id', $workOrder->id)->whereNull('ended_at')->exists()) {
            $workOrder->update([
                'completed_at' => $endedAt,
                'status' => 'finalizata',
            ]);
        }

        return back()->with(
            'success',
            'Pontajul pentru lucrare a fost oprit. Timp lucrat: ' .
            $this->formatDuration($durationMinutes) .
            '.'
        );
    }

    /**
     * Afiseaza intervalele de timp ale unei lucrari.
     */
    public function index(
        WorkOrder $workOrder
    ) {
        $this->employeeForRequest(request(), $workOrder);

        $timeEntries = $workOrder->timeEntries()
            ->with('employee');

        if (request()->user()?->isTechnician()) {
            $timeEntries->where('employee_id', request()->user()->employee_id);
        }

        $timeEntries = $timeEntries->get();

        if (!request()->user()?->isAdministrator()) {
            $timeEntries->each->makeHidden([
                'start_latitude',
                'start_longitude',
                'start_accuracy',
                'stop_latitude',
                'stop_longitude',
                'stop_accuracy',
            ]);
        }

        return response()->json([
            'work_order' => $workOrder->id,
            'time_entries' => $timeEntries,
        ]);
    }

    /**
     * Corectează un interval de pontaj. Doar administratorul poate modifica
     * orele introduse de un tehnician.
     */
    public function update(Request $request, WorkOrder $workOrder, WorkOrderTimeEntry $timeEntry): RedirectResponse
    {
        abort_unless($request->user()?->isAdministrator(), 403, 'Doar administratorul poate modifica pontajul.');
        abort_unless((int) $timeEntry->work_order_id === (int) $workOrder->id, 404);

        $data = $request->validate([
            'started_at' => ['required', 'date'],
            'ended_at' => ['nullable', 'date', 'after_or_equal:started_at'],
            'notes' => ['nullable', 'string', 'max:4000'],
        ]);
        $duration = filled($data['ended_at'] ?? null)
            ? \Carbon\Carbon::parse($data['started_at'])->diffInMinutes(\Carbon\Carbon::parse($data['ended_at']))
            : null;

        $timeEntry->update([
            'started_at' => $data['started_at'],
            'ended_at' => $data['ended_at'] ?? null,
            'duration_minutes' => $duration,
            'notes' => $data['notes'] ?? null,
        ]);

        $entries = $workOrder->timeEntries()->get();
        $workOrder->update([
            'started_at' => $entries->min('started_at'),
            'completed_at' => $entries->contains(fn (WorkOrderTimeEntry $entry) => !$entry->ended_at) ? null : $entries->max('ended_at'),
        ]);

        return back()->with('success', 'Intervalul de timp a fost corectat.');
    }

    private function employeeForRequest(Request $request, WorkOrder $workOrder): int
    {
        $user = $request->user();

        abort_unless($workOrder->employee_id, 422, 'Lucrarea nu are un angajat alocat.');

        if (!$user?->isTechnician()) {
            return (int) $workOrder->employee_id;
        }

        abort_unless($user->employee_id, 403, 'Contul de tehnician nu este asociat unui angajat.');

        $isAssigned = (int) $workOrder->employee_id === (int) $user->employee_id
            || $workOrder->employees()->whereKey($user->employee_id)->exists();

        abort_unless($isAssigned, 403, 'Poți ponta numai la lucrările la care ești alocat.');

        return (int) $user->employee_id;
    }

    private function locationFromRequest(Request $request): array
    {
        return $request->validate([
            'gps_latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'gps_longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'gps_accuracy' => ['nullable', 'numeric', 'min:0', 'max:999999'],
        ]);
    }

    /**
     * Formateaza durata in ore si minute.
     */
    private function formatDuration(
        int $minutes
    ): string {
        $hours = intdiv(
            $minutes,
            60
        );

        $remainingMinutes = $minutes % 60;

        if ($hours > 0) {
            return $hours .
                ' h ' .
                $remainingMinutes .
                ' min';
        }

        return $remainingMinutes . ' min';
    }
}
