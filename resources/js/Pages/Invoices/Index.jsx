import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

const status = { draft: 'Ciornă', issued: 'Emisă', partially_paid: 'Parțial achitată', paid: 'Achitată', cancelled: 'Anulată' };

export default function Index({ invoices = [], documentType = 'invoice' }) {
  const isProforma = documentType === 'proforma';
  const title = isProforma ? 'Proforme' : 'Facturi';
  const description = isProforma ? 'Proforme emise și starea conversiei în factură.' : 'Facturi emise, plăți și transmitere RO e-Factura.';
  return <AuthenticatedLayout><Head title={title} />
    <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between"><div><h1 className="text-3xl font-bold text-gray-900">{title}</h1><p className="mt-1 text-sm text-gray-500">{description}</p></div><div className="flex gap-2">{isProforma ? <Link href={route('proformas.create')} className="rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-bold text-white">+ Proformă nouă</Link> : <Link href={route('invoices.create')} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white">+ Factură nouă</Link>}</div></div>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"><table className="min-w-full text-sm"><thead className="bg-gray-50 text-left text-xs uppercase text-gray-500"><tr><th className="px-5 py-4">Document</th><th className="px-5 py-4">Client</th><th className="px-5 py-4">Data</th><th className="px-5 py-4">Total</th><th className="px-5 py-4">Sold</th><th className="px-5 py-4">Status</th></tr></thead><tbody className="divide-y divide-gray-100">{invoices.map(invoice => <tr key={invoice.id} className="hover:bg-gray-50"><td className="px-5 py-4 font-semibold text-blue-700"><Link href={route('invoices.show', invoice.id)}><span className="mr-2 rounded-full bg-slate-100 px-2 py-1 text-[10px] uppercase">{isProforma ? 'Proformă' : 'Factură'}</span>{invoice.number}</Link></td><td className="px-5 py-4">{invoice.client?.name}</td><td className="px-5 py-4">{invoice.issue_date}</td><td className="px-5 py-4">{Number(invoice.total).toFixed(2)} RON</td><td className="px-5 py-4">{(Number(invoice.total)-Number(invoice.paid_amount)).toFixed(2)} RON</td><td className="px-5 py-4">{status[invoice.status] ?? invoice.status}</td></tr>)}{invoices.length===0 && <tr><td colSpan="6" className="px-5 py-12 text-center text-gray-500">Nu există {isProforma ? 'proforme' : 'facturi'} încă.</td></tr>}</tbody></table></div>
    </div></AuthenticatedLayout>;
}
