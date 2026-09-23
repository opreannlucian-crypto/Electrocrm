import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

const money = (value) => new Intl.NumberFormat('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value || 0));
const label = { income: 'Venit / adaos', benefit: 'Beneficiu', medical_leave: 'Concediu medical', deduction: 'Reținere' };

export default function Show({ salarySlip }) {
  const slip = salarySlip;
  const finalized = slip.status === 'finalized';
  const snapshot = slip.calculation_snapshot || {};
  const overtimeSnapshot = snapshot.overtime || {};
  const scheduledHours = slip.scheduled_hours ?? snapshot.scheduled_hours ?? 0;
  const workedHours = slip.worked_hours ?? snapshot.worked_hours ?? 0;
  const overtimeHours = slip.overtime_hours ?? overtimeSnapshot.hours ?? 0;
  const medicalLeaveDays = slip.medical_leave_days ?? snapshot.medical_leave_days ?? 0;
  const annualLeaveDays = slip.annual_leave_days ?? snapshot.annual_leave_days ?? overtimeSnapshot.annual_leave_days ?? 0;
  const overtimePremiumRate = overtimeSnapshot.premium_rate ?? snapshot.rule_rates?.overtime_premium_rate ?? 100;
  const finalize = () => {
    if (!window.confirm('Finalizezi fluturașul? După finalizare, documentul va fi blocat pentru modificare.')) return;
    router.post(route('salary-slips.finalize', slip.id));
  };
  const createRectification = () => {
    if (!window.confirm('Creezi rectificarea cu 184 ore normă, 176 ore lucrate, 2 ore suplimentare, 1 zi concediu și majorare 200%?')) return;
    router.post(route('salary-slips.rectify', slip.id), {
      scheduled_hours: 184,
      worked_hours: 176,
      overtime_hours: 2,
      annual_leave_days: 1,
      overtime_premium_rate: 200,
    });
  };
  const totalRetentions = Number(slip.cas_amount) + Number(slip.cass_amount) + Number(slip.income_tax_amount) + Number(slip.other_deductions);
  return <AuthenticatedLayout><Head title={`Fluturaș ${slip.employee?.name || ''}`} />
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-wider text-blue-700">Fluturaș salarial · {finalized ? 'finalizat' : 'ciornă'}</p><h1 className="text-3xl font-bold text-slate-900">{slip.employee?.name}</h1><p className="mt-1 text-sm text-slate-500">Perioada: {slip.period_label} · creat de {slip.created_by?.name || '—'}</p></div><div className="flex flex-wrap gap-2"><Link href={route('salary-slips.index', { year: new Date(slip.period_start).getFullYear(), month: new Date(slip.period_start).getMonth() + 1 })} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Înapoi</Link><a href={route('salary-slips.pdf', slip.id)} target="_blank" className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-bold text-blue-700 hover:bg-blue-50">PDF</a>{finalized && <button onClick={createRectification} className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-bold text-purple-800 hover:bg-purple-100">Creează rectificare</button>}{!finalized && <><Link href={route('salary-slips.edit', slip.id)} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800 hover:bg-amber-100">Editează</Link><button onClick={finalize} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-700">Finalizează</button></>}</div></div>
      {!finalized && <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><strong>Necesită verificare contabilă.</strong> Ciorna nu este declarație D112 și nu trebuie utilizată ca stat de plată fără validare.</div>}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><Card label="Venit brut" value={`${money(slip.gross_income)} RON`} /><Card label="Total rețineri" value={`${money(totalRetentions)} RON`} tone="red" /><Card label="Cost angajator" value={`${money(slip.employer_total_cost)} RON`} /><div className="rounded-2xl bg-emerald-600 p-5 text-white shadow-sm"><p className="text-xs font-bold uppercase tracking-wide text-emerald-100">Câștig net / Net de plată</p><p className="mt-2 text-3xl font-extrabold">{money(slip.net_pay)} <span className="text-base">RON</span></p></div></section>
      <div className="mt-6 grid gap-6 lg:grid-cols-3"><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2"><h2 className="text-lg font-bold text-slate-900">Componente de calcul</h2><div className="mt-4 overflow-x-auto"><table className="min-w-full text-sm"><thead className="border-b border-slate-200 text-left text-xs uppercase text-slate-500"><tr><th className="pb-3 pr-3">Tip</th><th className="pb-3 pr-3">Denumire</th><th className="pb-3 pr-3">Referință</th><th className="pb-3 text-right">Valoare</th></tr></thead><tbody className="divide-y divide-slate-100">{slip.items.map((item) => <tr key={item.id}><td className="py-3 pr-3 text-slate-600">{label[item.category] || item.category}</td><td className="py-3 pr-3 font-medium text-slate-900">{item.description}</td><td className="py-3 pr-3 text-slate-500">{item.code || item.support_source || '—'}</td><td className={`py-3 text-right font-semibold ${item.category === 'deduction' ? 'text-red-700' : 'text-slate-900'}`}>{item.category === 'deduction' ? '−' : '+'}{money(item.amount)} RON</td></tr>)}{slip.items.length === 0 && <tr><td colSpan="4" className="py-6 text-center text-slate-500">Fără componente suplimentare.</td></tr>}</tbody></table></div></section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-slate-900">Pontaj și profil</h2><dl className="mt-4 space-y-3 text-sm"><Row label="Funcție" value={slip.employee?.position || '—'} /><Row label="Ore normă / lucrate" value={`${money(scheduledHours)} / ${money(workedHours)}`} /><Row label={`Ore suplimentare (${money(overtimePremiumRate)}% majorare)`} value={money(overtimeHours)} /><Row label="Zile medical" value={money(medicalLeaveDays)} /><Row label="Zile concediu de odihnă" value={money(annualLeaveDays)} /><Row label="Facilitate" value={slip.tax_facility_code || '—'} /><Row label="Regulă" value={slip.payroll_rule?.code || '—'} /></dl></section></div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2"><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-slate-900">Contribuții și impozit</h2><dl className="mt-4 space-y-3 text-sm"><Row label={`CAS (${money(slip.cas_rate)}%)`} value={`${money(slip.cas_amount)} RON`} /><Row label={`CASS (${money(slip.cass_rate)}%)`} value={`${money(slip.cass_amount)} RON`} /><Row label="Deducere personală" value={`${money(slip.personal_deduction)} RON`} /><Row label={`Impozit (${money(slip.income_tax_rate)}%)`} value={`${money(slip.income_tax_amount)} RON`} /><Row label="Alte rețineri" value={`${money(slip.other_deductions)} RON`} /></dl></section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-slate-900">Audit și observații</h2><p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">{slip.notes || 'Nu există observații de calcul.'}</p><div className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-500"><p>Regulă: {slip.calculation_snapshot?.rule_name || '—'}</p><p className="mt-1">Validat: {slip.verified_by?.name || 'în așteptare'}</p><p className="mt-1">Referință: {slip.calculation_snapshot?.source_reference || '—'}</p></div></section></div>
    </div>
  </AuthenticatedLayout>;
}
function Card({ label, value, tone = 'default' }) { return <div className={`rounded-2xl border p-5 shadow-sm ${tone === 'red' ? 'border-red-100 bg-red-50' : 'border-slate-200 bg-white'}`}><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className={`mt-2 text-2xl font-extrabold ${tone === 'red' ? 'text-red-700' : 'text-slate-900'}`}>{value}</p></div>; }
function Row({ label, value }) { return <div className="flex items-start justify-between gap-4"><dt className="text-slate-500">{label}</dt><dd className="text-right font-semibold text-slate-800">{value}</dd></div>; }
