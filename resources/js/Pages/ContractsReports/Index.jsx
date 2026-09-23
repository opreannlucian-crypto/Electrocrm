import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

const formatDate = (value) => value ? new Date(`${value}T00:00:00`).toLocaleDateString('ro-RO') : '—';
const money = (value, currency) => `${Number(value || 0).toFixed(2)} ${currency || 'RON'}`;

export default function Index({ contracts = [], clients = [], types = [], filters = {} }) {
  const [form, setForm] = useState({ date_from: filters.date_from ?? '', date_to: filters.date_to ?? '', client_id: filters.client_id ?? '', contract_type: filters.contract_type ?? '' });
  const filter = (event) => { event.preventDefault(); router.get(route('financial-reports.contracts.index'), form, { preserveState: true, replace: true }); };
  const reset = () => { const empty = { date_from: '', date_to: '', client_id: '', contract_type: '' }; setForm(empty); router.get(route('financial-reports.contracts.index'), empty, { preserveState: true, replace: true }); };

  return <AuthenticatedLayout>
    <Head title="Raport contracte" />
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6"><h1 className="text-3xl font-bold text-slate-900">Raport contracte</h1><p className="mt-1 text-slate-500">Filtrează contractele după perioadă, client și tipul contractului.</p></div>
      <form onSubmit={filter} className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2 xl:grid-cols-5">
        <label className="text-sm font-semibold text-slate-700">De la<input type="date" value={form.date_from} onChange={(event) => setForm({ ...form, date_from: event.target.value })} className="mt-1 w-full rounded-lg border-slate-300" /></label>
        <label className="text-sm font-semibold text-slate-700">Până la<input type="date" value={form.date_to} onChange={(event) => setForm({ ...form, date_to: event.target.value })} className="mt-1 w-full rounded-lg border-slate-300" /></label>
        <label className="text-sm font-semibold text-slate-700">Client<select value={form.client_id} onChange={(event) => setForm({ ...form, client_id: event.target.value })} className="mt-1 w-full rounded-lg border-slate-300"><option value="">Toți clienții</option>{clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}</select></label>
        <label className="text-sm font-semibold text-slate-700">Tip contract<select value={form.contract_type} onChange={(event) => setForm({ ...form, contract_type: event.target.value })} className="mt-1 w-full rounded-lg border-slate-300"><option value="">Toate tipurile</option>{types.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
        <div className="flex items-end gap-2"><button className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white">Filtrează</button><button type="button" onClick={reset} className="rounded-lg border px-4 py-2 font-semibold">Resetează</button></div>
      </form>
      <p className="mb-3 text-sm font-semibold text-slate-600">{contracts.length} {contracts.length === 1 ? 'contract găsit' : 'contracte găsite'}</p>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><table className="min-w-full text-sm"><thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4">Data</th><th className="px-5 py-4">Număr</th><th className="px-5 py-4">Tip</th><th className="px-5 py-4">Titlu</th><th className="px-5 py-4">Client</th><th className="px-5 py-4">Valoare</th><th className="px-5 py-4">Status</th><th className="px-5 py-4"></th></tr></thead><tbody className="divide-y divide-slate-100">{contracts.map((contract) => <tr key={contract.id}><td className="px-5 py-4">{formatDate(contract.date)}</td><td className="px-5 py-4 font-semibold">{contract.number || '—'}</td><td className="px-5 py-4">{contract.type || '—'}</td><td className="px-5 py-4">{contract.title || '—'}</td><td className="px-5 py-4">{contract.client_name || '—'}</td><td className="px-5 py-4">{money(contract.value, contract.currency)}</td><td className="px-5 py-4">{contract.status || '—'}</td><td className="px-5 py-4 text-right"><Link href={route('contracts.show', contract.id)} className="font-semibold text-blue-700">Deschide</Link></td></tr>)}{contracts.length === 0 && <tr><td colSpan="8" className="px-5 py-12 text-center text-slate-500">Nu există contracte pentru filtrele selectate.</td></tr>}</tbody></table></div>
    </div>
  </AuthenticatedLayout>;
}
