import ClientAutocomplete from "@/Components/ClientAutocomplete";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Index({ projects, clients = [] }) {
    const items = projects?.data || [];
    const { data, setData, post, processing, errors, reset } = useForm({
        client_id: "",
        client_name: "",
        name: "",
        description: "",
    });

    const submit = (event) => {
        event.preventDefault();
        post(route("projects.store"), { onSuccess: () => reset() });
    };

    return <AuthenticatedLayout header={<div><h2 className="text-xl font-semibold leading-tight text-gray-800">Proiecte</h2><p className="mt-1 text-sm text-gray-500">Dosare de proiect pentru clienți, cu documente Word și PDF.</p></div>}>
        <Head title="Proiecte" />
        <div className="py-8"><div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5"><h1 className="text-lg font-bold text-slate-900">Proiect nou</h1><p className="mt-1 text-sm text-slate-500">Alege un client existent sau scrie unul nou; clientul nou se salvează automat în nomenclator.</p></div>
                <form onSubmit={submit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <label className="block text-sm font-semibold text-slate-700">Client<ClientAutocomplete clients={clients} clientId={data.client_id} value={data.client_name} onChange={(value) => { setData("client_id", value.client_id); setData("client_name", value.client_name); }} error={errors.client_id || errors.client_name} /></label>
                    <label className="block text-sm font-semibold text-slate-700">Denumirea proiectului<input required value={data.name} onChange={(event) => setData("name", event.target.value)} placeholder="De exemplu: Modernizare instalație electrică" className="mt-1 w-full rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500" />{errors.name && <p className="mt-1 text-sm text-rose-600">{errors.name}</p>}</label>
                    <label className="block text-sm font-semibold text-slate-700 md:col-span-2">Descriere (opțional)<textarea value={data.description} onChange={(event) => setData("description", event.target.value)} rows="3" placeholder="Detalii utile despre proiect..." className="mt-1 w-full rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500" />{errors.description && <p className="mt-1 text-sm text-rose-600">{errors.description}</p>}</label>
                    <div className="md:col-span-2"><button disabled={processing} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50">{processing ? "Se creează…" : "+ Creează proiect"}</button></div>
                </form>
            </section>
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-6 py-5"><h1 className="text-lg font-bold text-slate-900">Lista proiectelor</h1><p className="mt-1 text-sm text-slate-500">{projects?.total ?? items.length} proiect(e) înregistrate.</p></div>
                {items.length === 0 ? <p className="p-10 text-center text-sm text-slate-500">Nu există proiecte încă. Creează primul proiect de mai sus.</p> : <div className="divide-y divide-slate-100">{items.map((project) => <Link key={project.id} href={route("projects.show", project.id)} className="flex flex-col gap-3 px-6 py-5 transition hover:bg-blue-50/50 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-bold text-slate-900">📁 {project.name}</p><p className="mt-1 text-sm text-slate-600">Client: <span className="font-semibold">{project.client?.name}</span></p>{project.description && <p className="mt-1 line-clamp-1 text-sm text-slate-500">{project.description}</p>}</div><div className="shrink-0 text-sm font-semibold text-blue-700">{project.documents_count || 0} document(e) · Deschide →</div></Link>)}</div>}
            </section>
        </div></div>
    </AuthenticatedLayout>;
}
