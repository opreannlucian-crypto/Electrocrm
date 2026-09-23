import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import SalarySlipForm from './Form';

export default function Create({ employees, rules, period }) {
  return <AuthenticatedLayout><Head title="Fluturaș nou" />
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-blue-700">Salarii</p><h1 className="text-3xl font-bold text-slate-900">Fluturaș nou</h1><p className="mt-1 text-sm text-slate-500">Calculează mai întâi în ciornă, apoi verifică și finalizează documentul.</p></div><Link href={route('salary-slips.index')} className="text-sm font-bold text-slate-600 hover:text-slate-900">← Înapoi la fluturași</Link></div><SalarySlipForm employees={employees} rules={rules} period={period} /></div>
  </AuthenticatedLayout>;
}
