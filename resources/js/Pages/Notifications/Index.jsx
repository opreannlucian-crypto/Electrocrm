import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

const formatDate = (value) => value ? new Date(value).toLocaleString('ro-RO') : '—';

export default function Index({ notifications }) {
    const items = notifications?.data ?? [];

    const openNotification = (notification) => {
        const visit = () => {
            if (notification.action_url) {
                window.location.assign(notification.action_url);
            }
        };

        if (notification.read_at) {
            visit();
            return;
        }

        router.patch(route('notifications.read', notification.id), {}, {
            preserveScroll: true,
            onSuccess: visit,
        });
    };

    const markAllRead = () => {
        router.patch(route('notifications.read-all'), {}, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Notificări" />
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Notificări</h1>
                        <p className="mt-1 text-sm text-gray-500">Actualizări despre lucrările și documentele relevante pentru tine.</p>
                    </div>
                    <button type="button" onClick={markAllRead} className="rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-50">
                        Marchează toate citite
                    </button>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    {items.length === 0 ? (
                        <div className="px-6 py-16 text-center">
                            <p className="text-lg font-semibold text-gray-700">Nu există notificări.</p>
                            <p className="mt-1 text-sm text-gray-500">Vei vedea aici actualizările despre lucrările tale.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {items.map((notification) => (
                                <button
                                    type="button"
                                    key={notification.id}
                                    onClick={() => openNotification(notification)}
                                    className={`block w-full px-5 py-4 text-left transition hover:bg-blue-50 ${notification.read_at ? 'bg-white' : 'bg-blue-50/50'}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${notification.read_at ? 'bg-gray-300' : 'bg-blue-600'}`} />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                                <p className="font-semibold text-gray-900">{notification.title}</p>
                                                <p className="text-xs text-gray-500">{formatDate(notification.created_at)}</p>
                                            </div>
                                            <p className="mt-1 text-sm leading-6 text-gray-600">{notification.body}</p>
                                            {notification.action_url && <p className="mt-2 text-xs font-bold text-blue-700">Deschide elementul asociat →</p>}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {notifications?.links?.length > 3 && (
                    <div className="mt-6 flex flex-wrap gap-2">
                        {notifications.links.map((link, index) => (
                            <button
                                type="button"
                                key={`${link.label}-${index}`}
                                disabled={!link.url}
                                onClick={() => link.url && router.visit(link.url)}
                                className={`rounded-lg px-3 py-2 text-sm font-semibold ${link.active ? 'bg-blue-600 text-white' : 'border border-gray-200 bg-white text-gray-700'} disabled:cursor-not-allowed disabled:opacity-40`}
                            >
                                {link.label.replace('&laquo;', '«').replace('&raquo;', '»')}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
