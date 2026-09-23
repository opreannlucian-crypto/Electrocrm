<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationRule extends Model
{
    public const AUDIENCE_INTERNAL_ADMIN = 'internal_admin';
    public const AUDIENCE_INTERNAL_TECHNICIAN = 'internal_technician';
    public const AUDIENCE_CLIENT = 'client';

    protected $fillable = [
        'event_key',
        'audience',
        'channel',
        'enabled',
        'timing',
        'conditions',
        'template_key',
    ];

    protected function casts(): array
    {
        return [
            'enabled' => 'boolean',
            'conditions' => 'array',
        ];
    }

    public static function enabledFor(string $eventKey, string $audience, string $channel): bool
    {
        return (bool) static::query()
            ->where('event_key', $eventKey)
            ->where('audience', $audience)
            ->where('channel', $channel)
            ->value('enabled');
    }
}
