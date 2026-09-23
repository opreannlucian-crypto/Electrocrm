<?php

namespace App\Http\Controllers;

use App\Models\NotificationDelivery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Notifications/Index', [
            'notifications' => $this->personalQuery($request)
                ->latest('created_at')
                ->paginate(20)
                ->withQueryString(),
        ]);
    }

    public function unread(Request $request): JsonResponse
    {
        $query = $this->personalQuery($request);

        return response()->json([
            'count' => (clone $query)->whereNull('read_at')->count(),
            'notifications' => $query
                ->whereNull('read_at')
                ->latest('created_at')
                ->limit(8)
                ->get(['id', 'title', 'body', 'action_url', 'created_at']),
        ]);
    }

    public function markRead(Request $request, NotificationDelivery $notification): RedirectResponse
    {
        $this->ensureOwnership($request, $notification);
        $notification->markAsRead();

        return back();
    }

    public function markAllRead(Request $request): RedirectResponse
    {
        $this->personalQuery($request)
            ->whereNull('read_at')
            ->update([
                'status' => NotificationDelivery::STATUS_READ,
                'read_at' => now(),
                'updated_at' => now(),
            ]);

        return back();
    }

    private function personalQuery(Request $request)
    {
        $user = $request->user();

        return NotificationDelivery::query()
            ->with('event')
            ->where('channel', NotificationDelivery::CHANNEL_APP)
            ->where('recipient_type', $user->getMorphClass())
            ->where('recipient_id', $user->getKey());
    }

    private function ensureOwnership(Request $request, NotificationDelivery $notification): void
    {
        $user = $request->user();

        abort_unless(
            $notification->channel === NotificationDelivery::CHANNEL_APP
            && $notification->recipient_type === $user->getMorphClass()
            && (int) $notification->recipient_id === (int) $user->getKey(),
            403,
        );
    }
}
