import DocumentSection from "@/Components/DocumentSection";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";

export default function Show({ project }) {
    return <AuthenticatedLayout header={<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-semibold leading-tight text-gray-800">{project.name}</h2><p className="mt-1 text-sm text-gray-500">Proiect client · {project.client?.name}</p></div><Link href={route("projects.index")} className="inline-flex w-fit rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">← Toate proiectele</Link></div>}>
        <Head title={project.name} />
        <div className="py-8"><div className="mx-auto max-w-5xl space-y-6 px-4 sm:px-6 lg:px-8">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="grid gap-4 sm:grid-cols-2"><div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Client</p><p className="mt-1 text-lg font-bold text-slate-900">{project.client?.name}</p>{project.client?.cui && <p className="mt-1 text-sm text-slate-500">CUI: {project.client.cui}</p>}</div><div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Creat la</p><p className="mt-1 text-lg font-bold text-slate-900">{new Date(project.created_at).toLocaleDateString("ro-RO")}</p></div></div>{project.description && <div className="mt-5 border-t border-slate-100 pt-5"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Descriere</p><p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{project.description}</p></div>}</section>
            <DocumentSection documents={project.documents || []} parentId={project.id} storeRoute="projects.documents.store" downloadRoute="projects.documents.download" destroyRoute="projects.documents.destroy" acceptedFileTypes=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" title="Documentele proiectului" description="Încarcă documente PDF sau Word (.doc, .docx), maximum 20 MB fiecare." />
        </div></div>
    </AuthenticatedLayout>;
}
