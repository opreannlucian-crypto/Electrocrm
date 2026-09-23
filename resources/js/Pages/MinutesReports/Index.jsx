import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

const formatDate = (value) => value ? new Date(`${value}T00:00:00`).toLocaleDateString('ro-RO') : '—';

export default function Index({ reports = [], clients = [], types = [], filters = {} }) {
  const [form, setForm] = useState({ date_from: filters.date_from ?? '', date_to: filters.date_to ?? '', client_name: filters.client_name ?? '', report_type: filters.report_type ?? '' });
  const filter = (event) => { event.preventDefault(); router.get(route('financial-reports.minutes.index'), form, { preserveState: true, replace: true }); };
  const reset = () => { const empty = { date_from: '', date_to: '', client_name: '', report_type: '' }; setForm(empty); router.get(route('financial-reports.minutes.index'), empty, { preserveState: true, replace: true }); };

  return <AuthenticatedLayout>
    <Head title="Raport procese-verbale" />
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6"><h1 className="text-3xl font-bold text-slate-900">Raport procese-verbale</h1><p className="mt-1 text-slate-500">Filtrează documentele după dată, client și tipul procesului-verbal.</p></div>
      <form onSubmit={filter} className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2 xl:grid-cols-5">
        <label className="text-sm font-semibold text-slate-700">De la<input type="date" value={form.date_from} onChange={(event) => setForm({ ...form, date_from: event.target.value })} className="mt-1 w-full rounded-lg border-slate-300" /></label>
        <label className="text-sm font-semibold text-slate-700">Până la<input type="date" value={form.date_to} onChange={(event) => setForm({ ...form, date_to: event.target.value })} className="mt-1 w-full rounded-lg border-slate-300" /></label>
        <label className="text-sm font-semibold text-slate-700">Client<select value={form.client_name} onChange={(event) => setForm({ ...form, client_name: event.target.value })} className="mt-1 w-full rounded-lg border-slate-300"><option value="">Toți clienții</option>{clients.map((client) => <option key={client} value={client}>{client}</option>)}</select></label>
        <label className="text-sm font-semibold text-slate-700">Tip proces-verbal<select value={form.report_type} onChange={(event) => setForm({ ...form, report_type: event.target.value })} className="mt-1 w-full rounded-lg border-slate-300"><option value="">Toate tipurile</option>{types.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
        <div className="flex items-end gap-2"><button className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white">Filtrează</button><button type="button" onClick={reset} className="rounded-lg border px-4 py-2 font-semibold">Resetează</button></div>
      </form>
      <p className="mb-3 text-sm font-semibold text-slate-600">{reports.length} {reports.length === 1 ? 'proces-verbal găsit' : 'procese-verbale găsite'}</p>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><table className="min-w-full text-sm"><thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4">Data</th><th className="px-5 py-4">Număr</th><th className="px-5 py-4">Tip proces-verbal</th><th className="px-5 py-4">Client</th><th className="px-5 py-4">Lucrare</th><th className="px-5 py-4">Locație</th><th className="px-5 py-4"></th></tr></thead><tbody className="divide-y divide-slate-100">{reports.map((report) => <tr key={report.id}><td className="px-5 py-4">{formatDate(report.date)}</td><td className="px-5 py-4 font-semibold">{report.number || '—'}</td><td className="px-5 py-4">{report.report_type}</td><td className="px-5 py-4">{report.client_name || '—'}</td><td className="px-5 py-4">{report.work_order_number || '—'}</td><td className="px-5 py-4">{report.location || '—'}</td><td className="px-5 py-4 text-right"><Link href={route('reports.show', report.id)} className="font-semibold text-blue-700">Deschide</Link></td></tr>)}{reports.length === 0 && <tr><td colSpan="7" className="px-5 py-12 text-center text-slate-500">Nu există procese-verbale pentru filtrele selectate.</td></tr>}</tbody></table></div>
    </div>
  </AuthenticatedLayout>;
}
