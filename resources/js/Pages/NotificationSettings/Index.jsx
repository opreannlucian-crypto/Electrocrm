import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Index({ rules = [], eventLabels = {}, audienceLabels = {} }) {
    const { data, setData, put, processing } = useForm({
        rules: rules.map((rule) => ({
            id: rule.id,
            event_key: rule.event_key,
            audience: rule.audience,
            enabled: Boolean(rule.enabled),
        })),
    });

    const updateRule = (index, enabled) => {
        const nextRules = [...data.rules];
        nextRules[index] = { ...nextRules[index], enabled };
        setData('rules', nextRules);
    };

    const submit = (event) => {
        event.preventDefault();
        put(route('notification-settings.update'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Setări notificări" />
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Setări notificări</h1>
                    <p className="mt-1 text-sm text-gray-500">Configurează notificările interne afișate în aplicație. Canalele e-mail, SMS și WhatsApp vor fi activate într-o etapă ulterioară.</p>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-5 py-4">
                            <h2 className="font-bold text-gray-900">Reguli active în aplicație</h2>
                            <p className="mt-1 text-xs text-gray-500">O regulă dezactivată nu generează notificări noi; istoricul existent rămâne disponibil.</p>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {data.rules.map((rule, index) => (
                                <label key={`${rule.event_key}-${rule.audience}`} className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 hover:bg-gray-50">
                                    <div>
                                        <p className="font-semibold text-gray-900">{eventLabels[rule.event_key] ?? rule.event_key}</p>
                                        <p className="mt-1 text-xs text-gray-500">Destinatari: {audienceLabels[rule.audience] ?? rule.audience}</p>
                                    </div>
                                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700">
                                        <input type="checkbox" checked={rule.enabled} onChange={(event) => updateRule(index, event.target.checked)} className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                        {rule.enabled ? 'Activă' : 'Dezactivată'}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button disabled={processing} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                            {processing ? 'Se salvează...' : 'Salvează setările'}
                        </button>
                        <a href={route('notifications.history')} className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50">
                            Vezi istoricul
                        </a>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
