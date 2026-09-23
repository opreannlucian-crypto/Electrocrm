import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";

const money = (value) => new Intl.NumberFormat("ro-RO", { style: "currency", currency: "RON" }).format(Number(value || 0));

export default function Index({ title, description, columns = [], rows = [], summary = [], moneyColumns = [], kind, filters = {} }) {
    const [data, setData] = useState({ from: filters.from || "", to: filters.to || "" });
    const apply = (event) => { event.preventDefault(); router.get(route("operational-reports.show", kind), data, { preserveState: true, replace: true }); };
    const reset = () => { setData({ from: "", to: "" }); router.get(route("operational-reports.show", kind), {}, { replace: true }); };
    return <AuthenticatedLayout><Head title={title} /><div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6"><h1 className="text-3xl font-bold">{title}</h1><p className="mt-1 text-slate-500">{description}</p></div>
        <div className="mb-6 grid gap-4 sm:grid-cols-3">{summary.map((item, index) => <div key={index} className="rounded-2xl border bg-white p-5"><p className="text-sm text-slate-500">{item.label}</p><p className="mt-1 text-2xl font-bold">{item.money === false ? item.value : money(item.value)}</p></div>)}</div>
        <form onSubmit={apply} className="mb-6 flex flex-wrap gap-3 rounded-2xl border bg-white p-4"><label className="text-sm">De la <input type="date" value={data.from} onChange={(e) => setData({ ...data, from: e.target.value })} className="ml-2 rounded border" /></label><label className="text-sm">Până la <input type="date" value={data.to} onChange={(e) => setData({ ...data, to: e.target.value })} className="ml-2 rounded border" /></label><button className="rounded bg-blue-600 px-4 py-2 font-semibold text-white">Filtrează</button><button type="button" onClick={reset} className="rounded border px-3 py-2">Reset</button></form>
        <div className="overflow-x-auto rounded-2xl border bg-white"><table className="min-w-full text-sm"><thead className="bg-slate-50 text-slate-600"><tr>{columns.map((column, position) => <th key={column} className={moneyColumns.includes(position) ? "whitespace-nowrap px-4 py-3 text-right font-semibold" : "whitespace-nowrap px-4 py-3 text-left font-semibold"}>{column}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index} className="border-t transition hover:bg-slate-50">{row.map((cell, position) => <td key={position} className={moneyColumns.includes(position) ? "whitespace-nowrap px-4 py-3 text-right font-semibold tabular-nums" : "px-4 py-3"}>{columns[position] === "Convertită în factură" ? <span className={String(cell).startsWith("Da") ? "inline-flex whitespace-nowrap rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800" : "inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"}>{cell}</span> : (typeof cell === "number" && moneyColumns.includes(position) ? money(cell) : cell)}</td>)}</tr>)}{rows.length === 0 && <tr><td colSpan={columns.length} className="p-8 text-center text-slate-500">Nu există date pentru perioada aleasă.</td></tr>}</tbody></table></div>
    </div></AuthenticatedLayout>;
}
