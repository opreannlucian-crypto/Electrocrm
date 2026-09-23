<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DomainNotificationEvent
{
    use Dispatchable, SerializesModels;

    /**
     * @param array<string, mixed> $payload
     */
    public function __construct(
        public readonly string $eventKey,
        public readonly Model $subject,
        public readonly ?User $actor = null,
        public readonly array $payload = [],
    ) {
    }
}
