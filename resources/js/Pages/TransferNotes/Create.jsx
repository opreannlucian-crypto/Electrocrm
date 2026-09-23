import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const blankItem = () => ({ product_id: '', product_name: '', quantity: 1 });

export default function Create({ warehouses = [], products = [] }) {
    const f = useForm({ from_warehouse_id: '', to_warehouse_id: '', issued_at: new Date().toISOString().slice(0, 10), notes: '', items: [] });
    const [item, setItem] = useState(blankItem());
    const suggestions = useMemo(() => {
        const term = item.product_name.trim().toLocaleLowerCase('ro-RO');
        return term ? products.filter((product) => `${product.name} ${product.code || ''}`.toLocaleLowerCase('ro-RO').includes(term)).slice(0, 8) : [];
    }, [item.product_name, products]);
    const addItem = () => {
        if (!item.product_id) return;
        const existingIndex = f.data.items.findIndex((row) => String(row.product_id) === String(item.product_id));
        const next = existingIndex === -1
            ? [...f.data.items, item]
            : f.data.items.map((row, index) => index === existingIndex ? { ...row, quantity: Number(row.quantity) + Number(item.quantity) } : row);
        f.setData('items', next);
        setItem(blankItem());
    };
    const chooseProduct = (product) => setItem((current) => ({ ...current, product_id: product.id, product_name: product.name }));
    const removeItem = (index) => f.setData('items', f.data.items.filter((_, position) => position !== index));

    return <AuthenticatedLayout><Head title="Notă transfer nouă" />
        <div className="mx-auto max-w-5xl px-4 py-8">
            <div className="mb-6 flex justify-between"><h1 className="text-3xl font-bold">Notă de transfer nouă</h1><Link href={route('transfer-notes.index')} className="rounded border px-4 py-2">Înapoi</Link></div>
            <form onSubmit={(event) => { event.preventDefault(); f.post(route('transfer-notes.store')); }} className="space-y-5">
                <section className="grid gap-3 rounded-2xl border bg-white p-5 md:grid-cols-3"><select required value={f.data.from_warehouse_id} onChange={(event) => f.setData('from_warehouse_id', event.target.value)} className="rounded border"><option value="">Gestiune sursă</option>{warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}</select><select required value={f.data.to_warehouse_id} onChange={(event) => f.setData('to_warehouse_id', event.target.value)} className="rounded border"><option value="">Gestiune destinație</option>{warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}</select><input type="date" value={f.data.issued_at} onChange={(event) => f.setData('issued_at', event.target.value)} className="rounded border" /></section>

                <section className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm"><div className="mb-4"><h2 className="font-bold text-slate-900">Adaugă produs</h2><p className="mt-1 text-sm text-slate-500">Scrie produsul, alege sugestia și apasă „Adaugă produs”.</p></div><div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_150px_auto]"><div className="relative"><input value={item.product_name} onChange={(event) => setItem((current) => ({ ...current, product_name: event.target.value, product_id: '' }))} placeholder="Scrie produsul..." className="w-full rounded border" />{suggestions.length > 0 && <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl">{suggestions.map((product) => <button key={product.id} type="button" onClick={() => chooseProduct(product)} className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm hover:bg-blue-50"><span className="font-semibold text-slate-800">{product.name}</span><span className="shrink-0 text-xs text-slate-500">{product.code || product.unit}</span></button>)}</div>}</div><input type="number" min="0.01" step="0.01" value={item.quantity} onChange={(event) => setItem((current) => ({ ...current, quantity: event.target.value }))} className="rounded border" /><button type="button" onClick={addItem} disabled={!item.product_id || Number(item.quantity) <= 0} className="rounded bg-blue-600 px-5 py-2.5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">＋ Adaugă produs</button></div>{item.product_name && !item.product_id && <p className="mt-2 text-xs text-amber-700">Alege produsul din sugestiile afișate.</p>}</section>

                <section className="overflow-hidden rounded-2xl border bg-white"><div className="flex items-center justify-between border-b px-5 py-4"><div><h2 className="font-bold">Produse transferate</h2><p className="mt-1 text-sm text-slate-500">{f.data.items.length} {f.data.items.length === 1 ? 'produs adăugat' : 'produse adăugate'}</p></div></div>{f.data.items.length > 0 ? <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Produs</th><th className="px-5 py-3 text-right">Cantitate</th><th className="px-5 py-3" /></tr></thead><tbody className="divide-y">{f.data.items.map((row, index) => <tr key={`${row.product_id}-${index}`}><td className="px-5 py-4 font-semibold text-slate-800">{row.product_name}</td><td className="px-5 py-4 text-right">{row.quantity}</td><td className="px-5 py-4 text-right"><button type="button" onClick={() => removeItem(index)} className="rounded border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700">Șterge</button></td></tr>)}</tbody></table></div> : <p className="px-5 py-10 text-center text-sm text-slate-500">Nu ai adăugat încă produse în transfer.</p>}{f.errors.items && <p className="px-5 pb-4 text-sm text-rose-700">{f.errors.items}</p>}</section>
                <textarea value={f.data.notes} onChange={(event) => f.setData('notes', event.target.value)} placeholder="Observații" className="w-full rounded border" rows="3" />
                <button disabled={f.processing || f.data.items.length === 0} className="rounded bg-blue-600 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">Salvează transferul</button>
            </form>
        </div>
    </AuthenticatedLayout>;
}
