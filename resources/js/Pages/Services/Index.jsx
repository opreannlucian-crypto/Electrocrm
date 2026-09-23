import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

const emptyService = { name: '', code: '', unit: 'serviciu', sale_price: 0, vat_rate: 21, active: true, notes: '' };

export default function Index({ services = [], filters = {} }) {
  const [search, setSearch] = useState(filters.search ?? '');
  const [editing, setEditing] = useState(null);
  const form = useForm(emptyService);

  const submit = (event) => {
    event.preventDefault();
    if (editing) {
      form.put(route('services.update', editing.id), { onSuccess: () => { setEditing(null); form.reset(); } });
      return;
    }
    form.post(route('services.store'), { onSuccess: () => form.reset() });
  };

  const openEdit = (service) => {
    setEditing(service);
    form.setData({ name: service.name, code: service.code ?? '', unit: service.unit ?? 'serviciu', sale_price: service.sale_price ?? 0, vat_rate: service.vat_rate ?? 21, active: !!service.active, notes: service.notes ?? '' });
  };

  return <AuthenticatedLayout>
    <Head title="Servicii" />
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6"><h1 className="text-3xl font-bold text-slate-900">Servicii</h1><p className="mt-1 text-slate-500">Nomenclator separat, fără gestiune sau stoc. Serviciile scrise liber pe factură/proformă se adaugă automat aici.</p></div>
      <form onSubmit={(event) => { event.preventDefault(); router.get(route('services.index'), { search }, { preserveState: true, replace: true }); }} className="mb-5 flex gap-2"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Caută serviciu sau cod" className="w-full max-w-md rounded-lg border-slate-300" /><button className="rounded-lg border px-4 py-2 font-semibold">Caută</button></form>
      <form onSubmit={submit} className="mb-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2 xl:grid-cols-4">
        <input required value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} placeholder="Denumire serviciu *" className="rounded-lg border-slate-300" />
        <input value={form.data.code} onChange={(event) => form.setData('code', event.target.value)} placeholder="Cod intern" className="rounded-lg border-slate-300" />
        <input required value={form.data.unit} onChange={(event) => form.setData('unit', event.target.value)} placeholder="U.M. (ex. oră, cursă)" className="rounded-lg border-slate-300" />
        <input required type="number" min="0" step="0.01" value={form.data.sale_price} onChange={(event) => form.setData('sale_price', event.target.value)} placeholder="Preț fără TVA" className="rounded-lg border-slate-300" />
        <input required type="number" min="0" max="100" step="0.01" value={form.data.vat_rate} onChange={(event) => form.setData('vat_rate', event.target.value)} placeholder="TVA %" className="rounded-lg border-slate-300" />
        <textarea value={form.data.notes} onChange={(event) => form.setData('notes', event.target.value)} placeholder="Observații" rows="1" className="rounded-lg border-slate-300 xl:col-span-2" />
        <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.data.active} onChange={(event) => form.setData('active', event.target.checked)} /> Activ</label>
        <div className="flex gap-2"><button disabled={form.processing} className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white">{editing ? 'Salvează' : 'Adaugă serviciu'}</button>{editing && <button type="button" onClick={() => { setEditing(null); form.reset(); }} className="rounded-lg border px-4 py-2 font-semibold">Anulează</button>}</div>
      </form>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><table className="min-w-full text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-5 py-4">Serviciu</th><th className="px-5 py-4">Cod</th><th className="px-5 py-4">U.M.</th><th className="px-5 py-4 text-right">Preț fără TVA</th><th className="px-5 py-4 text-right">TVA</th><th className="px-5 py-4"></th></tr></thead><tbody className="divide-y divide-slate-100">{services.map((service) => <tr key={service.id}><td className="px-5 py-4 font-semibold">{service.name}{!service.active && <span className="ml-2 text-xs font-normal text-slate-500">Inactiv</span>}</td><td className="px-5 py-4">{service.code || '—'}</td><td className="px-5 py-4">{service.unit}</td><td className="px-5 py-4 text-right">{Number(service.sale_price || 0).toFixed(2)} RON</td><td className="px-5 py-4 text-right">{Number(service.vat_rate || 0).toFixed(2)}%</td><td className="px-5 py-4 text-right"><button onClick={() => openEdit(service)} className="mr-3 font-semibold text-blue-700">Editează</button><button onClick={() => { if (window.confirm(`Ștergi serviciul „${service.name}”?`)) router.delete(route('services.destroy', service.id)); }} className="font-semibold text-red-700">Șterge</button></td></tr>)}{services.length === 0 && <tr><td colSpan="6" className="px-5 py-10 text-center text-slate-500">Nu există servicii în nomenclator.</td></tr>}</tbody></table></div>
    </div>
  </AuthenticatedLayout>;
}
