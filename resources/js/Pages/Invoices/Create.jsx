import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ClientAutocomplete from '@/Components/ClientAutocomplete';
import { Head, Link, useForm } from '@inertiajs/react';

const VAT_RATES = [0, 5, 9, 19, 21];

const amount = (value) => Number(value || 0);
const money = (value) => amount(value).toFixed(2);

export default function Create({ clients = [], products = [], services = [], workOrders = [], sourceQuote = null, invoice = null, companyProfile = {}, issuerDefault = {}, documentType = 'invoice', defaultSeries = '' }) {
  const documentLabel = documentType === 'proforma' ? 'Factură proformă' : 'Factură';
  const isEditing = Boolean(invoice);
  const defaultVatRate = Number(companyProfile.default_vat_rate ?? 21);
  const initialItems = (invoice?.items ?? sourceQuote?.items)?.map((item) => ({
    product_id: item.product_id ?? '',
    service_id: item.service_id ?? '',
    type: item.type ?? 'serviciu',
    name: item.name ?? '',
    unit: item.unit ?? 'buc',
    quantity: item.quantity ?? 1,
    unit_price: item.unit_price ?? 0,
    discount: item.discount ?? 0,
    vat_rate: item.vat_rate ?? defaultVatRate,
  })) ?? [{ type: 'serviciu', name: '', unit: 'buc', quantity: 1, unit_price: 0, discount: 0, vat_rate: defaultVatRate }];

  const { data, setData, post, put, processing, errors } = useForm({
    document_type: documentType,
    client_id: invoice?.client_id ?? sourceQuote?.client_id ?? '',
    client_name: invoice?.client?.name ?? clients.find((client) => String(client.id) === String(invoice?.client_id ?? sourceQuote?.client_id))?.name ?? '',
    quote_id: invoice?.quote_id ?? sourceQuote?.id ?? '',
    work_order_id: invoice?.work_order_id ?? sourceQuote?.work_order_id ?? '',
    series: (invoice?.series ?? defaultSeries) || (documentType === 'proforma' ? 'PF' : (companyProfile.invoice_series ?? 'F')),
    issue_date: String(invoice?.issue_date ?? new Date().toISOString().slice(0, 10)).slice(0, 10),
    due_date: invoice?.due_date ? String(invoice.due_date).slice(0, 10) : '',
    delivery_date: invoice?.delivery_date ? String(invoice.delivery_date).slice(0, 10) : '',
    collection_date: invoice?.collection_date ? String(invoice.collection_date).slice(0, 10) : '',
    vat_rate: invoice?.vat_rate ?? defaultVatRate,
    discount: invoice?.discount ?? sourceQuote?.discount ?? 0,
    fixed_discount: invoice?.fixed_discount ?? sourceQuote?.fixed_discount ?? 0,
    notes: invoice?.notes ?? sourceQuote?.notes ?? '',
    issuer_name: invoice?.issuer_name ?? issuerDefault.name ?? '',
    issuer_identifier_type: invoice?.issuer_identifier_type ?? 'CNP',
    issuer_identifier: invoice?.issuer_identifier ?? '',
    delegate_name: invoice?.delegate_name ?? '',
    accompanying_document_number: invoice?.accompanying_document_number ?? '',
    vehicle_number: invoice?.vehicle_number ?? '',
    items: initialItems,
  });

  const updateItem = (index, key, value) => {
    setData('items', data.items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  };

  const chooseCatalogEntry = (index, entry, type) => {
    if (!entry) return;
    setData('items', data.items.map((item, itemIndex) => itemIndex === index ? {
      ...item,
      type,
      product_id: type === 'material' ? entry.id : '',
      service_id: type === 'serviciu' ? entry.id : '',
      name: entry.name || '',
      unit: entry.unit || (type === 'serviciu' ? 'serviciu' : 'buc'),
      unit_price: entry.sale_price ?? 0,
      vat_rate: entry.vat_rate ?? defaultVatRate,
    } : item));
  };

  const enterProductName = (index, name) => {
    const normalizedName = name.trim().toLocaleLowerCase('ro-RO');
    const service = services.find((entry) => entry.name.trim().toLocaleLowerCase('ro-RO') === normalizedName);
    const product = products.find((entry) => entry.name.trim().toLocaleLowerCase('ro-RO') === normalizedName);
    const preferred = data.items[index]?.type === 'serviciu' ? (service ? [service, 'serviciu'] : product ? [product, 'material'] : null) : (product ? [product, 'material'] : service ? [service, 'serviciu'] : null);
    if (preferred) {
      chooseCatalogEntry(index, preferred[0], preferred[1]);
      return;
    }
    setData('items', data.items.map((item, itemIndex) => itemIndex === index ? { ...item, product_id: '', service_id: '', name } : item));
  };

  const addItem = () => {
    setData('items', [...data.items, {
      type: 'serviciu', name: '', unit: 'buc', quantity: 1, unit_price: 0, discount: 0, vat_rate: data.vat_rate || defaultVatRate,
    }]);
  };

  const lineValues = (item) => {
    const net = amount(item.quantity) * amount(item.unit_price) * (1 - amount(item.discount) / 100);
    const vat = net * amount(item.vat_rate) / 100;
    return { net, vat, gross: net + vat };
  };

  const rawSubtotal = data.items.reduce((sum, item) => sum + lineValues(item).net, 0);
  const rawVat = data.items.reduce((sum, item) => sum + lineValues(item).vat, 0);
  const percentageDiscountValue = rawSubtotal * amount(data.discount) / 100;
  const fixedDiscountValue = Math.min(Math.max(0, amount(data.fixed_discount)), Math.max(0, rawSubtotal - percentageDiscountValue));
  const totalDiscountValue = percentageDiscountValue + fixedDiscountValue;
  const vatAfterDiscount = rawSubtotal > 0 ? rawVat * ((rawSubtotal - totalDiscountValue) / rawSubtotal) : 0;
  const total = rawSubtotal - totalDiscountValue + vatAfterDiscount;

  return (
    <AuthenticatedLayout>
      <Head title={isEditing ? `Editează ${documentLabel.toLowerCase()}` : `${documentLabel} nouă`} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Document comercial</p>
            <h1 className="text-3xl font-bold text-slate-900">{isEditing ? `Editează ${documentLabel.toLowerCase()}` : `${documentLabel} nouă`}</h1>
          </div>
          <Link href={route('invoices.index')} className="text-sm font-semibold text-slate-600">← Facturi</Link>
        </div>

        <form onSubmit={(event) => { event.preventDefault(); isEditing ? put(route('invoices.update', invoice.id)) : post(route(documentType === 'proforma' ? 'proformas.store' : 'invoices.store')); }} className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Identificarea documentului</h2>
              <p className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">{documentType === 'proforma' ? 'Numărul PF se alocă automat la salvare' : 'Numărul facturii se alocă automat la salvare'}</p>
            </div>

            <datalist id="invoice-product-suggestions">
              {products.map((product) => <option key={product.id} value={product.name}>{product.code ? `Cod: ${product.code}` : ''}</option>)}
              {services.map((service) => <option key={`service-${service.id}`} value={service.name}>{service.code ? `Serviciu · ${service.code}` : 'Serviciu'}</option>)}
            </datalist>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <label className="text-sm font-semibold text-slate-700">Seria {documentType === 'proforma' ? 'proformei' : 'facturii'}
                <input value={data.series} onChange={(event) => setData('series', event.target.value)} className="mt-1 w-full rounded-lg border-slate-300" />
              </label>
              <div className="text-sm font-semibold text-slate-700">Număr {documentType === 'proforma' ? 'proformă' : 'factură'}
                <div className="mt-1 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 font-normal text-slate-500">Se generează automat</div>
              </div>
              <label className="text-sm font-semibold text-slate-700">Data emiterii
                <input type="date" value={data.issue_date} onChange={(event) => setData('issue_date', event.target.value)} className="mt-1 w-full rounded-lg border-slate-300" />
              </label>
              <label className="text-sm font-semibold text-slate-700">Data scadenței
                <input type="date" value={data.due_date} onChange={(event) => setData('due_date', event.target.value)} className="mt-1 w-full rounded-lg border-slate-300" />
              </label>
              <label className="text-sm font-semibold text-slate-700">Data livrării
                <input type="date" value={data.delivery_date} onChange={(event) => setData('delivery_date', event.target.value)} className="mt-1 w-full rounded-lg border-slate-300" />
              </label>
              <label className="text-sm font-semibold text-slate-700">Data încasării
                <input type="date" value={data.collection_date} onChange={(event) => setData('collection_date', event.target.value)} className="mt-1 w-full rounded-lg border-slate-300" />
              </label>
              <div className="text-sm font-semibold text-slate-700 md:col-span-2">Client<ClientAutocomplete clients={clients} clientId={data.client_id} value={data.client_name} onChange={({ client_id, client_name }) => setData((current) => ({ ...current, client_id, client_name }))} error={errors.client_id || errors.client_name} /></div>
              <label className="text-sm font-semibold text-slate-700 md:col-span-2">Nr. lucrare / proiect asociat
                <select value={data.work_order_id} onChange={(event) => setData('work_order_id', event.target.value)} className="mt-1 w-full rounded-lg border-slate-300">
                  <option value="">Fără lucrare / proiect asociat</option>
                  {workOrders.map((workOrder) => <option key={workOrder.id} value={workOrder.id}>{workOrder.number} — {workOrder.client?.name}</option>)}
                </select>
              </label>
              <label className="text-sm font-semibold text-slate-700">Reducere generală %
                <input type="number" min="0" max="100" step="0.01" value={data.discount} onChange={(event) => setData('discount', event.target.value)} className="mt-1 w-full rounded-lg border-slate-300" />
              </label>
              <label className="text-sm font-semibold text-slate-700">Reducere fixă fără TVA (RON)
                <input type="number" min="0" step="0.01" value={data.fixed_discount} onChange={(event) => setData('fixed_discount', event.target.value)} className="mt-1 w-full rounded-lg border-slate-300" />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Produse și servicii</h2>
                <p className="text-sm text-slate-500">Cota TVA se selectează separat pentru fiecare poziție.</p>
              </div>
              <button type="button" onClick={addItem} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">+ Adaugă poziție</button>
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full text-sm">
                <thead className="border-b bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr><th className="px-2 py-3">Nr.</th><th className="px-2 py-3">Tip</th><th className="px-2 py-3">Denumire serviciu / produs</th><th className="px-2 py-3">U.M.</th><th className="px-2 py-3">Cant.</th><th className="px-2 py-3">TVA</th><th className="px-2 py-3">Preț fără TVA</th><th className="px-2 py-3">Valoare fără TVA</th><th className="px-2 py-3">Valoare TVA</th><th className="px-2 py-3">Total</th><th className="px-2 py-3"></th></tr>
                </thead>
                <tbody>
                  {data.items.map((item, index) => {
                    const values = lineValues(item);
                    return <tr key={index} className="border-b align-top">
                      <td className="px-2 py-3 font-bold text-slate-500">{index + 1}</td>
                      <td className="px-2 py-2"><select value={item.type} onChange={(event) => updateItem(index, 'type', event.target.value)} className="w-28 rounded border-slate-300"><option value="serviciu">Serviciu</option><option value="material">Produs</option></select></td>
                      <td className="px-2 py-2"><input value={item.name} list="invoice-product-suggestions" onChange={(event) => enterProductName(index, event.target.value)} placeholder="Scrie pentru sugestii sau alege din listă" className="w-56 rounded border-slate-300" /></td>
                      <td className="px-2 py-2"><input value={item.unit} onChange={(event) => updateItem(index, 'unit', event.target.value)} placeholder="buc" className="w-16 rounded border-slate-300" /></td>
                      <td className="px-2 py-2"><input type="number" min="0.01" step="0.01" value={item.quantity} onChange={(event) => updateItem(index, 'quantity', event.target.value)} className="w-20 rounded border-slate-300" /></td>
                      <td className="px-2 py-2"><select value={item.vat_rate} onChange={(event) => updateItem(index, 'vat_rate', event.target.value)} className="w-20 rounded border-slate-300">{VAT_RATES.map((rate) => <option key={rate} value={rate}>{rate}%</option>)}</select></td>
                      <td className="px-2 py-2"><input type="number" min="0" step="0.01" value={item.unit_price} onChange={(event) => updateItem(index, 'unit_price', event.target.value)} className="w-28 rounded border-slate-300" /></td>
                      <td className="px-2 py-3 text-right font-medium">{money(values.net)}</td>
                      <td className="px-2 py-3 text-right font-medium">{money(values.vat)}</td>
                      <td className="px-2 py-3 text-right font-bold">{money(values.gross)}</td>
                      <td className="px-2 py-2"><button type="button" disabled={data.items.length === 1} onClick={() => setData('items', data.items.filter((_, itemIndex) => itemIndex !== index))} className="font-bold text-red-600 disabled:cursor-not-allowed disabled:opacity-30">×</button></td>
                    </tr>;
                  })}
                </tbody>
              </table>
            </div>

            <div className="space-y-4 lg:hidden">
              {data.items.map((item, index) => {
                const values = lineValues(item);
                return <div key={index} className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-3 flex items-center justify-between"><span className="font-bold">Poziția {index + 1}</span><button type="button" disabled={data.items.length === 1} onClick={() => setData('items', data.items.filter((_, itemIndex) => itemIndex !== index))} className="font-bold text-red-600 disabled:opacity-30">Șterge</button></div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-sm font-semibold">Tip<select value={item.type} onChange={(event) => updateItem(index, 'type', event.target.value)} className="mt-1 w-full rounded border-slate-300"><option value="serviciu">Serviciu</option><option value="material">Produs</option></select></label>
                    <label className="text-sm font-semibold">Denumire<input value={item.name} list="invoice-product-suggestions" onChange={(event) => enterProductName(index, event.target.value)} placeholder="Scrie pentru sugestii sau alege din listă" className="mt-1 w-full rounded border-slate-300" /></label>
                    <label className="text-sm font-semibold">U.M.<input value={item.unit} onChange={(event) => updateItem(index, 'unit', event.target.value)} className="mt-1 w-full rounded border-slate-300" /></label>
                    <label className="text-sm font-semibold">Cantitate<input type="number" min="0.01" step="0.01" value={item.quantity} onChange={(event) => updateItem(index, 'quantity', event.target.value)} className="mt-1 w-full rounded border-slate-300" /></label>
                    <label className="text-sm font-semibold">Cota TVA<select value={item.vat_rate} onChange={(event) => updateItem(index, 'vat_rate', event.target.value)} className="mt-1 w-full rounded border-slate-300">{VAT_RATES.map((rate) => <option key={rate} value={rate}>{rate}%</option>)}</select></label>
                    <label className="text-sm font-semibold">Preț fără TVA<input type="number" min="0" step="0.01" value={item.unit_price} onChange={(event) => updateItem(index, 'unit_price', event.target.value)} className="mt-1 w-full rounded border-slate-300" /></label>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-sm"><div><span className="block text-slate-500">Valoare fără TVA</span><b>{money(values.net)}</b></div><div><span className="block text-slate-500">Valoare TVA</span><b>{money(values.vat)}</b></div><div><span className="block text-slate-500">Total</span><b>{money(values.gross)}</b></div></div>
                </div>;
              })}
            </div>

            <div className="ml-auto mt-6 max-w-sm rounded-xl bg-slate-50 p-4 text-right text-sm">
              <div>Subtotal fără TVA: <b>{money(rawSubtotal)} RON</b></div>
              {amount(data.discount) > 0 && <div>Reducere procentuală: <b>− {money(percentageDiscountValue)} RON</b></div>}
              {fixedDiscountValue > 0 && <div>Reducere fixă fără TVA: <b>− {money(fixedDiscountValue)} RON</b></div>}
              <div>TVA: <b>{money(vatAfterDiscount)} RON</b></div>
              <div className="mt-1 text-xl font-bold text-slate-900">Total: {money(total)} RON</div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Observații / Mențiuni</h2>
            <p className="mt-1 text-sm text-slate-500">Această casetă va fi afișată pe document înaintea datelor persoanei care emite factura.</p>
            <textarea value={data.notes} onChange={(event) => setData('notes', event.target.value)} placeholder="Ex.: termen contractual, condiții de plată, detalii de livrare sau alte mențiuni." rows="5" className="mt-3 w-full rounded-xl border-slate-300" />
            {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5"><h2 className="text-lg font-bold text-slate-900">Date privind emiterea și expediția</h2><p className="mt-1 text-sm text-slate-500">Datele de identificare ale emitentului sunt confidențiale și sunt păstrate criptat în aplicație.</p></div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <label className="text-sm font-semibold text-slate-700">Persoana care a emis factura
                <input value={data.issuer_name} onChange={(event) => setData('issuer_name', event.target.value)} placeholder="Nume și prenume" className="mt-1 w-full rounded-lg border-slate-300" />
              </label>
              <label className="text-sm font-semibold text-slate-700">Tip document identificare
                <select value={data.issuer_identifier_type} onChange={(event) => setData('issuer_identifier_type', event.target.value)} className="mt-1 w-full rounded-lg border-slate-300"><option value="CNP">CNP</option><option value="CI">CI</option><option value="BI">BI</option><option value="Pașaport">Pașaport</option></select>
              </label>
              <label className="text-sm font-semibold text-slate-700">CNP / CI / BI
                <input value={data.issuer_identifier} onChange={(event) => setData('issuer_identifier', event.target.value)} placeholder="Număr document" autoComplete="off" className="mt-1 w-full rounded-lg border-slate-300" />
              </label>
              <label className="text-sm font-semibold text-slate-700">Delegat
                <input value={data.delegate_name} onChange={(event) => setData('delegate_name', event.target.value)} placeholder="Nume și prenume delegat" className="mt-1 w-full rounded-lg border-slate-300" />
              </label>
              <label className="text-sm font-semibold text-slate-700">Nr. document însoțitor
                <input value={data.accompanying_document_number} onChange={(event) => setData('accompanying_document_number', event.target.value)} placeholder="Aviz, proces-verbal etc." className="mt-1 w-full rounded-lg border-slate-300" />
              </label>
              <label className="text-sm font-semibold text-slate-700">Auto / nr. auto
                <input value={data.vehicle_number} onChange={(event) => setData('vehicle_number', event.target.value)} placeholder="Ex.: AB 01 ELC" className="mt-1 w-full rounded-lg border-slate-300" />
              </label>
            </div>
          </section>

          {Object.keys(errors).length > 0 && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">Verifică datele marcate din formular înainte de salvare.</p>}
          <button disabled={processing} className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700 disabled:opacity-60">{isEditing ? `Salvează ${documentLabel.toLowerCase()}` : `Creează ${documentLabel.toLowerCase()}`}</button>
        </form>
      </div>
    </AuthenticatedLayout>
  );
}
