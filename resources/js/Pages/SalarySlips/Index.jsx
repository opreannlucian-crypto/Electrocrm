import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

const money = (value) => new Intl.NumberFormat('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0));
const status = { draft: 'Ciornă — necesită verificare', finalized: 'Finalizat' };
const months = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];

export default function Index({ salarySlips = [], month, year, monthName }) {
  const [selectedMonth, setSelectedMonth] = useState(String(month));
  const [selectedYear, setSelectedYear] = useState(String(year));
  const changePeriod = (event) => {
    event.preventDefault();
    const nextYear = Number(selectedYear);
    const nextMonth = Number(selectedMonth);
    if (!Number.isInteger(nextYear) || nextYear < 2000 || nextYear > 2100 || nextMonth < 1 || nextMonth > 12) return;
    router.get(route('salary-slips.index'), { year: nextYear, month: nextMonth }, { preserveState: true, replace: true });
  };
  return <AuthenticatedLayout><Head title="Salarii și fluturași" />
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-wider text-blue-700">Financiar · resurse umane</p><h1 className="text-3xl font-bold text-slate-900">Salarii și fluturași</h1><p className="mt-1 text-sm text-slate-500">Fluturași individuali pe baza salariului brut, pontajului și regulilor configurate pentru perioadă.</p></div><Link href={route('salary-slips.create', { year, month })} className="rounded-xl bg-blue-600 px-5 py-3 text-center text-sm font-bold text-white shadow-sm hover:bg-blue-700">+ Fluturaș nou</Link></div>
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><label className="text-sm font-semibold text-slate-700">Perioada salarială</label><form onSubmit={changePeriod} className="mt-2 flex flex-wrap items-end gap-3"><label className="text-sm text-slate-600">Luna<select value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} className="mt-1 block rounded-lg border-slate-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500">{months.map((monthLabel, index) => <option key={monthLabel} value={index + 1}>{monthLabel}</option>)}</select></label><label className="text-sm text-slate-600">Anul<input type="number" min="2000" max="2100" value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)} className="mt-1 block w-28 rounded-lg border-slate-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500" required /></label><button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">Afișează</button><span className="pb-2 text-sm text-slate-500">Perioada curentă: {monthName}</span></form></div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><table className="min-w-full text-sm"><thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4">Angajat</th><th className="px-5 py-4">Perioadă</th><th className="px-5 py-4 text-right">Brut</th><th className="px-5 py-4 text-right">Rețineri</th><th className="px-5 py-4 text-right">Câștig net</th><th className="px-5 py-4">Status</th><th className="px-5 py-4"></th></tr></thead><tbody className="divide-y divide-slate-100">{salarySlips.map((slip) => <tr key={slip.id} className="hover:bg-slate-50"><td className="px-5 py-4"><p className="font-semibold text-slate-900">{slip.employee?.name}</p><p className="text-xs text-slate-500">{slip.employee?.position || '—'}</p></td><td className="px-5 py-4 text-slate-600">{slip.period_label}</td><td className="px-5 py-4 text-right font-medium">{money(slip.gross_income)} RON</td><td className="px-5 py-4 text-right text-slate-600">{money(Number(slip.cas_amount) + Number(slip.cass_amount) + Number(slip.income_tax_amount) + Number(slip.other_deductions))} RON</td><td className="px-5 py-4 text-right font-bold text-emerald-700">{money(slip.net_pay)} RON</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${slip.status === 'finalized' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{status[slip.status] || slip.status}</span></td><td className="px-5 py-4 text-right"><Link href={route('salary-slips.show', slip.id)} className="font-semibold text-blue-700 hover:text-blue-900">Deschide</Link></td></tr>)}{salarySlips.length === 0 && <tr><td colSpan="7" className="px-5 py-14 text-center text-slate-500">Nu există fluturași pentru această perioadă.</td></tr>}</tbody></table></div>
      <p className="mt-4 text-xs text-slate-500">Document intern operațional. Regula de calcul și facilitățile aplicate trebuie verificate de contabilitate înainte de utilizarea în statul de plată sau D112.</p>
    </div>
  </AuthenticatedLayout>;
}
