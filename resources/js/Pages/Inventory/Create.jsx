import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const blankItem = () => ({ product_id: '', product_name: '', book_quantity: 0, counted_quantity: 0 });

export default function Create({ warehouses = [], products = [], stocks = [] }) {
    const form = useForm({ warehouse_id: '', inventoried_at: new Date().toISOString().slice(0, 10), notes: '', items: [] });
    const [item, setItem] = useState(blankItem());
    const warehouse = warehouses.find((entry) => String(entry.id) === String(form.data.warehouse_id));
    const bookQuantity = (product) => warehouse?.type === 'cantitativ_valoric'
        ? Number(stocks.find((stock) => String(stock.product_id) === String(product.id) && String(stock.warehouse_id) === String(warehouse.id))?.quantity || 0)
        : Number(product.stock_quantity || 0);
    const suggestions = useMemo(() => {
        const term = item.product_name.trim().toLocaleLowerCase('ro-RO');
        return term && warehouse ? products.filter((product) => `${product.name} ${product.code || ''}`.toLocaleLowerCase('ro-RO').includes(term)).slice(0, 8) : [];
    }, [item.product_name, products, warehouse]);
    const chooseProduct = (product) => {
        const scriptic = bookQuantity(product);
        setItem({ product_id: product.id, product_name: product.name, book_quantity: scriptic, counted_quantity: scriptic });
    };
    const addItem = () => {
        if (!item.product_id) return;
        const existing = form.data.items.findIndex((row) => String(row.product_id) === String(item.product_id));
        form.setData('items', existing === -1 ? [...form.data.items, item] : form.data.items.map((row, index) => index === existing ? item : row));
        setItem(blankItem());
    };
    const addAll = () => form.setData('items', products.map((product) => ({ product_id: product.id, product_name: product.name, book_quantity: bookQuantity(product), counted_quantity: bookQuantity(product) })));
    const removeItem = (index) => form.setData('items', form.data.items.filter((_, position) => position !== index));
    const updateCounted = (index, counted_quantity) => form.setData('items', form.data.items.map((row, position) => position === index ? { ...row, counted_quantity } : row));
    const changeWarehouse = (warehouse_id) => { form.setData({ ...form.data, warehouse_id, items: [] }); setItem(blankItem()); };

    return <AuthenticatedLayout><Head title="Emite inventar" />
        <div className="mx-auto max-w-7xl px-4 py-8"><div className="mb-6 flex items-center justify-between"><div><h1 className="text-3xl font-bold">Emite inventar</h1><p className="mt-1 text-slate-500">Adaugă produsele pe rând și compară stocul scriptic cu cel faptic.</p></div><Link href={route('inventory.index')} className="rounded border px-4 py-2">Înapoi</Link></div>
            <form onSubmit={(event) => { event.preventDefault(); form.post(route('inventory.store')); }} className="space-y-5"><section className="rounded-2xl border bg-white p-5"><div className="grid gap-4 md:grid-cols-2"><label>Gestiune *<select value={form.data.warehouse_id} onChange={(event) => changeWarehouse(event.target.value)} className="mt-1 block w-full" required><option value="">Alege gestiunea</option>{warehouses.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}</select></label><label>Data inventarului *<input type="date" value={form.data.inventoried_at} onChange={(event) => form.setData('inventoried_at', event.target.value)} className="mt-1 block w-full" required /></label><label className="md:col-span-2">Observații<textarea value={form.data.notes} onChange={(event) => form.setData('notes', event.target.value)} className="mt-1 block w-full" /></label></div></section>

                <section className="rounded-2xl border border-blue-200 bg-white p-5 shadow-sm"><div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-bold text-slate-900">Adaugă produs inventariat</h2><p className="mt-1 text-sm text-slate-500">Alege gestiunea, caută produsul, completează stocul faptic și adaugă-l în listă.</p></div><button type="button" onClick={addAll} disabled={!warehouse} className="rounded border border-blue-200 px-3 py-2 text-sm font-bold text-blue-700 disabled:cursor-not-allowed disabled:opacity-40">Adaugă toate produsele</button></div><div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_140px_140px_auto]"><div className="relative"><input value={item.product_name} disabled={!warehouse} onChange={(event) => setItem((current) => ({ ...current, product_name: event.target.value, product_id: '' }))} placeholder={warehouse ? 'Scrie produsul...' : 'Alege mai întâi gestiunea'} className="w-full rounded border disabled:bg-slate-100" />{suggestions.length > 0 && <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl">{suggestions.map((product) => <button key={product.id} type="button" onClick={() => chooseProduct(product)} className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm hover:bg-blue-50"><span className="font-semibold text-slate-800">{product.name}</span><span className="shrink-0 text-xs text-slate-500">{product.code || product.unit}</span></button>)}</div>}</div><label className="text-xs font-bold uppercase tracking-wide text-slate-500">Scriptic<input readOnly value={Number(item.book_quantity).toFixed(3)} className="mt-1 w-full rounded border bg-slate-100 text-right text-slate-700" /></label><label className="text-xs font-bold uppercase tracking-wide text-slate-500">Faptic<input type="number" min="0" step="0.001" disabled={!item.product_id} value={item.counted_quantity} onChange={(event) => setItem((current) => ({ ...current, counted_quantity: event.target.value }))} className="mt-1 w-full rounded border text-right disabled:bg-slate-100" /></label><button type="button" onClick={addItem} disabled={!item.product_id} className="self-end rounded bg-blue-600 px-5 py-2.5 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">＋ Adaugă</button></div>{item.product_name && !item.product_id && <p className="mt-2 text-xs text-amber-700">Alege produsul din sugestiile afișate.</p>}</section>

                <section className="overflow-hidden rounded-2xl border bg-white"><div className="flex items-center justify-between border-b px-5 py-4"><div><h2 className="font-bold">Produse inventariate</h2><p className="mt-1 text-sm text-slate-500">{form.data.items.length} {form.data.items.length === 1 ? 'produs adăugat' : 'produse adăugate'}</p></div></div>{form.data.items.length > 0 ? <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Produs</th><th className="px-5 py-3 text-right">Scriptic</th><th className="px-5 py-3 text-right">Faptic</th><th className="px-5 py-3 text-right">Diferență</th><th className="px-5 py-3" /></tr></thead><tbody className="divide-y">{form.data.items.map((row, index) => { const difference = Number(row.counted_quantity) - Number(row.book_quantity); return <tr key={row.product_id}><td className="px-5 py-4 font-semibold text-slate-800">{row.product_name}</td><td className="px-5 py-4 text-right">{Number(row.book_quantity).toFixed(3)}</td><td className="px-5 py-4 text-right"><input type="number" min="0" step="0.001" value={row.counted_quantity} onChange={(event) => updateCounted(index, event.target.value)} className="w-28 rounded border text-right" /></td><td className={`px-5 py-4 text-right font-bold ${difference === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>{difference > 0 ? '+' : ''}{difference.toFixed(3)}</td><td className="px-5 py-4 text-right"><button type="button" onClick={() => removeItem(index)} className="rounded border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700">Șterge</button></td></tr>; })}</tbody></table></div> : <p className="px-5 py-10 text-center text-sm text-slate-500">Nu ai adăugat încă produse în inventar.</p>}{form.errors.items && <p className="px-5 pb-4 text-sm text-rose-700">{form.errors.items}</p>}</section>
                <div className="flex justify-end"><button disabled={!form.data.items.length || form.processing} className="rounded bg-blue-600 px-5 py-2.5 font-semibold text-white disabled:opacity-40">{form.processing ? 'Se emite…' : 'Emite inventarul'}</button></div>
            </form>
        </div>
    </AuthenticatedLayout>;
}
