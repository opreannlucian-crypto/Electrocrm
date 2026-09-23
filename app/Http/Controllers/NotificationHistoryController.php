<?php

namespace App\Http\Controllers;

use App\Models\NotificationDelivery;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationHistoryController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'event_key' => ['nullable', 'string', 'max:120'],
            'channel' => ['nullable', 'string', 'max:30'],
            'status' => ['nullable', 'string', 'max:30'],
        ]);

        $deliveries = NotificationDelivery::query()
            ->with(['event', 'recipient'])
            ->when($filters['event_key'] ?? null, fn ($query, $eventKey) => $query->whereHas('event', fn ($events) => $events->where('event_key', $eventKey)))
            ->when($filters['channel'] ?? null, fn ($query, $channel) => $query->where('channel', $channel))
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->latest('created_at')
            ->paginate(30)
            ->withQueryString();

        return Inertia::render('Notifications/History', [
            'deliveries' => $deliveries,
            'filters' => $filters,
            'eventKeys' => NotificationDelivery::query()
                ->join('notification_events', 'notification_events.id', '=', 'notification_deliveries.notification_event_id')
                ->distinct()
                ->orderBy('notification_events.event_key')
                ->pluck('notification_events.event_key'),
        ]);
    }
}
