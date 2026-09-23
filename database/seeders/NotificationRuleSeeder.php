<?php

namespace Database\Seeders;

use App\Models\NotificationDelivery;
use App\Models\NotificationRule;
use Illuminate\Database\Seeder;

class NotificationRuleSeeder extends Seeder
{
    public function run(): void
    {
        $eventKeys = [
            'work_order.created',
            'work_order.assigned',
            'work_order.scheduled',
            'work_order.rescheduled',
            'work_order.time_changed',
            'work_order.technicians_changed',
            'work_order.started',
            'work_order.completed',
            'work_order.cancelled',
            'work_order.reminder_24h',
            'invoice.issued',
        ];

        foreach ($eventKeys as $eventKey) {
            NotificationRule::updateOrCreate(
                [
                    'event_key' => $eventKey,
                    'audience' => NotificationRule::AUDIENCE_INTERNAL_ADMIN,
                    'channel' => NotificationDelivery::CHANNEL_APP,
                ],
                [
                    'enabled' => true,
                    'timing' => 'immediate',
                ],
            );

            NotificationRule::updateOrCreate(
                [
                    'event_key' => $eventKey,
                    'audience' => NotificationRule::AUDIENCE_INTERNAL_TECHNICIAN,
                    'channel' => NotificationDelivery::CHANNEL_APP,
                ],
                [
                    'enabled' => !in_array($eventKey, ['work_order.created', 'invoice.issued'], true),
                    'timing' => 'immediate',
                ],
            );
        }
    }
}
