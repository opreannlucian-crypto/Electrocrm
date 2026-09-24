<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClientRevision extends Model
{
    public const TYPE_BURGLARY = 'efractie';
    public const TYPE_FIRE = 'incendiu';

    public const PERIOD_QUARTERLY = 'trimestriala';
    public const PERIOD_SEMIANNUAL = 'semestriala';
    public const PERIOD_ANNUAL = 'anuala';
    public const PERIOD_ON_REQUEST = 'la_cerere';

    protected $fillable = [
        'client_id', 'type', 'period', 'last_revision_date',
        'next_revision_date', 'last_work_order_id', 'reminder_sent_for',
    ];

    protected $casts = [
        'last_revision_date' => 'date',
        'next_revision_date' => 'date',
        'reminder_sent_for' => 'date',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function lastWorkOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class, 'last_work_order_id');
    }

    public static function isRevisionWorkType(?string $type): bool
    {
        return in_array($type, ['revizie_efractie', 'revizie_incendiu'], true);
    }

    public static function typeForWorkOrder(WorkOrder $workOrder): ?string
    {
        return match ($workOrder->type) {
            'revizie_efractie' => self::TYPE_BURGLARY,
            'revizie_incendiu' => self::TYPE_FIRE,
            default => null,
        };
    }

    public static function nextDateFor(string $period, Carbon|string $lastDate): ?string
    {
        $months = match ($period) {
            self::PERIOD_QUARTERLY => 3,
            self::PERIOD_SEMIANNUAL => 6,
            self::PERIOD_ANNUAL => 12,
            default => null,
        };

        return $months ? Carbon::parse($lastDate)->addMonthsNoOverflow($months)->toDateString() : null;
    }

    public static function recordCompletion(WorkOrder $workOrder): ?self
    {
        $type = self::typeForWorkOrder($workOrder);

        if (!$type || !$workOrder->client_id || !$workOrder->completed_at) {
            return null;
        }

        $revision = self::firstOrNew([
            'client_id' => $workOrder->client_id,
            'type' => $type,
        ]);
        $period = $workOrder->revision_period ?: ($revision->period ?: self::PERIOD_ANNUAL);
        $lastDate = $workOrder->completed_at->toDateString();

        $revision->fill([
            'period' => $period,
            'last_revision_date' => $lastDate,
            'next_revision_date' => self::nextDateFor($period, $lastDate),
            'last_work_order_id' => $workOrder->id,
            'reminder_sent_for' => null,
        ]);
        $revision->save();

        return $revision;
    }
}
