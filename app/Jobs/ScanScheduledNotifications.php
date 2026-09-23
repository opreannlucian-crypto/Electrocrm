<?php

namespace App\Jobs;

use App\Events\DomainNotificationEvent;
use App\Models\WorkOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUniqueUntilProcessing;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ScanScheduledNotifications implements ShouldQueue, ShouldBeUniqueUntilProcessing
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function uniqueId(): string
    {
        return 'scheduled-notifications:' . now()->format('Y-m-d-H-i');
    }

    public function handle(): void
    {
        $from = now()->addHours(23)->addMinutes(45);
        $until = now()->addHours(24)->addMinutes(15);

        WorkOrder::query()
            ->with('client')
            ->where('status', 'programata')
            ->whereNotNull('scheduled_date')
            ->get()
            ->filter(function (WorkOrder $workOrder) use ($from, $until) {
                $scheduledAt = $workOrder->scheduled_date->copy();

                if ($workOrder->scheduled_time) {
                    [$hour, $minute] = array_pad(explode(':', (string) $workOrder->scheduled_time), 2, 0);
                    $scheduledAt->setTime((int) $hour, (int) $minute);
                }

                return $scheduledAt->betweenIncluded($from, $until);
            })
            ->each(function (WorkOrder $workOrder) {
                $date = $workOrder->scheduled_date->format('Y-m-d');
                $time = $workOrder->scheduled_time ? substr((string) $workOrder->scheduled_time, 0, 5) : '';

                DomainNotificationEvent::dispatch(
                    'work_order.reminder_24h',
                    $workOrder,
                    null,
                    ['dedupe_context' => 'reminder-24h:' . $workOrder->id . ':' . $date . ':' . $time],
                );
            });
    }
}
