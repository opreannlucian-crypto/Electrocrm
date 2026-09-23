<?php

namespace App\Http\Controllers;

use App\Models\DashboardActivity;
use Illuminate\Http\Request;

class DashboardActivityController extends Controller
{
    public function store(Request $request)
    {
        $this->ensureAccess($request);
        $data = $request->validate([
            'activity_date' => ['required', 'date'],
            'title' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:4000'],
            'assigned_employee_id' => ['nullable', 'exists:employees,id'],
        ]);

        DashboardActivity::create($data + ['status' => 'assigned', 'created_by' => $request->user()->id]);

        return back()->with('success', 'Activitatea a fost adăugată în jurnal.');
    }

    public function update(Request $request, DashboardActivity $dashboardActivity)
    {
        $this->ensureAccess($request);
        $data = $request->validate(['status' => ['required', 'in:open,assigned,in_progress,completed']]);
        $status = $data['status'] === 'open' ? 'assigned' : $data['status'];
        $dashboardActivity->update([
            'status' => $status,
            'completed_at' => $status === 'completed' ? now() : null,
        ]);

        return back()->with('success', 'Statusul activității a fost actualizat.');
    }

    private function ensureAccess(Request $request): void
    {
        abort_unless($request->user()?->isAdministrator() || $request->user()?->isSalesManager(), 403);
    }
}
