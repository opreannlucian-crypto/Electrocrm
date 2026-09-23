import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { formatDate } from '@/lib/dateFormat';

export default function Index({ receptions = [], suppliers = [], warehouses = [] }) {
    const { flash = {} } = usePage().props;
    const deletion = useForm({});
    const [filters, setFilters] = useState({ supplier: '', warehouse: '', series: '', product: '', number: '', dateFrom: '', dateTo: '' });
    const [selectedIds, setSelectedIds] = useState([]);
    const setFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
    const filtered = useMemo(() => receptions.filter((reception) => {
        const content = JSON.stringify(reception).toLowerCase();
        const date = String(reception.received_at || '').slice(0, 10);
        return (!filters.supplier || String(reception.supplier_id) === filters.supplier)
            && (!filters.warehouse || String(reception.warehouse_id) === filters.warehouse)
            && (!filters.series || String(reception.reception_series || '').toLowerCase().includes(filters.series.toLowerCase()))
            && (!filters.product || content.includes(filters.product.toLowerCase()))
            && (!filters.number || String(reception.number || '').toLowerCase().includes(filters.number.toLowerCase()))
            && (!filters.dateFrom || date >= filters.dateFrom) && (!filters.dateTo || date <= filters.dateTo);
    }), [receptions, filters]);
    const visibleIds = filtered.map((reception) => reception.id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
    const toggleOne = (id) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    const toggleAll = () => setSelectedIds((current) => allVisibleSelected ? current.filter((id) => !visibleIds.includes(id)) : [...new Set([...current, ...visibleIds])]);
    const openPdf = (routeName, ids) => {
        if (!ids.length) return;
        const query = ids.map((id) => `ids[]=${encodeURIComponent(id)}`).join('&');
        window.open(`${route(routeName)}?${query}`, '_blank', 'noopener,noreferrer');
    };
    const exportExcel = () => {
        const rows = [['NIR', 'Data', 'Furnizor', 'Gestiune', 'Total'], ...filtered.map((r) => [r.number, r.received_at, r.supplier?.name || '', r.warehouse?.name || '', Number(r.total || 0).toFixed(2)])];
        const csv = '\ufeff' + rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(';')).join('\n');
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
        link.download = 'registru-receptii.csv';
        link.click();
    };

    return <AuthenticatedLayout><Head title="Recepții furnizori" /><div className="mx-auto max-w-7xl px-4 py-8">
        {flash.success && <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 font-semibold text-emerald-800">{flash.success}</div>}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-bold">Recepții furnizori</h1><p className="text-sm text-slate-500">Registrul notelor de recepție și intrare în gestiune.</p></div><div className="flex flex-wrap gap-2"><button onClick={exportExcel} className="rounded border border-emerald-600 px-4 py-2 text-emerald-700">Export Excel</button><button onClick={() => openPdf('receptions.report-pdf', visibleIds)} disabled={!visibleIds.length} className="rounded border border-red-600 px-4 py-2 text-red-700 disabled:opacity-40">Export PDF raport</button><Link href={route('receptions.create')} className="rounded bg-blue-600 px-4 py-2 font-bold text-white">+ Recepție nouă</Link></div></div>
        <section className="mb-6 rounded-2xl border bg-white p-5"><div className="mb-3 flex items-center justify-between"><h2 className="font-bold">Filtrare recepții</h2><button onClick={() => setFilters({ supplier: '', warehouse: '', series: '', product: '', number: '', dateFrom: '', dateTo: '' })} className="text-sm text-blue-700">Resetează filtrele</button></div><div className="grid gap-3 md:grid-cols-4"><select value={filters.supplier} onChange={(event) => setFilter('supplier', event.target.value)} className="rounded border"><option value="">Toți furnizorii</option>{suppliers.map((supplier) => <option key={supplier.id} value={supplier.id}>{supplier.name}</option>)}</select><select value={filters.warehouse} onChange={(event) => setFilter('warehouse', event.target.value)} className="rounded border"><option value="">Toate gestiunile</option>{warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}</select><input placeholder="Serie recepție" value={filters.series} onChange={(event) => setFilter('series', event.target.value)} className="rounded border" /><input placeholder="Număr NIR" value={filters.number} onChange={(event) => setFilter('number', event.target.value)} className="rounded border" /><input placeholder="Produs" value={filters.product} onChange={(event) => setFilter('product', event.target.value)} className="rounded border" /><label className="text-sm">De la<input type="date" value={filters.dateFrom} onChange={(event) => setFilter('dateFrom', event.target.value)} className="mt-1 block w-full rounded border" /></label><label className="text-sm">Până la<input type="date" value={filters.dateTo} onChange={(event) => setFilter('dateTo', event.target.value)} className="mt-1 block w-full rounded border" /></label></div></section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><span className="text-sm text-slate-500">{filtered.length} recepții afișate din {receptions.length}</span><button onClick={() => openPdf('receptions.print-selected', selectedIds)} disabled={!selectedIds.length} className="rounded bg-slate-800 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">Printează selecția ({selectedIds.length})</button></div>
        <div className="overflow-x-auto rounded-2xl border bg-white"><table className="min-w-full text-sm"><thead className="bg-slate-50"><tr><th className="p-3"><input type="checkbox" checked={allVisibleSelected} onChange={toggleAll} aria-label="Selectează toate recepțiile filtrate" /></th><th className="p-3 text-left">NIR</th><th className="p-3">Data</th><th className="p-3 text-left">Furnizor</th><th className="p-3 text-left">Gestiune</th><th className="p-3 text-right">Total</th><th className="p-3 text-right">Acțiuni</th></tr></thead><tbody>{filtered.length ? filtered.map((reception) => <tr key={reception.id} className="border-t"><td className="p-3 text-center"><input type="checkbox" checked={selectedIds.includes(reception.id)} onChange={() => toggleOne(reception.id)} aria-label={`Selectează ${reception.number}`} /></td><td className="p-3 font-semibold">{reception.number}</td><td className="p-3">{formatDate(reception.received_at)}</td><td className="p-3">{reception.supplier?.name || '—'}</td><td className="p-3">{reception.warehouse?.name || '—'}</td><td className="p-3 text-right">{Number(reception.total || 0).toFixed(2)} {reception.currency || 'RON'}</td><td className="p-3 text-right"><div className="flex justify-end gap-2"><Link href={route('receptions.show', reception.id)} className="rounded border px-3 py-1">Vizualizare</Link><Link href={route('receptions.edit', reception.id)} className="rounded bg-slate-800 px-3 py-1 text-white">Editare</Link><button onClick={() => { if (confirm('Sigur vrei să ștergi recepția și intrarea aferentă în stoc?')) deletion.delete(route('receptions.destroy', reception.id)); }} disabled={deletion.processing} className="rounded bg-red-600 px-3 py-1 text-white">Ștergere</button></div></td></tr>) : <tr><td colSpan="7" className="p-10 text-center text-slate-500">Nu există recepții care corespund filtrelor.</td></tr>}</tbody></table></div>
    </div></AuthenticatedLayout>;
}
