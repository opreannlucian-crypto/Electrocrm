<?php

namespace App\Listeners;

use App\Events\DomainNotificationEvent;
use App\Services\Notifications\NotificationOrchestrator;

class CreateNotificationDeliveries
{
    public function __construct(
        private readonly NotificationOrchestrator $orchestrator,
    ) {
    }

    public function handle(DomainNotificationEvent $event): void
    {
        $this->orchestrator->handle(
            eventKey: $event->eventKey,
            subject: $event->subject,
            actor: $event->actor,
            payload: $event->payload,
        );
    }
}
