import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const formatMoney = (value) => new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
    minimumFractionDigits: 2,
}).format(Number(value || 0));

const formatDate = (value) => value
    ? new Intl.DateTimeFormat('ro-RO').format(new Date(`${value}T00:00:00`))
    : '—';

const statusClass = (status) => ({
    draft: 'bg-slate-100 text-slate-700',
    issued: 'bg-blue-50 text-blue-700',
    partially_paid: 'bg-amber-50 text-amber-700',
    paid: 'bg-emerald-50 text-emerald-700',
    cancelled: 'bg-red-50 text-red-700',
}[status] || 'bg-slate-100 text-slate-700');

export default function InvoiceFinancialReport({ filters, summary, monthly, clients, rows, overdue, statusOptions }) {
    const [form, setForm] = useState({
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
        client_id: filters.client_id || '',
        status: filters.status || '',
    });

    const cleanFilters = useMemo(() => Object.fromEntries(
        Object.entries(form).filter(([, value]) => value !== '' && value !== null),
    ), [form]);

    const applyFilters = (event) => {
        event.preventDefault();
        router.get(route('financial-reports.invoices.index'), cleanFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const resetFilters = () => {
        router.get(route('financial-reports.invoices.index'));
    };

    const metrics = [
        { label: 'Facturat', value: summary.invoiced_total, tone: 'border-blue-200 bg-blue-50 text-blue-900', icon: '🧾' },
        { label: 'Încasat', value: summary.collected_total, tone: 'border-emerald-200 bg-emerald-50 text-emerald-900', icon: '✓' },
        { label: 'Sold de încasat', value: summary.outstanding_total, tone: 'border-amber-200 bg-amber-50 text-amber-900', icon: '◷' },
        { label: 'Restant', value: summary.overdue_total, tone: 'border-red-200 bg-red-50 text-red-900', icon: '!' },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Raport facturi" />

            <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Financiar</p>
                        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Raport facturi</h1>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                            Urmărește facturarea, încasările, soldurile și scadențele pe perioada selectată. Facturile ciornă și anulate sunt afișate în listă, dar nu intră în indicatorii financiari.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <a href={route('financial-reports.invoices.excel', cleanFilters)} className="inline-flex items-center justify-center rounded-xl border border-emerald-700 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50">
                            Export Excel
                        </a>
                        <a href={route('financial-reports.invoices.pdf', cleanFilters)} className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700">
                            Export PDF
                        </a>
                    </div>
                </div>

                <form onSubmit={applyFilters} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                        <label className="block text-sm font-semibold text-slate-700">
                            Data de la
                            <input type="date" value={form.date_from} onChange={(event) => setForm({ ...form, date_from: event.target.value })} className="mt-1.5 block w-full rounded-xl border-slate-300 text-sm shadow-sm focus:border-emerald-600 focus:ring-emerald-600" />
                        </label>
                        <label className="block text-sm font-semibold text-slate-700">
                            Data până la
                            <input type="date" value={form.date_to} onChange={(event) => setForm({ ...form, date_to: event.target.value })} className="mt-1.5 block w-full rounded-xl border-slate-300 text-sm shadow-sm focus:border-emerald-600 focus:ring-emerald-600" />
                        </label>
                        <label className="block text-sm font-semibold text-slate-700">
                            Client
                            <select value={form.client_id} onChange={(event) => setForm({ ...form, client_id: event.target.value })} className="mt-1.5 block w-full rounded-xl border-slate-300 text-sm shadow-sm focus:border-emerald-600 focus:ring-emerald-600">
                                <option value="">Toți clienții</option>
                                {clients.map((client) => <option key={client.id} value={client.id}>{client.name}{client.cui ? ` · ${client.cui}` : ''}</option>)}
                            </select>
                        </label>
                        <label className="block text-sm font-semibold text-slate-700">
                            Status factură
                            <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="mt-1.5 block w-full rounded-xl border-slate-300 text-sm shadow-sm focus:border-emerald-600 focus:ring-emerald-600">
                                <option value="">Toate statusurile</option>
                                {Object.entries(statusOptions).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                            </select>
                        </label>
                        <div className="flex items-end gap-2">
                            <button type="submit" className="inline-flex flex-1 items-center justify-center rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800">Aplică filtre</button>
                            <button type="button" onClick={resetFilters} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Reset</button>
                        </div>
                    </div>
                </form>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {metrics.map((metric) => (
                        <div key={metric.label} className={`rounded-2xl border p-5 shadow-sm ${metric.tone}`}>
                            <div className="flex items-start justify-between gap-3">
                                <p className="text-sm font-semibold opacity-80">{metric.label}</p>
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/70 text-base font-bold">{metric.icon}</span>
                            </div>
                            <p className="mt-3 text-2xl font-bold tracking-tight">{formatMoney(metric.value)}</p>
                        </div>
                    ))}
                </div>

                <div className="grid gap-6 xl:grid-cols-5">
                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-3">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Evoluție lunară</h2>
                                <p className="mt-1 text-sm text-slate-500">Facturat, încasat și sold pentru facturile emise.</p>
                            </div>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">TVA: {formatMoney(summary.vat_total)}</span>
                        </div>
                        <div className="mt-5 overflow-x-auto">
                            <table className="w-full min-w-[580px] text-sm">
                                <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                                    <tr><th className="pb-3 font-semibold">Lună</th><th className="pb-3 text-right font-semibold">Facturat</th><th className="pb-3 text-right font-semibold">Încasat</th><th className="pb-3 text-right font-semibold">Sold</th></tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {monthly.length > 0 ? monthly.map((item) => (
                                        <tr key={item.month}>
                                            <td className="py-3 font-semibold capitalize text-slate-800">{item.label}</td>
                                            <td className="py-3 text-right text-slate-700">{formatMoney(item.invoiced_total)}</td>
                                            <td className="py-3 text-right font-semibold text-emerald-700">{formatMoney(item.collected_total)}</td>
                                            <td className="py-3 text-right font-semibold text-amber-700">{formatMoney(item.outstanding_total)}</td>
                                        </tr>
                                    )) : <tr><td colSpan="4" className="py-8 text-center text-slate-500">Nu există facturi emise în perioada selectată.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">Restanțe</h2>
                                <p className="mt-1 text-sm text-slate-500">{summary.overdue_count} facturi ajunse la scadență fără plată integrală.</p>
                            </div>
                            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">{formatMoney(summary.overdue_total)}</span>
                        </div>
                        <div className="mt-4 space-y-3">
                            {overdue.length > 0 ? overdue.map((invoice) => (
                                <Link key={invoice.id} href={route('invoices.show', invoice.id)} className="block rounded-xl border border-red-100 bg-red-50/40 p-3 transition hover:bg-red-50">
                                    <div className="flex justify-between gap-3"><span className="font-semibold text-slate-900">{invoice.number}</span><span className="font-bold text-red-700">{formatMoney(invoice.balance)}</span></div>
                                    <p className="mt-1 truncate text-xs text-slate-600">{invoice.client_name}</p>
                                    <p className="mt-1 text-xs font-medium text-red-700">Scadență: {formatDate(invoice.due_date)}</p>
                                </Link>
                            )) : <div className="rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800">Nu există facturi restante în această selecție.</div>}
                        </div>
                    </section>
                </div>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col justify-between gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center">
                        <div><h2 className="text-lg font-bold text-slate-900">Facturi</h2><p className="mt-1 text-sm text-slate-500">{rows.length} înregistrări în perioada selectată.</p></div>
                        <span className="text-sm font-semibold text-slate-600">Scadențe în următoarele 7 zile: {formatMoney(summary.due_soon_total)}</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1020px] text-sm">
                            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                                <tr><th className="px-5 py-3 font-semibold">Factura</th><th className="px-5 py-3 font-semibold">Client</th><th className="px-5 py-3 font-semibold">Emisă / scadență</th><th className="px-5 py-3 font-semibold">Status</th><th className="px-5 py-3 text-right font-semibold">Total</th><th className="px-5 py-3 text-right font-semibold">Încasat</th><th className="px-5 py-3 text-right font-semibold">Sold</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.length > 0 ? rows.map((invoice) => (
                                    <tr key={invoice.id} className="transition hover:bg-slate-50">
                                        <td className="px-5 py-4"><Link href={route('invoices.show', invoice.id)} className="font-bold text-emerald-700 hover:text-emerald-900">{invoice.number}</Link>{invoice.is_overdue && <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">Restantă</span>}</td>
                                        <td className="px-5 py-4"><p className="font-semibold text-slate-800">{invoice.client_name}</p>{invoice.client_cui && <p className="mt-0.5 text-xs text-slate-500">{invoice.client_cui}</p>}</td>
                                        <td className="px-5 py-4 text-slate-600"><p>{formatDate(invoice.issue_date)}</p><p className={`mt-0.5 text-xs ${invoice.is_overdue ? 'font-semibold text-red-700' : 'text-slate-500'}`}>Scad.: {formatDate(invoice.due_date)}</p></td>
                                        <td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusClass(invoice.status)}`}>{invoice.status_label}</span></td>
                                        <td className="px-5 py-4 text-right font-semibold text-slate-900">{formatMoney(invoice.total)}</td>
                                        <td className="px-5 py-4 text-right font-semibold text-emerald-700">{formatMoney(invoice.paid_amount)}</td>
                                        <td className="px-5 py-4 text-right font-bold text-amber-700">{formatMoney(invoice.balance)}</td>
                                    </tr>
                                )) : <tr><td colSpan="7" className="px-5 py-12 text-center text-slate-500">Nu există facturi pentru filtrele selectate.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
