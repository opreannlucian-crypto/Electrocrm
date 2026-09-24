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
        'next_revision_date', 'last_work_order_id', 'scheduled_work_order_id', 'reminder_sent_for',
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

    public function scheduledWorkOrder(): BelongsTo
    {
        return $this->belongsTo(WorkOrder::class, 'scheduled_work_order_id');
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
        $revision->syncScheduledWorkOrder();

        return $revision;
    }

    public function syncScheduledWorkOrder(): ?WorkOrder
    {
        $scheduledWorkOrder = $this->scheduledWorkOrder;

        if (!$this->next_revision_date) {
            if ($scheduledWorkOrder && in_array($scheduledWorkOrder->status, ['noua', 'programata'], true)) {
                $scheduledWorkOrder->update(['status' => 'anulata']);
            }
            $this->update(['scheduled_work_order_id' => null]);

            return null;
        }

        $this->loadMissing('client');
        $workOrderData = [
            'client_id' => $this->client_id,
            'type' => $this->type === self::TYPE_FIRE ? 'revizie_incendiu' : 'revizie_efractie',
            'work_type' => $this->type === self::TYPE_FIRE ? 'Revizie incendiu' : 'Revizie efracție',
            'revision_period' => $this->period,
            'address' => $this->client?->address,
            'contact_person' => $this->client?->contact_person,
            'phone' => $this->client?->phone,
            'scheduled_date' => $this->next_revision_date,
            'status' => 'programata',
            'priority' => 'normal',
            'description' => 'Revizie ' . ($this->type === self::TYPE_FIRE ? 'incendiu' : 'efracție') . ' · ' . (match ($this->period) {
                self::PERIOD_QUARTERLY => 'trimestrială',
                self::PERIOD_SEMIANNUAL => 'semestrială',
                self::PERIOD_ANNUAL => 'anuală',
                default => 'la cerere',
            }),
            'notes' => 'Creată automat din registrul de revizii.',
        ];

        if ($scheduledWorkOrder && in_array($scheduledWorkOrder->status, ['noua', 'programata'], true)) {
            $scheduledWorkOrder->update($workOrderData);

            return $scheduledWorkOrder;
        }

        $workOrder = WorkOrder::create($workOrderData + [
            'number' => 'WO-REV-' . $this->id . '-' . $this->next_revision_date->format('Ymd'),
        ]);
        $this->update(['scheduled_work_order_id' => $workOrder->id]);

        return $workOrder;
    }
}
