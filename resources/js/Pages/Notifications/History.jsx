import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

const formatDate = (value) => value ? new Date(value).toLocaleString('ro-RO') : '—';
const statusLabels = { pending: 'În așteptare', queued: 'În coadă', sent: 'Trimisă', delivered: 'Livrată', read: 'Citită', failed: 'Eșuată', skipped: 'Omisă', cancelled: 'Anulată' };

export default function History({ deliveries, filters = {}, eventKeys = [] }) {
    const rows = deliveries?.data ?? [];

    const updateFilter = (key, value) => {
        router.get(route('notifications.history'), { ...filters, [key]: value || undefined }, { preserveState: true, replace: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Istoric notificări" />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Istoric notificări</h1>
                    <p className="mt-1 text-sm text-gray-500">Audit al livrărilor interne și al canalelor care vor fi activate ulterior.</p>
                </div>

                <div className="mb-5 grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:grid-cols-3">
                    <label className="text-sm font-semibold text-gray-700">Eveniment
                        <select value={filters.event_key ?? ''} onChange={(event) => updateFilter('event_key', event.target.value)} className="mt-1 w-full rounded-lg border-gray-300 text-sm">
                            <option value="">Toate evenimentele</option>
                            {eventKeys.map((eventKey) => <option key={eventKey} value={eventKey}>{eventKey}</option>)}
                        </select>
                    </label>
                    <label className="text-sm font-semibold text-gray-700">Canal
                        <select value={filters.channel ?? ''} onChange={(event) => updateFilter('channel', event.target.value)} className="mt-1 w-full rounded-lg border-gray-300 text-sm">
                            <option value="">Toate canalele</option>
                            <option value="app">În aplicație</option>
                            <option value="email">E-mail</option>
                            <option value="sms">SMS</option>
                            <option value="whatsapp">WhatsApp</option>
                        </select>
                    </label>
                    <label className="text-sm font-semibold text-gray-700">Status
                        <select value={filters.status ?? ''} onChange={(event) => updateFilter('status', event.target.value)} className="mt-1 w-full rounded-lg border-gray-300 text-sm">
                            <option value="">Toate statusurile</option>
                            {Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                        </select>
                    </label>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-4 py-3">Moment</th>
                                <th className="px-4 py-3">Eveniment</th>
                                <th className="px-4 py-3">Destinatar</th>
                                <th className="px-4 py-3">Canal</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Mesaj</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rows.map((delivery) => (
                                <tr key={delivery.id} className="align-top hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-4 py-4 text-gray-600">{formatDate(delivery.created_at)}</td>
                                    <td className="px-4 py-4 font-mono text-xs text-blue-700">{delivery.event?.event_key ?? '—'}</td>
                                    <td className="px-4 py-4 text-gray-700">{delivery.recipient?.name ?? delivery.recipient_address ?? '—'}</td>
                                    <td className="px-4 py-4 font-semibold text-gray-700">{delivery.channel}</td>
                                    <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${delivery.status === 'failed' ? 'bg-red-100 text-red-700' : delivery.status === 'read' ? 'bg-gray-100 text-gray-700' : 'bg-emerald-100 text-emerald-700'}`}>{statusLabels[delivery.status] ?? delivery.status}</span></td>
                                    <td className="max-w-md px-4 py-4"><p className="font-semibold text-gray-900">{delivery.title}</p><p className="mt-1 text-xs leading-5 text-gray-600">{delivery.body}</p>{delivery.error_message && <p className="mt-2 text-xs font-semibold text-red-700">Eroare: {delivery.error_message}</p>}</td>
                                </tr>
                            ))}
                            {rows.length === 0 && <tr><td colSpan="6" className="px-6 py-14 text-center text-gray-500">Nu există livrări pentru filtrele selectate.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
