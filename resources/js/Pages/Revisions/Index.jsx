import ClientAutocomplete from "@/Components/ClientAutocomplete";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { useState } from "react";

const labels = { efractie: "Efracție", incendiu: "Incendiu" };
const periods = { trimestriala: "Trimestrială", semestriala: "Semestrială", anuala: "Anuală", la_cerere: "La cerere" };
const dateOnly = (value) => value ? String(value).slice(0, 10) : "";
const formatDate = (value) => dateOnly(value) ? new Date(`${dateOnly(value)}T00:00:00`).toLocaleDateString("ro-RO") : "—";

export default function Index({ revisions, clients = [], filters = {}, today }) {
    const [editing, setEditing] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const { data, setData, post, patch, processing, errors, reset } = useForm({ client_id: "", client_name: "", type: filters.type || "efractie", period: "anuala", last_revision_date: "" });
    const filterForm = useForm({ client: filters.client || "", type: filters.type || "", period: filters.period || "", date_from: filters.date_from || "", date_to: filters.date_to || "", status: filters.status || "" });
    const items = revisions?.data || [];
    const allSelected = items.length > 0 && items.every((revision) => selectedIds.includes(revision.id));

    const toggleSelected = (id) => setSelectedIds((current) => current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id]);
    const toggleAll = () => setSelectedIds(allSelected ? [] : items.map((revision) => revision.id));
    const downloadSelected = (exportRoute) => {
        if (!selectedIds.length) return;
        const query = new URLSearchParams();
        selectedIds.forEach((id) => query.append("revision_ids[]", id));
        window.location.href = `${route(exportRoute)}?${query.toString()}`;
    };
    const applyFilters = (event) => { event.preventDefault(); setSelectedIds([]); filterForm.get(route("revisions.index"), { preserveState: true, replace: true }); };
    const clearFilters = () => { setSelectedIds([]); router.get(route("revisions.index"), {}, { preserveState: true, replace: true }); };

    const clearForm = () => { setEditing(null); reset(); setData({ client_id: "", client_name: "", type: filters.type || "efractie", period: "anuala", last_revision_date: "" }); };
    const submit = (event) => {
        event.preventDefault();
        const options = { preserveScroll: true, onSuccess: clearForm };
        editing ? patch(route("revisions.update", editing.id), options) : post(route("revisions.store"), options);
    };
    const edit = (revision) => { setEditing(revision); setData({ client_id: String(revision.client_id), client_name: revision.client?.name || "", type: revision.type, period: revision.period, last_revision_date: revision.last_revision_date ? String(revision.last_revision_date).slice(0, 10) : "" }); window.scrollTo({ top: 0, behavior: "smooth" }); };
    const dueState = (revision) => {
        if (!revision.next_revision_date) return { label: "La cerere", className: "bg-slate-100 text-slate-700" };
        const diff = Math.ceil((new Date(`${dateOnly(revision.next_revision_date)}T00:00:00`) - new Date(`${dateOnly(today)}T00:00:00`)) / 86400000);
        if (diff < 0) return { label: "Depășită", className: "bg-rose-100 text-rose-700" };
        if (diff <= 30) return { label: "În următoarele 30 zile", className: "bg-amber-100 text-amber-800" };
        return { label: "Programată", className: "bg-emerald-100 text-emerald-700" };
    };

    return <AuthenticatedLayout header={<div><h2 className="text-xl font-semibold leading-tight text-gray-800">Revizii</h2><p className="mt-1 text-sm text-gray-500">Termene pentru reviziile de efracție și incendiu.</p></div>}>
        <Head title="Revizii" />
        <div className="py-8"><div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-lg font-bold text-slate-900">{editing ? "Editează revizia" : "Adaugă revizie"}</h1><p className="mt-1 text-sm text-slate-500">Data următoarei revizii se calculează din perioadă. La finalizarea unei lucrări de revizie, datele se actualizează automat.</p></div>{editing && <button type="button" onClick={clearForm} className="w-fit rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Renunță la editare</button>}</div>
                <form onSubmit={submit} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <label className="block text-sm font-semibold text-slate-700 lg:col-span-2">Client<ClientAutocomplete clients={clients} clientId={data.client_id} value={data.client_name} onChange={(value) => setData({ ...data, client_id: value.client_id, client_name: value.client_name })} error={errors.client_id || errors.client_name} /></label>
                    <label className="block text-sm font-semibold text-slate-700">Tip revizie<select value={data.type} onChange={(event) => setData("type", event.target.value)} className="mt-1 w-full rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"><option value="efractie">Efracție</option><option value="incendiu">Incendiu</option></select>{errors.type && <p className="mt-1 text-sm text-rose-600">{errors.type}</p>}</label>
                    <label className="block text-sm font-semibold text-slate-700">Periodicitate<select value={data.period} onChange={(event) => setData("period", event.target.value)} className="mt-1 w-full rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"><option value="trimestriala">Trimestrială</option><option value="semestriala">Semestrială</option><option value="anuala">Anuală</option><option value="la_cerere">La cerere</option></select>{errors.period && <p className="mt-1 text-sm text-rose-600">{errors.period}</p>}</label>
                    <label className="block text-sm font-semibold text-slate-700">Data ultimei revizii<input type="date" value={data.last_revision_date} onChange={(event) => setData("last_revision_date", event.target.value)} className="mt-1 w-full rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500" />{errors.last_revision_date && <p className="mt-1 text-sm text-rose-600">{errors.last_revision_date}</p>}</label>
                    <div className="flex items-end lg:col-span-3"><button disabled={processing} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50">{processing ? "Se salvează…" : editing ? "Salvează modificările" : "+ Adaugă revizie"}</button></div>
                </form>
            </section>
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <form onSubmit={applyFilters} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <label className="block text-sm font-semibold text-slate-700 lg:col-span-2">Caută client<input value={filterForm.data.client} onChange={(event) => filterForm.setData("client", event.target.value)} placeholder="Numele clientului..." className="mt-1 w-full rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500" /></label>
                    <label className="block text-sm font-semibold text-slate-700">Tip<select value={filterForm.data.type} onChange={(event) => filterForm.setData("type", event.target.value)} className="mt-1 w-full rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"><option value="">Toate</option><option value="efractie">Efracție</option><option value="incendiu">Incendiu</option></select></label>
                    <label className="block text-sm font-semibold text-slate-700">Periodicitate<select value={filterForm.data.period} onChange={(event) => filterForm.setData("period", event.target.value)} className="mt-1 w-full rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"><option value="">Toate</option><option value="trimestriala">Trimestrială</option><option value="semestriala">Semestrială</option><option value="anuala">Anuală</option><option value="la_cerere">La cerere</option></select></label>
                    <label className="block text-sm font-semibold text-slate-700">Următoarea revizie: de la<input type="date" value={filterForm.data.date_from} onChange={(event) => filterForm.setData("date_from", event.target.value)} className="mt-1 w-full rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500" /></label>
                    <label className="block text-sm font-semibold text-slate-700">Până la<input type="date" value={filterForm.data.date_to} onChange={(event) => filterForm.setData("date_to", event.target.value)} className="mt-1 w-full rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500" /></label>
                    <label className="block text-sm font-semibold text-slate-700">Stare<select value={filterForm.data.status} onChange={(event) => filterForm.setData("status", event.target.value)} className="mt-1 w-full rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"><option value="">Toate</option><option value="overdue">Depășită</option><option value="due_soon">În următoarele 30 zile</option><option value="scheduled">Programată</option><option value="on_request">La cerere</option></select></label>
                    <div className="flex items-end gap-2 lg:col-span-2"><button className="rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-700">Filtrează</button><button type="button" onClick={clearFilters} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">Resetează</button></div>
                </form>
            </section>
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5"><div><h1 className="text-lg font-bold text-slate-900">Registru revizii</h1><p className="mt-1 text-sm text-slate-500">Notificarea în aplicație se trimite administratorilor cu cel mult 30 de zile înainte de termen.</p></div>{selectedIds.length > 0 && <div className="flex flex-wrap items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2"><span className="mr-1 text-sm font-bold text-blue-900">{selectedIds.length} selectate</span><button type="button" onClick={() => downloadSelected("revisions.export.excel")} className="rounded-lg border border-emerald-600 bg-white px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50">Export Excel</button><button type="button" onClick={() => downloadSelected("revisions.export.pdf")} className="rounded-lg border border-rose-600 bg-white px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50">Export PDF</button><button type="button" onClick={() => setSelectedIds([])} className="ml-auto text-xs font-bold text-slate-600 hover:text-slate-900">Deselectează</button></div>}</div>
                {items.length === 0 ? <p className="p-10 text-center text-sm text-slate-500">Nu există revizii înregistrate pentru acest filtru.</p> : <div className="overflow-x-auto"><table className="min-w-full divide-y divide-slate-100 text-sm"><thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500"><tr><th className="w-12 px-5 py-3 text-center"><input type="checkbox" checked={allSelected} onChange={toggleAll} aria-label="Selectează toate reviziile" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" /></th><th className="px-5 py-3">Client</th><th className="px-5 py-3">Tip</th><th className="px-5 py-3">Perioadă</th><th className="px-5 py-3">Ultima revizie</th><th className="px-5 py-3">Următoarea revizie</th><th className="px-5 py-3">Stare</th><th className="px-5 py-3"></th></tr></thead><tbody className="divide-y divide-slate-100">{items.map((revision) => { const state = dueState(revision); return <tr key={revision.id} className="hover:bg-slate-50"><td className="px-5 py-4 text-center"><input type="checkbox" checked={selectedIds.includes(revision.id)} onChange={() => toggleSelected(revision.id)} aria-label={`Selectează revizia ${revision.client?.name || revision.id}`} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" /></td><td className="px-5 py-4 font-bold text-slate-900">{revision.client?.name}</td><td className="px-5 py-4 text-slate-700">{labels[revision.type]}</td><td className="px-5 py-4 text-slate-700">{periods[revision.period]}</td><td className="px-5 py-4 text-slate-700">{formatDate(revision.last_revision_date)}</td><td className="px-5 py-4 font-semibold text-slate-800">{revision.next_revision_date ? formatDate(revision.next_revision_date) : "La cerere"}</td><td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${state.className}`}>{state.label}</span></td><td className="px-5 py-4 text-right"><div className="flex justify-end gap-2"><Link href={route("work_orders.create", { client_id: revision.client_id })} className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50">+ Lucrare</Link><button type="button" onClick={() => edit(revision)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100">Editează</button></div></td></tr>; })}</tbody></table></div>}
            </section>
        </div></div>
    </AuthenticatedLayout>;
}
