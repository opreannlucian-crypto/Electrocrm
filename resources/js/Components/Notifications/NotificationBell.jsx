import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export default function NotificationBell({ compact = false }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [payload, setPayload] = useState({ count: 0, notifications: [] });
    const containerRef = useRef(null);

    const refresh = async () => {
        try {
            const response = await window.axios.get(route('notifications.unread'));
            setPayload(response.data);
        } catch (error) {
            // Nu afișăm o eroare intruzivă pentru un simplu badge de navigație.
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
        const timer = window.setInterval(refresh, 60000);

        const closeOnOutsideClick = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', closeOnOutsideClick);

        return () => {
            window.clearInterval(timer);
            document.removeEventListener('mousedown', closeOnOutsideClick);
        };
    }, []);

    const openNotification = (notification) => {
        router.patch(route('notifications.read', notification.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                refresh();

                if (notification.action_url) {
                    window.location.assign(notification.action_url);
                }
            },
        });
    };

    const markAllRead = () => {
        router.patch(route('notifications.read-all'), {}, {
            preserveScroll: true,
            onSuccess: refresh,
        });
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-label="Notificări"
                className={`relative inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-50 hover:text-blue-700 ${compact ? 'h-10 w-10' : 'h-11 w-11'}`}
            >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.9">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9a6 6 0 10-12 0v.75a8.967 8.967 0 01-2.312 6.022 23.848 23.848 0 005.454 1.31m5.715 0a24.255 24.255 0 01-5.715 0m5.715 0a3 3 0 11-5.715 0" />
                </svg>
                {!loading && payload.count > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                        {payload.count > 99 ? '99+' : payload.count}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute left-0 z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] origin-top-left overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                        <div>
                            <p className="text-sm font-bold text-gray-900">Notificări</p>
                            <p className="text-xs text-gray-500">{payload.count} necitite</p>
                        </div>
                        {payload.count > 0 && (
                            <button type="button" onClick={markAllRead} className="text-xs font-semibold text-blue-700 hover:text-blue-900">
                                Marchează toate citite
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {payload.notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-sm text-gray-500">
                                Nu ai notificări necitite.
                            </div>
                        ) : (
                            payload.notifications.map((notification) => (
                                <button
                                    type="button"
                                    key={notification.id}
                                    onClick={() => openNotification(notification)}
                                    className="block w-full border-b border-gray-100 px-4 py-3 text-left transition hover:bg-blue-50 last:border-b-0"
                                >
                                    <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-600">{notification.body}</p>
                                    <p className="mt-1.5 text-[11px] font-medium text-blue-700">
                                        {new Date(notification.created_at).toLocaleString('ro-RO')}
                                    </p>
                                </button>
                            ))
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => router.visit(route('notifications.index'))}
                        className="w-full border-t border-gray-100 px-4 py-3 text-center text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                    >
                        Vezi toate notificările
                    </button>
                </div>
            )}
        </div>
    );
}
