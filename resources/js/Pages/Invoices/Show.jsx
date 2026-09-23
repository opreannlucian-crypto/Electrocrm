import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';

const oblioStatusLabel = {
    not_configured: 'Neconfigurat',
    pending: 'În curs de emitere',
    issued: 'Emisă în Oblio',
    cancelled: 'Anulată în Oblio',
    error: 'Eroare Oblio',
    out_of_sync: 'Necesită verificare',
};

const money = (value) => `${Number(value || 0).toFixed(2)} RON`;
const date = (value) => value ? new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString('ro-RO') : '—';

export default function Show({ invoice, oblio = {}, canEdit = false }) {
    const user = usePage().props.auth.user;
    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
        paid_at: new Date().toISOString().slice(0, 10),
        method: 'transfer',
        reference: '',
        notes: '',
    });
    const balance = Number(invoice.total) - Number(invoice.paid_amount);
    const action = (name) => router.post(route(name, invoice.id));
    const currentNumber = String(invoice.number || '').split('-').at(-1) || invoice.number;
    const seller = invoice.seller_snapshot || {};
    const buyer = invoice.buyer_snapshot || {};
    const isProforma = invoice.document_type === 'proforma';
    const documentLabel = isProforma ? 'Factură proformă' : 'Factură';

    const issueInOblio = () => {
        const confirmed = window.confirm(
            `Confirmi emiterea facturii ${invoice.number} în Oblio? Această acțiune va genera un document fiscal în Oblio și va folosi fluxul Oblio pentru e-Factura/SPV.`,
        );

        if (confirmed) {
            router.post(route('invoices.oblio.issue', invoice.id));
        }
    };

    const testOblioConnection = () => {
        router.post(route('oblio.test-connection'));
    };

    const directEfacturaAvailable = !(oblio.spvExtern && invoice.oblio_status === 'issued');

    return (
        <AuthenticatedLayout>
            <Head title={invoice.number} />
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <Link href={route('invoices.index')} className="text-sm text-gray-500">← Facturi</Link>
                        <h1 className="mt-1 text-3xl font-bold">{documentLabel} {invoice.number}</h1>
                        <p className="mt-1 text-sm text-gray-500">Tip: <b>{isProforma ? 'Factură proformă (document comercial)' : 'Factură fiscală'}</b> · Seria: <b>{invoice.series || '—'}</b> · Nr. curent: <b>{currentNumber}</b> · {invoice.client?.name} · {invoice.status}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <a href={route('invoices.pdf', invoice.id)} className="rounded-xl border px-4 py-2 font-semibold">PDF</a>{canEdit && <Link href={route('invoices.edit', invoice.id)} className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 font-semibold text-amber-900">Editează</Link>}{isProforma && !invoice.converted_invoice_id && <button onClick={() => { if (window.confirm('Convertești această proformă în factură fiscală?')) router.post(route('invoices.convert', invoice.id)); }} className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white">Convertește în factură</button>}
                        {invoice.status === 'draft' && (isProforma || !oblio.enabled) && (
                            <button onClick={() => action('invoices.issue')} className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white">Emite {isProforma ? 'factura proformă' : 'factura'}</button>
                        )}
                        {invoice.status === 'draft' && !isProforma && oblio.enabled && (
                            <button
                                type="button"
                                onClick={issueInOblio}
                                disabled={!oblio.configured}
                                title={!oblio.configured ? 'Administratorul trebuie să configureze și să testeze mai întâi conexiunea Oblio.' : undefined}
                                className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Emite în Oblio
                            </button>
                        )}
                        {!isProforma && directEfacturaAvailable && (
                            <button onClick={() => action('invoices.efactura')} className="rounded-xl bg-purple-600 px-4 py-2 font-semibold text-white">Generează / trimite e-Factura</button>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-3">
                    <div className="space-y-6 xl:col-span-2">
                        <section className="rounded-2xl border bg-white p-6">
                            <h2 className="text-lg font-bold">{isProforma ? 'Date factură proformă, emitent și client' : 'Emitent și client'}</h2>
                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <div className="rounded-xl bg-slate-50 p-4 text-sm">
                                    <p className="text-xs font-bold uppercase tracking-wide text-blue-800">Emitent</p>
                                    <p className="mt-2 font-bold text-slate-900">{seller.name || 'Emitent neconfigurat'}</p>
                                    <p>CUI: {seller.cui || '—'}</p>
                                    <p>Nr. Reg. Com.: {seller.registration_number || '—'}</p>
                                    <p>{seller.address || '—'}</p>
                                    <p>IBAN: {seller.iban || '—'}</p>
                                    <p>{seller.email || '—'}{seller.phone ? ` · ${seller.phone}` : ''}</p>
                                </div>
                                <div className="rounded-xl bg-slate-50 p-4 text-sm">
                                    <p className="text-xs font-bold uppercase tracking-wide text-blue-800">Client</p>
                                    <p className="mt-2 font-bold text-slate-900">{buyer.name || invoice.client?.name || 'Client neconfigurat'}</p>
                                    <p>CUI: {buyer.cui || invoice.client?.cui || '—'}</p>
                                    <p>{[buyer.address || invoice.client?.address, buyer.city || invoice.client?.city].filter(Boolean).join(', ') || '—'}</p>
                                    <p>{buyer.email || invoice.client?.email || '—'}{(buyer.phone || invoice.client?.phone) ? ` · ${buyer.phone || invoice.client?.phone}` : ''}</p>
                                    <p>{buyer.tva_status === 'neplatitor_tva' ? 'Neplătitor TVA' : 'Plătitor TVA'}</p>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border bg-white p-6">
                            <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-bold">Poziții {isProforma ? 'factură proformă' : 'factură'}</h2><span className="text-sm text-gray-500">Data emiterii: {date(invoice.issue_date)} · Scadență: {date(invoice.due_date)}</span></div>
                            <div className="mt-4 overflow-x-auto">
                                <table className="min-w-[840px] w-full text-sm">
                                    <thead><tr className="border-b bg-slate-50 text-left text-xs uppercase tracking-wide text-gray-500"><th className="px-2 py-3">Nr.</th><th className="px-2 py-3">Denumire serviciu / produs</th><th className="px-2 py-3">U.M.</th><th className="px-2 py-3 text-right">Cant.</th><th className="px-2 py-3 text-right">Cota TVA</th><th className="px-2 py-3 text-right">Preț fără TVA</th><th className="px-2 py-3 text-right">Valoare fără TVA</th><th className="px-2 py-3 text-right">Valoare TVA</th><th className="px-2 py-3 text-right">Total</th></tr></thead>
                                    <tbody>{invoice.items.map((item, index) => <tr key={item.id} className="border-b"><td className="px-2 py-3 font-semibold text-gray-500">{index + 1}</td><td className="px-2 py-3">{item.name}</td><td className="px-2 py-3">{item.unit}</td><td className="px-2 py-3 text-right">{Number(item.quantity).toFixed(2)}</td><td className="px-2 py-3 text-right">{Number(item.vat_rate).toFixed(2)}%</td><td className="px-2 py-3 text-right">{Number(item.unit_price).toFixed(2)}</td><td className="px-2 py-3 text-right">{Number(item.net_amount).toFixed(2)}</td><td className="px-2 py-3 text-right">{Number(item.vat_amount).toFixed(2)}</td><td className="px-2 py-3 text-right font-bold">{money(item.gross_amount)}</td></tr>)}</tbody>
                                </table>
                            </div>
                            <div className="ml-auto mt-5 max-w-sm space-y-1 rounded-xl bg-slate-50 p-4 text-right text-sm"><div>Subtotal fără TVA: {money(invoice.subtotal)}</div>{Number(invoice.discount) > 0 && <div>Reducere procentuală: − {money(Number(invoice.subtotal) * Number(invoice.discount) / 100)}</div>}{Number(invoice.fixed_discount) > 0 && <div>Reducere fixă fără TVA: − {money(invoice.fixed_discount)}</div>}<div>Valoare TVA: {money(invoice.vat_total)}</div><div className="text-xl font-bold">Total de plată: {money(invoice.total)}</div></div>
                        </section>

                        <section className="rounded-2xl border border-amber-200 bg-amber-50/40 p-6">
                            <h2 className="text-lg font-bold text-amber-950">Observații / Mențiuni</h2>
                            <p className="mt-2 whitespace-pre-wrap text-sm text-amber-950">{invoice.notes || `Nu există observații sau mențiuni pentru această ${documentLabel.toLowerCase()}.`}</p>
                        </section>

                        <section className="rounded-2xl border bg-white p-6">
                            <h2 className="text-lg font-bold">Date privind emiterea și expediția</h2>
                            <div className="mt-4 grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-3">
                                <div className="rounded-lg border p-3"><span className="block text-xs text-gray-500">Persoana care a emis factura</span><b>{invoice.issuer_name || '—'}</b></div>
                                <div className="rounded-lg border p-3"><span className="block text-xs text-gray-500">{invoice.issuer_identifier_type || 'CNP / CI'}</span><b>{invoice.issuer_identifier || '—'}</b></div>
                                <div className="rounded-lg border p-3"><span className="block text-xs text-gray-500">Delegat</span><b>{invoice.delegate_name || '—'}</b></div>
                                <div className="rounded-lg border p-3"><span className="block text-xs text-gray-500">Nr. document însoțitor</span><b>{invoice.accompanying_document_number || '—'}</b></div>
                                <div className="rounded-lg border p-3"><span className="block text-xs text-gray-500">Auto / nr. auto</span><b>{invoice.vehicle_number || '—'}</b></div>
                                <div className="rounded-lg border p-3"><span className="block text-xs text-gray-500">Nr. lucrare / proiect</span><b>{invoice.work_order_number || invoice.work_order?.number || '—'}</b></div>
                                <div className="rounded-lg border p-3"><span className="block text-xs text-gray-500">Data livrării</span><b>{date(invoice.delivery_date)}</b></div>
                                <div className="rounded-lg border p-3"><span className="block text-xs text-gray-500">Data încasării</span><b>{date(invoice.collection_date)}</b></div>
                            </div>
                        </section>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-2xl border bg-white p-5">
                            <h2 className="font-bold">Încasări</h2>
                            <p className="mt-2">Încasat: {money(invoice.paid_amount)}</p>
                            <p className="font-bold">Sold: {money(balance)}</p>
                            <form onSubmit={(event) => { event.preventDefault(); post(route('invoices.payments.store', invoice.id), { onSuccess: () => reset('amount', 'reference', 'notes') }); }} className="mt-4 space-y-2">
                                <input type="number" value={data.amount} onChange={(event) => setData('amount', event.target.value)} placeholder="Sumă" className="w-full rounded border-gray-300" />
                                <input type="date" value={data.paid_at} onChange={(event) => setData('paid_at', event.target.value)} className="w-full rounded border-gray-300" />
                                <select value={data.method} onChange={(event) => setData('method', event.target.value)} className="w-full rounded border-gray-300"><option value="transfer">Transfer bancar</option><option value="cash">Numerar</option><option value="card">Card</option></select>
                                {errors.amount && <p className="text-sm text-red-600">{errors.amount}</p>}
                                {errors.oblio && <p className="text-sm text-red-600">{errors.oblio}</p>}
                                <button disabled={processing} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white">Înregistrează plata</button>
                            </form>
                        </div>

                        {!isProforma && <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5">
                            <div className="flex items-start justify-between gap-3"><div><h2 className="font-bold text-indigo-950">Oblio</h2><p className="mt-1 text-sm text-indigo-900">Status: {oblioStatusLabel[invoice.oblio_status] ?? (oblio.enabled ? 'Pregătită pentru emitere' : 'Integrare dezactivată')}</p></div>{user?.role === 'administrator' && <button type="button" onClick={testOblioConnection} className="rounded-lg border border-indigo-200 bg-white px-2.5 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100">Testează conexiunea</button>}</div>
                            {!oblio.configured && <p className="mt-3 text-xs leading-5 text-indigo-800">Credențialele Oblio nu sunt configurate încă pe server. Testul de conexiune este numai citire și nu emite documente.</p>}
                            {errors.oblio && <p className="mt-3 text-xs font-semibold text-red-700">{errors.oblio}</p>}
                            {invoice.oblio_series && <p className="mt-3 text-sm text-indigo-950">Document Oblio: <span className="font-bold">{invoice.oblio_series} {invoice.oblio_number}</span></p>}
                            {invoice.oblio_document_url && <a href={invoice.oblio_document_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-bold text-indigo-700 underline">Deschide factura în Oblio</a>}
                            {invoice.oblio_error_message && <p className="mt-3 text-xs font-semibold text-red-700">Ultima eroare: {invoice.oblio_error_message}</p>}
                            {invoice.oblio_status === 'issued' && oblio.spvExtern && <p className="mt-3 text-xs leading-5 text-indigo-800">Transmiterea RO e-Factura/SPV este administrată prin Oblio pentru această factură.</p>}
                        </div>}

                        {!isProforma && <div className="rounded-2xl border bg-white p-5"><h2 className="font-bold">RO e-Factura</h2><p className="mt-2 text-sm text-gray-600">Status: {invoice.efactura_status ?? 'nepregătită'}</p>{invoice.efactura_upload_id && <p className="text-sm">ID încărcare: {invoice.efactura_upload_id}</p>}<p className="mt-2 text-xs text-gray-500">{invoice.efactura_message}</p></div>}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
