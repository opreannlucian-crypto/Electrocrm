import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import SalarySlipForm from './Form';

export default function Edit({ salarySlip, employees, rules }) {
  return <AuthenticatedLayout><Head title="Recalculare fluturaș" />
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-blue-700">Salarii</p><h1 className="text-3xl font-bold text-slate-900">Recalculare fluturaș</h1><p className="mt-1 text-sm text-slate-500">Modificările sunt permise numai cât documentul este în ciornă.</p></div><Link href={route('salary-slips.show', salarySlip.id)} className="text-sm font-bold text-slate-600 hover:text-slate-900">← Înapoi la fluturaș</Link></div><SalarySlipForm employees={employees} rules={rules} salarySlip={salarySlip} period={{ start: salarySlip.period_start, end: salarySlip.period_end, label: salarySlip.period_label }} /></div>
  </AuthenticatedLayout>;
}
