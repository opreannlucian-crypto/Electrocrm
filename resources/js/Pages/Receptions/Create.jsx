import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

const emptyItem = () => ({
    product_id: '', product_category_id: '', product_name: '', product_code: '', unit: 'buc',
    quantity_document: 1, quantity_received: 1, unit_price: 0, selling_price: 0, vat_rate: 21,
});

const Field = ({ label, children }) => (
    <label className="block text-sm font-medium text-slate-700">
        <span className="mb-1 block">{label}</span>
        {children}
    </label>
);

const inputClass = 'w-full rounded-lg border-slate-300 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500';

export default function Create({ suppliers = [], warehouses = [], products = [], categories = [], defaultReceptionSeries = 'NIR' }) {
    const form = useForm({
        supplier_id: '', supplier_name: '', supplier_cui: '', supplier_registration_number: '', supplier_address: '', supplier_phone: '', warehouse_id: '', received_at: new Date().toISOString().slice(0, 10),
        stock_entry_date: new Date().toISOString().slice(0, 10), document_type: 'NIR_factura',
        document_code: '', reception_series: defaultReceptionSeries, invoice_series: '', invoice_number: '',
        supplier_document_number: '', delivery_note_number: '', currency: 'RON', vat_included: true,
        commission_members: '', storekeeper: '', difference_notes: '', delegate: '', vehicle: '',
        mentions: '', notes: '', paid_now: false, paid_amount: 0, payment_method: 'bank_transfer', payment_reference: '', items: [emptyItem()],
    });
    const [lookingUpSupplier, setLookingUpSupplier] = useState(false);

    const selectedWarehouse = warehouses.find((warehouse) => String(warehouse.id) === String(form.data.warehouse_id));
    const globalValueWarehouse = selectedWarehouse?.type === 'global_valoric';

    const updateItem = (index, changes) => {
        form.setData('items', form.data.items.map((item, itemIndex) => (
            itemIndex === index ? { ...item, ...changes } : item
        )));
    };

    const chooseProduct = (index, productId) => {
        const product = products.find((entry) => String(entry.id) === String(productId));
        if (!product) {
            updateItem(index, { product_id: '' });
            return;
        }
        updateItem(index, {
            product_id: product.id,
            product_category_id: product.product_category_id || '',
            product_name: product.name || '', product_code: product.code || '', unit: product.unit || 'buc',
            unit_price: product.purchase_price ?? 0, selling_price: product.selling_price ?? 0,
            vat_rate: product.vat_rate ?? 21,
        });
    };

    const enterProductName = (index, name) => {
        const normalizedName = name.trim().toLocaleLowerCase('ro-RO');
        const product = products.find((entry) => entry.name.trim().toLocaleLowerCase('ro-RO') === normalizedName);

        if (product) {
            chooseProduct(index, product.id);
            return;
        }

        updateItem(index, { product_id: '', product_name: name });
    };

    const enterSupplierName = (name) => {
        const normalizedName = name.trim().toLocaleLowerCase('ro-RO');
        const supplier = suppliers.find((entry) => entry.name.trim().toLocaleLowerCase('ro-RO') === normalizedName);
        form.setData({
            ...form.data,
            supplier_id: supplier?.id || '',
            supplier_name: name,
            supplier_cui: supplier?.cui || (supplier ? '' : form.data.supplier_cui),
        });
    };

    const lookupSupplier = async () => {
        if (!form.data.supplier_cui.trim()) return;
        setLookingUpSupplier(true);
        try {
            const cif = encodeURIComponent(form.data.supplier_cui.trim());
            const response = await fetch(`/suppliers/lookup-cui?cui=${cif}`, {
                headers: { Accept: 'application/json' },
            });
            const supplier = await response.json();
            if (!response.ok) throw new Error(supplier.message || 'CUI negăsit.');
            const knownSupplier = suppliers.find((entry) => String(entry.cui || '').replace(/\D/g, '') === String(supplier.cui || '').replace(/\D/g, ''));
            form.setData({
                ...form.data,
                supplier_id: knownSupplier?.id || '',
                supplier_name: supplier.name || form.data.supplier_name,
                supplier_cui: supplier.cui || form.data.supplier_cui,
                supplier_registration_number: supplier.registration_number || '',
                supplier_address: supplier.address || '',
                supplier_phone: supplier.phone || '',
            });
        } catch (error) {
            alert(error.message);
        } finally {
            setLookingUpSupplier(false);
        }
    };

    const submit = (event) => {
        event.preventDefault();
        form.post(route('receptions.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Recepție nouă" />
            <div className="mx-auto max-w-7xl space-y-6 py-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Recepție marfă nouă</h1>
                        <p className="mt-1 text-sm text-slate-500">Nota de recepție și constatare de diferențe (NIR).</p>
                    </div>
                    <Link href={route('receptions.index')} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                        Înapoi la recepții
                    </Link>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                        <h2 className="mb-4 text-lg font-semibold text-slate-900">Date recepție</h2>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <Field label="Furnizor *">
                                <input value={form.data.supplier_name} list="reception-supplier-suggestions" onChange={(event) => enterSupplierName(event.target.value)} className={inputClass} placeholder="Scrie denumirea furnizorului" required />
                                <datalist id="reception-supplier-suggestions">{suppliers.map((supplier) => <option key={supplier.id} value={supplier.name}>{supplier.cui ? `CUI: ${supplier.cui}` : ''}</option>)}</datalist>
                                <span className="mt-1 block text-xs font-normal text-slate-500">Dacă nu există, va fi adăugat automat în nomenclator.</span>
                            </Field>
                            <Field label="CUI / CIF">
                                <div className="flex gap-2"><input value={form.data.supplier_cui} onChange={(event) => form.setData('supplier_cui', event.target.value)} className={inputClass} placeholder="ex. RO12345678" /><button type="button" onClick={lookupSupplier} disabled={lookingUpSupplier || !form.data.supplier_cui.trim()} className="shrink-0 rounded-lg bg-emerald-600 px-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">{lookingUpSupplier ? 'Se caută…' : 'Preia date'}</button></div>
                                <span className="mt-1 block text-xs font-normal text-slate-500">Caută datele firmei în ANAF.</span>
                            </Field>
                            <Field label="Gestiune *">
                                <select value={form.data.warehouse_id} onChange={(event) => form.setData('warehouse_id', event.target.value)} className={inputClass} required>
                                    <option value="">Alege gestiunea</option>
                                    {warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}
                                </select>
                            </Field>
                            <Field label="Data recepției *"><input type="date" value={form.data.received_at} onChange={(event) => form.setData('received_at', event.target.value)} className={inputClass} required /></Field>
                            <Field label="Data intrării în gestiune"><input type="date" value={form.data.stock_entry_date} onChange={(event) => form.setData('stock_entry_date', event.target.value)} className={inputClass} /></Field>
                            <Field label="Denumire document">
                                <select value={form.data.document_type} onChange={(event) => form.setData('document_type', event.target.value)} className={inputClass}>
                                    <option value="NIR_factura">NIR pe factură</option><option value="NIR_aviz">NIR pe aviz</option><option value="NIR">NIR</option>
                                </select>
                            </Field>
                            <Field label="Cod document"><input value={form.data.document_code} onChange={(event) => form.setData('document_code', event.target.value)} className={inputClass} placeholder="Cod intern (opțional)" /></Field>
                            <Field label="Seria NIR"><input value={form.data.reception_series} onChange={(event) => form.setData('reception_series', event.target.value)} className={inputClass} /></Field>
                            <Field label="Monedă"><input value={form.data.currency} onChange={(event) => form.setData('currency', event.target.value.toUpperCase())} className={inputClass} maxLength="3" /></Field>
                        </div>
                    </section>

                    <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                        <h2 className="mb-4 text-lg font-semibold text-slate-900">Document furnizor și persoane responsabile</h2>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <Field label="Seria facturii"><input value={form.data.invoice_series} onChange={(event) => form.setData('invoice_series', event.target.value)} className={inputClass} /></Field>
                            <Field label="Număr factură / document"><input value={form.data.invoice_number} onChange={(event) => form.setData('invoice_number', event.target.value)} className={inputClass} /></Field>
                            <Field label="Număr document furnizor"><input value={form.data.supplier_document_number} onChange={(event) => form.setData('supplier_document_number', event.target.value)} className={inputClass} /></Field>
                            <Field label="Număr aviz"><input value={form.data.delivery_note_number} onChange={(event) => form.setData('delivery_note_number', event.target.value)} className={inputClass} /></Field>
                            <Field label="Membrii comisiei"><input value={form.data.commission_members} onChange={(event) => form.setData('commission_members', event.target.value)} className={inputClass} placeholder="Nume, prenume" /></Field>
                            <Field label="Gestionar"><input value={form.data.storekeeper} onChange={(event) => form.setData('storekeeper', event.target.value)} className={inputClass} /></Field>
                            <Field label="Delegat"><input value={form.data.delegate} onChange={(event) => form.setData('delegate', event.target.value)} className={inputClass} /></Field>
                            <Field label="Mijloc de transport"><input value={form.data.vehicle} onChange={(event) => form.setData('vehicle', event.target.value)} className={inputClass} placeholder="Număr auto" /></Field>
                        </div>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <Field label="Diferențe constatate"><textarea value={form.data.difference_notes} onChange={(event) => form.setData('difference_notes', event.target.value)} className={inputClass} rows="2" /></Field>
                            <Field label="Mențiuni / observații"><textarea value={form.data.mentions} onChange={(event) => form.setData('mentions', event.target.value)} className={inputClass} rows="2" /></Field>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
                            <div><h2 className="text-lg font-semibold text-slate-900">Produse recepționate</h2><p className="text-sm text-slate-500">Poți selecta un produs existent sau poți scrie denumirea unuia nou.</p></div>
                            <button type="button" onClick={() => form.setData('items', [...form.data.items, emptyItem()])} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">+ Adaugă produs</button>
                        </div>
                        <div className="overflow-x-auto">
                            <datalist id="reception-product-suggestions">
                                {products.map((product) => <option key={product.id} value={product.name}>{product.code || ''}</option>)}
                            </datalist>
                            <table className="min-w-[1120px] w-full text-left text-sm">
                                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>
                                    <th className="px-3 py-3">Denumire produs *</th><th className="px-3 py-3">Cod</th><th className="px-3 py-3">Categorie / cont</th><th className="px-3 py-3">U.M.</th><th className="px-3 py-3">Cant. doc.</th><th className="px-3 py-3">Cant. recepț.</th><th className="px-3 py-3">Dif.</th><th className="px-3 py-3">Preț achiz.</th>{globalValueWarehouse && <th className="px-3 py-3">Preț vânz.</th>}<th className="px-3 py-3">TVA</th><th className="px-3 py-3"></th>
                                </tr></thead>
                                <tbody className="divide-y divide-slate-100">
                                    {form.data.items.map((item, index) => {
                                        const difference = Number(item.quantity_received || 0) - Number(item.quantity_document || 0);
                                        return <tr key={index} className="align-top">
                                            <td className="px-3 py-3"><input value={item.product_name} list="reception-product-suggestions" onChange={(event) => enterProductName(index, event.target.value)} className={inputClass} placeholder="Scrie sau alege din sugestii" required /></td>
                                            <td className="px-3 py-3"><input value={item.product_code} onChange={(event) => updateItem(index, { product_code: event.target.value })} className={inputClass} /></td>
                                            <td className="px-3 py-3"><select value={item.product_category_id} onChange={(event) => updateItem(index, { product_category_id: event.target.value })} className={inputClass}><option value="">— categorie —</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}{category.inventory_account ? ` (${category.inventory_account})` : ''}</option>)}</select></td>
                                            <td className="px-3 py-3"><input value={item.unit} onChange={(event) => updateItem(index, { unit: event.target.value })} className={inputClass} /></td>
                                            <td className="px-3 py-3"><input min="0" step="0.001" type="number" value={item.quantity_document} onChange={(event) => updateItem(index, { quantity_document: event.target.value })} className={inputClass} /></td>
                                            <td className="px-3 py-3"><input min="0" step="0.001" type="number" value={item.quantity_received} onChange={(event) => updateItem(index, { quantity_received: event.target.value })} className={inputClass} required /></td>
                                            <td className={`px-3 py-5 font-medium ${difference === 0 ? 'text-slate-500' : 'text-amber-700'}`}>{difference.toFixed(3)}</td>
                                            <td className="px-3 py-3"><input min="0" step="0.01" type="number" value={item.unit_price} onChange={(event) => updateItem(index, { unit_price: event.target.value })} className={inputClass} required /></td>
                                            {globalValueWarehouse && <td className="px-3 py-3"><input min="0" step="0.01" type="number" value={item.selling_price} onChange={(event) => updateItem(index, { selling_price: event.target.value })} className={inputClass} /></td>}
                                            <td className="px-3 py-3"><select value={item.vat_rate} onChange={(event) => updateItem(index, { vat_rate: event.target.value })} className={inputClass}><option value="21">21%</option><option value="11">11%</option><option value="0">0%</option></select></td>
                                            <td className="px-3 py-3"><button type="button" onClick={() => form.setData('items', form.data.items.filter((_, itemIndex) => itemIndex !== index))} disabled={form.data.items.length === 1} className="rounded p-2 text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-30" title="Șterge poziția">✕</button></td>
                                        </tr>;
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <InputError message={form.errors.items} className="px-6 py-3" />
                    </section>

                    <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                        <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-end">
                            <Field label="Observații interne"><textarea value={form.data.notes} onChange={(event) => form.setData('notes', event.target.value)} className={inputClass} rows="2" /></Field>
                            <label className="flex items-center gap-2 pb-3 text-sm font-medium text-slate-700"><input type="checkbox" checked={form.data.vat_included} onChange={(event) => form.setData('vat_included', event.target.checked)} className="rounded border-slate-300 text-indigo-600" />Prețurile includ TVA</label>
                            <label className="flex items-center gap-2 pb-3 text-sm font-medium text-slate-700"><input type="checkbox" checked={form.data.paid_now} onChange={(event) => form.setData('paid_now', event.target.checked)} className="rounded border-slate-300 text-indigo-600" />Achitat acum</label>
                        </div>
                        {form.data.paid_now && <div className="mt-4 grid gap-4 md:grid-cols-3">
                            <Field label="Sumă achitată"><input min="0" step="0.01" type="number" value={form.data.paid_amount} onChange={(event) => form.setData('paid_amount', event.target.value)} className={inputClass} placeholder="0 = total recepție" /></Field>
                            <Field label="Modalitate plată *"><select value={form.data.payment_method} onChange={(event) => form.setData('payment_method', event.target.value)} className={inputClass} required><option value="bank_transfer">OP / transfer bancar</option><option value="cash">Numerar</option><option value="card">Card</option><option value="check">CEC</option><option value="other">Altă modalitate</option></select></Field>
                            <Field label="Număr OP / referință"><input value={form.data.payment_reference} onChange={(event) => form.setData('payment_reference', event.target.value)} className={inputClass} placeholder="Opțional" /></Field>
                        </div>}
                    </section>

                    <div className="flex justify-end gap-3"><Link href={route('receptions.index')} className="rounded-lg px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">Anulează</Link><button disabled={form.processing} className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60">{form.processing ? 'Se salvează…' : 'Salvează recepția'}</button></div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
