<?php

namespace App\Http\Controllers;

use App\Models\NotificationDelivery;
use App\Models\NotificationRule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationSettingsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('NotificationSettings/Index', [
            'rules' => NotificationRule::query()
                ->where('channel', NotificationDelivery::CHANNEL_APP)
                ->orderBy('event_key')
                ->orderBy('audience')
                ->get(),
            'eventLabels' => $this->eventLabels(),
            'audienceLabels' => [
                NotificationRule::AUDIENCE_INTERNAL_ADMIN => 'Administratori',
                NotificationRule::AUDIENCE_INTERNAL_TECHNICIAN => 'Tehnicieni alocați',
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'rules' => ['required', 'array'],
            'rules.*.id' => ['nullable', 'integer', 'exists:notification_rules,id'],
            'rules.*.event_key' => ['required', 'string', 'max:120'],
            'rules.*.audience' => ['required', 'in:internal_admin,internal_technician'],
            'rules.*.enabled' => ['required', 'boolean'],
        ]);

        foreach ($validated['rules'] as $rule) {
            NotificationRule::updateOrCreate(
                [
                    'event_key' => $rule['event_key'],
                    'audience' => $rule['audience'],
                    'channel' => NotificationDelivery::CHANNEL_APP,
                ],
                [
                    'enabled' => $rule['enabled'],
                    'timing' => 'immediate',
                ],
            );
        }

        return back()->with('success', 'Setările de notificare au fost actualizate.');
    }

    /**
     * @return array<string, string>
     */
    private function eventLabels(): array
    {
        return [
            'work_order.created' => 'Lucrare nouă',
            'work_order.assigned' => 'Tehnician alocat',
            'work_order.scheduled' => 'Lucrare programată',
            'work_order.rescheduled' => 'Lucrare reprogramată',
            'work_order.time_changed' => 'Oră lucrare modificată',
            'work_order.technicians_changed' => 'Echipă lucrare modificată',
            'work_order.started' => 'Lucrare începută',
            'work_order.completed' => 'Lucrare finalizată',
            'work_order.cancelled' => 'Lucrare anulată',
            'work_order.reminder_24h' => 'Reminder lucrare cu 24 ore înainte',
            'revision.due_soon' => 'Reminder revizie apropiată',
            'invoice.issued' => 'Factură emisă',
        ];
    }
}
