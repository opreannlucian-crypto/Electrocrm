import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Edit({ employee }) {
  const { data, setData, put, processing, errors } = useForm({
    name: employee.name || '', cnp: employee.cnp || '', phone: employee.phone || '', email: employee.email || '', position: employee.position || '', department: employee.department || '', hire_date: employee.hire_date || '',
    salary: employee.salary || '', employment_type: employee.employment_type || 'full_time', is_primary_job: employee.is_primary_job ?? true, monthly_norm_hours: employee.monthly_norm_hours || '166.67', dependent_count: employee.dependent_count ?? 0, tax_facility_code: employee.tax_facility_code || '', schedule: employee.schedule || '', status: employee.status || 'Activ', notes: employee.notes || '',
  });
  const submit = (event) => { event.preventDefault(); put(route('employees.update', employee.id)); };
  const field = (name, label, type = 'text', hint = null) => <div><label className="text-sm font-semibold text-slate-700">{label}</label><input type={type} value={data[name]} onChange={(event) => setData(name, event.target.value)} className="mt-1 w-full rounded-lg border-slate-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500" />{hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}{errors[name] && <p className="mt-1 text-xs text-red-600">{errors[name]}</p>}</div>;

  return <AuthenticatedLayout><Head title="Editare angajat" />
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6"><p className="text-xs font-bold uppercase tracking-wider text-blue-700">Resurse umane</p><h1 className="text-3xl font-bold text-slate-900">Editare angajat</h1><p className="mt-1 text-sm text-slate-500">Setările salariale sunt folosite ca valori inițiale în fluturaș și pot fi ajustate pentru fiecare perioadă.</p></div>
      <form onSubmit={submit} className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-slate-900">Date de identificare</h2><div className="mt-5 grid gap-4 md:grid-cols-2">{field('name', 'Nume complet *')}{field('cnp', 'CNP', 'text', 'Date personale confidențiale.')} {field('email', 'E-mail', 'email')}{field('phone', 'Telefon')}{field('position', 'Funcție')}{field('department', 'Departament')}{field('hire_date', 'Data angajării', 'date')}{field('schedule', 'Program')}</div></section>
        <section className="rounded-2xl border border-blue-100 bg-blue-50/40 p-6 shadow-sm"><h2 className="text-lg font-bold text-slate-900">Configurare salarială</h2><div className="mt-5 grid gap-4 md:grid-cols-2">{field('salary', 'Salariu brut lunar (RON)', 'number')}{field('monthly_norm_hours', 'Normă lunară de ore', 'number')}{field('dependent_count', 'Persoane în întreținere', 'number')}{field('tax_facility_code', 'Cod facilitate fiscală', 'text', 'Se activează numai după validarea contabilității.')}
          <div><label className="text-sm font-semibold text-slate-700">Tip contract</label><select value={data.employment_type} onChange={(event) => setData('employment_type', event.target.value)} className="mt-1 w-full rounded-lg border-slate-300 text-sm shadow-sm"><option value="full_time">Normă întreagă</option><option value="part_time">Timp parțial</option><option value="other">Alt regim</option></select></div>
          <label className="mt-7 flex items-center gap-3 text-sm font-semibold text-slate-700"><input type="checkbox" checked={data.is_primary_job} onChange={(event) => setData('is_primary_job', event.target.checked)} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />Funcție de bază</label>
        </div></section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-slate-900">Statut și observații</h2><div className="mt-5 grid gap-4 md:grid-cols-2"><div><label className="text-sm font-semibold text-slate-700">Status</label><select value={data.status} onChange={(event) => setData('status', event.target.value)} className="mt-1 w-full rounded-lg border-slate-300 text-sm shadow-sm"><option value="Activ">Activ</option><option value="Concediu">Concediu</option><option value="Plecat">Plecat</option></select></div></div><div className="mt-4"><label className="text-sm font-semibold text-slate-700">Observații</label><textarea value={data.notes} onChange={(event) => setData('notes', event.target.value)} className="mt-1 w-full rounded-lg border-slate-300 text-sm shadow-sm" rows="3" /></div></section>
        <button disabled={processing} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60">Salvează modificările</button>
      </form>
    </div>
  </AuthenticatedLayout>;
}
