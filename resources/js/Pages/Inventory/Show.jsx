import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { formatDate } from '@/lib/dateFormat';

export default function Show({ inventory }) {
    const canApply = inventory.status !== 'applied';
    const items = inventory.items ?? [];
    const quantity = (value) => Number(value ?? 0).toFixed(2);

    return (
        <AuthenticatedLayout>
            <Head title={`Inventar ${inventory.number}`} />
            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <Link href={route('inventory.index')} className="text-sm text-blue-700">← Înapoi la inventare</Link>
                        <h1 className="mt-2 text-3xl font-bold">Inventar {inventory.number}</h1>
                        <p className="mt-1 text-slate-600">{inventory.warehouse?.name} · {formatDate(inventory.inventoried_at)}</p>
                    </div>
                    <div className="flex gap-2">
                        <a href={route('inventory.pdf', inventory.id)} className="rounded-lg border border-red-200 px-4 py-2 font-semibold text-red-700">Exportă PDF</a>
                        {canApply && <button onClick={() => confirm('Aplici diferențele constatate în stoc?') && router.post(route('inventory.apply', inventory.id))} className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-white">Aplică diferențe</button>}
                    </div>
                </div>
                {inventory.notes && <div className="mb-5 rounded-xl border bg-slate-50 p-4 text-slate-700">{inventory.notes}</div>}
                <div className="overflow-x-auto rounded-2xl border bg-white">
                    <table className="min-w-full text-sm"><thead className="bg-slate-50"><tr><th className="p-3 text-left">Produs</th><th className="p-3 text-left">UM</th><th className="p-3 text-right">Scriptic</th><th className="p-3 text-right">Faptic</th><th className="p-3 text-right">Diferență</th><th className="p-3 text-right">Valoare diferență</th></tr></thead><tbody>{items.map((item) => { const difference = Number(item.counted_quantity) - Number(item.book_quantity); return <tr key={item.id} className="border-t"><td className="p-3 font-medium">{item.product_name}</td><td className="p-3">{item.unit}</td><td className="p-3 text-right">{quantity(item.book_quantity)}</td><td className="p-3 text-right">{quantity(item.counted_quantity)}</td><td className={`p-3 text-right font-semibold ${difference < 0 ? 'text-red-700' : difference > 0 ? 'text-emerald-700' : ''}`}>{quantity(difference)}</td><td className="p-3 text-right">{(difference * Number(item.unit_price ?? 0)).toFixed(2)} RON</td></tr>; })}{!items.length && <tr><td colSpan="6" className="p-7 text-center text-slate-500">Inventarul nu are poziții.</td></tr>}</tbody></table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
