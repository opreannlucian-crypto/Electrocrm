<?php

namespace App\Services\Notifications;

use App\Enums\UserRole;
use App\Models\Employee;
use App\Models\Invoice;
use App\Models\NotificationDelivery;
use App\Models\NotificationEvent;
use App\Models\NotificationRule;
use App\Models\User;
use App\Models\WorkOrder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class NotificationOrchestrator
{
    /**
     * @param array<string, mixed> $payload
     */
    public function handle(string $eventKey, Model $subject, ?User $actor = null, array $payload = []): NotificationEvent
    {
        $notificationEvent = NotificationEvent::create([
            'event_key' => $eventKey,
            'subject_type' => $subject->getMorphClass(),
            'subject_id' => $subject->getKey(),
            'actor_user_id' => $actor?->getKey(),
            'payload' => $payload,
            'occurred_at' => now(),
        ]);

        $this->createInternalDeliveries($notificationEvent, $subject, $eventKey, $payload);

        return $notificationEvent;
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function createInternalDeliveries(NotificationEvent $notificationEvent, Model $subject, string $eventKey, array $payload): void
    {
        if ($this->ruleEnabled($eventKey, NotificationRule::AUDIENCE_INTERNAL_ADMIN)) {
            $this->createDeliveriesForUsers(
                $notificationEvent,
                $subject,
                $eventKey,
                $payload,
                User::query()->where('role', UserRole::Administrator->value)->get(),
                NotificationRule::AUDIENCE_INTERNAL_ADMIN,
            );
        }

        if ($subject instanceof WorkOrder && $this->ruleEnabled($eventKey, NotificationRule::AUDIENCE_INTERNAL_TECHNICIAN)) {
            $this->createDeliveriesForUsers(
                $notificationEvent,
                $subject,
                $eventKey,
                $payload,
                $this->technicianUsersFor($subject, $payload),
                NotificationRule::AUDIENCE_INTERNAL_TECHNICIAN,
            );
        }
    }

    private function ruleEnabled(string $eventKey, string $audience): bool
    {
        $rule = NotificationRule::query()
            ->where('event_key', $eventKey)
            ->where('audience', $audience)
            ->where('channel', NotificationDelivery::CHANNEL_APP)
            ->first();

        if ($rule) {
            return $rule->enabled;
        }

        return $audience === NotificationRule::AUDIENCE_INTERNAL_ADMIN
            || !in_array($eventKey, ['work_order.created', 'invoice.issued'], true);
    }

    /**
     * @param array<string, mixed> $payload
     * @param Collection<int, User> $users
     */
    private function createDeliveriesForUsers(NotificationEvent $notificationEvent, Model $subject, string $eventKey, array $payload, Collection $users, string $audience): void
    {
        $message = $this->messageFor($eventKey, $subject, $payload, $audience);

        $users
            ->filter(fn (User $user) => $user->getKey() !== null)
            ->unique(fn (User $user) => $user->getKey())
            ->each(function (User $user) use ($notificationEvent, $eventKey, $subject, $payload, $message) {
                $dedupeKey = $this->dedupeKey($eventKey, $subject, $user, NotificationDelivery::CHANNEL_APP, $payload);

                NotificationDelivery::query()->firstOrCreate(
                    ['dedupe_key' => $dedupeKey],
                    [
                        'notification_event_id' => $notificationEvent->getKey(),
                        'recipient_type' => $user->getMorphClass(),
                        'recipient_id' => $user->getKey(),
                        'channel' => NotificationDelivery::CHANNEL_APP,
                        'recipient_address' => $user->email,
                        'title' => $message['title'],
                        'body' => $message['body'],
                        'action_url' => $message['action_url'],
                        'status' => NotificationDelivery::STATUS_DELIVERED,
                        'sent_at' => now(),
                        'delivered_at' => now(),
                        'meta' => [
                            'event_key' => $eventKey,
                            'subject_type' => $subject->getMorphClass(),
                            'subject_id' => $subject->getKey(),
                        ],
                    ],
                );
            });
    }

    /**
     * @param array<string, mixed> $payload
     * @return Collection<int, User>
     */
    private function technicianUsersFor(WorkOrder $workOrder, array $payload): Collection
    {
        $employeeIds = $workOrder->employees()
            ->pluck('employees.id')
            ->map(fn (mixed $id) => (int) $id)
            ->all();

        if (empty($employeeIds) && $workOrder->employee_id) {
            $employeeIds[] = (int) $workOrder->employee_id;
        }

        foreach ((array) ($payload['removed_employee_ids'] ?? []) as $employeeId) {
            $employeeIds[] = (int) $employeeId;
        }

        return Employee::query()
            ->with('user')
            ->whereIn('id', array_values(array_unique(array_filter($employeeIds))))
            ->get()
            ->map(fn (Employee $employee) => $employee->user)
            ->filter(fn (?User $user) => $user !== null)
            ->values();
    }

    /**
     * @param array<string, mixed> $payload
     * @return array{title:string,body:string,action_url:string|null}
     */
    private function messageFor(string $eventKey, Model $subject, array $payload, string $audience): array
    {
        if ($subject instanceof WorkOrder) {
            $number = $subject->number ?: 'Lucrare #' . $subject->getKey();
            $schedule = $this->scheduleLabel($subject);
            $title = match ($eventKey) {
                'work_order.created' => 'Lucrare nouă: ' . $number,
                'work_order.assigned' => $audience === NotificationRule::AUDIENCE_INTERNAL_TECHNICIAN
                    ? 'Ai fost alocat la ' . $number
                    : 'Tehnicieni alocați la ' . $number,
                'work_order.scheduled' => 'Lucrare programată: ' . $number,
                'work_order.rescheduled' => 'Programare modificată: ' . $number,
                'work_order.time_changed' => 'Ora lucrării a fost modificată: ' . $number,
                'work_order.technicians_changed' => 'Echipa lucrării a fost actualizată: ' . $number,
                'work_order.started' => 'Lucrare începută: ' . $number,
                'work_order.completed' => 'Lucrare finalizată: ' . $number,
                'work_order.cancelled' => 'Lucrare anulată: ' . $number,
                'work_order.reminder_24h' => 'Reminder: lucrare mâine — ' . $number,
                default => 'Actualizare lucrare: ' . $number,
            };

            $body = match ($eventKey) {
                'work_order.scheduled', 'work_order.rescheduled', 'work_order.time_changed' => 'Programare: ' . ($schedule ?: 'neprecizată') . '.',
                'work_order.started' => 'Lucrarea a fost trecută în statusul „În lucru”.',
                'work_order.completed' => 'Lucrarea a fost finalizată.',
                'work_order.cancelled' => 'Lucrarea a fost anulată.',
                'work_order.assigned' => 'Ai fost adăugat în echipa lucrării.' ,
                'work_order.technicians_changed' => 'Componența echipei alocate a fost modificată.',
                'work_order.reminder_24h' => 'Lucrarea este programată pentru ' . ($schedule ?: 'mâine') . '.',
                default => 'Client: ' . ($subject->client?->name ?: 'neprecizat') . ($schedule ? '. Programare: ' . $schedule . '.' : '.'),
            };

            return [
                'title' => $title,
                'body' => $body,
                'action_url' => route('work_orders.show', $subject, false),
            ];
        }

        if ($subject instanceof Invoice) {
            return [
                'title' => 'Factură emisă: ' . $subject->number,
                'body' => 'Factura pentru ' . ($subject->client?->name ?: 'client') . ' a fost emisă în valoare de ' . number_format((float) $subject->total, 2, ',', '.') . ' RON.',
                'action_url' => route('invoices.show', $subject, false),
            ];
        }

        return [
            'title' => 'Notificare ElectroCRM',
            'body' => Str::headline(str_replace('.', ' ', $eventKey)),
            'action_url' => null,
        ];
    }

    private function scheduleLabel(WorkOrder $workOrder): ?string
    {
        if (!$workOrder->scheduled_date) {
            return null;
        }

        $date = $workOrder->scheduled_date->format('d.m.Y');
        $time = $workOrder->scheduled_time ? substr((string) $workOrder->scheduled_time, 0, 5) : null;

        return $time ? $date . ' la ' . $time : $date;
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function dedupeKey(string $eventKey, Model $subject, User $user, string $channel, array $payload): string
    {
        $context = (string) ($payload['dedupe_context'] ?? ($payload['changed_at'] ?? now()->format('Y-m-d H:i:s.u')));

        return hash('sha256', implode('|', [
            $eventKey,
            $subject->getMorphClass(),
            $subject->getKey(),
            $user->getKey(),
            $channel,
            $context,
        ]));
    }
}
