import { router, useForm } from "@inertiajs/react";
import { useState } from "react";

const iconFor = (name = "") => {
    const extension = name.split(".").pop()?.toLowerCase();
    if (extension === "pdf") return "📕";
    if (["doc", "docx", "odt"].includes(extension)) return "📘";
    if (["xls", "xlsx", "csv", "ods"].includes(extension)) return "📗";
    if (["png", "jpg", "jpeg", "webp", "heic"].includes(extension)) return "🖼️";
    return "📄";
};

const fileSize = (bytes) => bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

export default function DocumentSection({ documents = [], parentId, storeRoute, downloadRoute, destroyRoute, canDelete = true, title = "Documente", acceptedFileTypes = "", description = "Încarcă PDF, Word, Excel, imagini sau alte fișiere, maximum 20 MB fiecare." }) {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const { data, setData, post, processing, errors, reset } = useForm({ documents: [] });
    const upload = (event) => { event.preventDefault(); post(route(storeRoute, parentId), { forceFormData: true, preserveScroll: true, onSuccess: () => { reset(); setSelectedFiles([]); } }); };
    const chooseFiles = (event) => { const files = Array.from(event.target.files || []); setSelectedFiles(files); setData("documents", files); };

    return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 px-6 py-5"><h2 className="text-lg font-bold text-slate-900">📁 {title}</h2><p className="mt-1 text-sm text-slate-500">{description}</p></div><div className="p-6"><form onSubmit={upload} className="rounded-xl border border-dashed border-blue-300 bg-blue-50/40 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><label className="inline-flex cursor-pointer items-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"><input type="file" multiple accept={acceptedFileTypes} onChange={chooseFiles} className="sr-only" />Alege fișiere</label>{selectedFiles.length > 0 && <p className="mt-2 text-xs text-slate-600">{selectedFiles.length} fișier(e) selectat(e)</p>}</div><button type="submit" disabled={processing || selectedFiles.length === 0} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{processing ? "Se încarcă…" : "Încarcă documentele"}</button></div>{errors.documents && <p className="mt-3 text-sm font-semibold text-rose-700">{errors.documents}</p>}</form>{documents.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">Nu sunt documente încărcate.</p> : <div className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-200">{documents.map((document) => <div key={document.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"><div className="flex min-w-0 items-center gap-3"><span className="text-2xl">{iconFor(document.original_name)}</span><div className="min-w-0"><p className="truncate font-semibold text-slate-800">{document.original_name}</p><p className="mt-0.5 text-xs text-slate-500">{fileSize(Number(document.size || 0))} · încărcat {new Date(document.created_at).toLocaleDateString("ro-RO")}</p></div></div><div className="flex gap-2"><a href={route(downloadRoute, [parentId, document.id])} className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50">Descarcă</a>{canDelete && <button type="button" onClick={() => { if (window.confirm(`Ștergi documentul „${document.original_name}”?`)) router.delete(route(destroyRoute, [parentId, document.id]), { preserveScroll: true }); }} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50">Șterge</button>}</div></div>)}</div>}</div></section>;
}
