import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

const blankItem = () => ({ product_id: '', product_name: '', quantity: 1 });

export default function Create({ warehouses = [], products = [] }) {
    const f = useForm({ from_warehouse_id: '', to_warehouse_id: '', issued_at: new Date().toISOString().slice(0, 10), notes: '', items: [blankItem()] });
    const update = (index, key, value) => f.setData('items', f.data.items.map((item, position) => position === index ? { ...item, [key]: value } : item));
    const searchProduct = (index, value) => {
        const product = products.find((item) => item.name.toLocaleLowerCase('ro-RO') === value.trim().toLocaleLowerCase('ro-RO'));
        f.setData('items', f.data.items.map((item, position) => position === index ? { ...item, product_name: value, product_id: product?.id ?? '' } : item));
    };

    return <AuthenticatedLayout><Head title="Notă transfer nouă" />
        <div className="mx-auto max-w-5xl px-4 py-8">
            <div className="mb-6 flex justify-between"><h1 className="text-3xl font-bold">Notă de transfer nouă</h1><Link href={route('transfer-notes.index')} className="rounded border px-4 py-2">Înapoi</Link></div>
            <form onSubmit={(event) => { event.preventDefault(); f.post(route('transfer-notes.store')); }} className="space-y-5">
                <section className="grid gap-3 rounded-2xl border bg-white p-5 md:grid-cols-3"><select required value={f.data.from_warehouse_id} onChange={(event) => f.setData('from_warehouse_id', event.target.value)} className="rounded border"><option value="">Gestiune sursă</option>{warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}</select><select required value={f.data.to_warehouse_id} onChange={(event) => f.setData('to_warehouse_id', event.target.value)} className="rounded border"><option value="">Gestiune destinație</option>{warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}</select><input type="date" value={f.data.issued_at} onChange={(event) => f.setData('issued_at', event.target.value)} className="rounded border" /></section>
                <section className="rounded-2xl border bg-white p-5"><div className="mb-2 flex justify-between"><div><h2 className="font-bold">Produse transferate</h2><p className="mt-1 text-sm text-slate-500">Scrie denumirea produsului și alege sugestia potrivită.</p></div><button type="button" onClick={() => f.setData('items', [...f.data.items, blankItem()])} className="rounded border px-3 py-1">＋ Poziție</button></div><datalist id="transfer-products">{products.map((product) => <option key={product.id} value={product.name}>{product.code ? `${product.code} · ${product.unit}` : product.unit}</option>)}</datalist>{f.data.items.map((item, index) => <div key={index} className="mb-3 grid gap-3 md:grid-cols-3"><div><input required list="transfer-products" value={item.product_name} onChange={(event) => searchProduct(index, event.target.value)} placeholder="Scrie produsul..." className="w-full rounded border" />{item.product_name && !item.product_id && <p className="mt-1 text-xs text-amber-700">Alege un produs din sugestii.</p>}{f.errors[`items.${index}.product_id`] && <p className="mt-1 text-xs text-rose-700">{f.errors[`items.${index}.product_id`]}</p>}</div><input required type="number" min="0.01" step="0.01" value={item.quantity} onChange={(event) => update(index, 'quantity', event.target.value)} className="rounded border" /><button type="button" onClick={() => f.setData('items', f.data.items.filter((_, position) => position !== index))} disabled={f.data.items.length === 1} className="rounded border text-rose-700">Șterge</button></div>)}</section>
                <textarea value={f.data.notes} onChange={(event) => f.setData('notes', event.target.value)} placeholder="Observații" className="w-full rounded border" rows="3" />
                <button disabled={f.processing} className="rounded bg-blue-600 px-5 py-3 font-bold text-white">Salvează transferul</button>
            </form>
        </div>
    </AuthenticatedLayout>;
}
