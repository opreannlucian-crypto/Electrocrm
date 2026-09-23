import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { useMemo, useState } from "react";

const money = (value) => new Intl.NumberFormat("ro-RO", { style: "currency", currency: "RON" }).format(Number(value || 0));

export default function SupplierBalanceReport({ suppliers = [], totals = {} }) {
    const [search, setSearch] = useState("");
    const rows = useMemo(() => suppliers.filter((supplier) => [supplier.name, supplier.cui].filter(Boolean).join(" ").toLowerCase().includes(search.toLowerCase())), [suppliers, search]);

    return <AuthenticatedLayout><Head title="Sold furnizori" /><div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-3xl font-bold">Raport sold furnizori</h1><p className="mt-1 text-slate-500">Recepții minus plăți către furnizori.</p></div><Link href={route("supplier-payments.index")} className="rounded-lg border px-4 py-2 font-semibold text-slate-700">Registru plăți →</Link></div>
        <div className="mb-6 grid gap-4 md:grid-cols-3"><Card label="Total recepționat" value={money(totals.received_total)} className="bg-slate-800 text-white" /><Card label="Total plătit" value={money(totals.paid_total)} className="bg-emerald-600 text-white" /><Card label="Sold de plată" value={money(totals.balance)} className="bg-amber-50 text-amber-950 ring-1 ring-amber-200" /></div>
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm"><div className="border-b p-5"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Caută furnizor sau CUI..." className="w-full rounded-lg border-slate-300 md:max-w-md" /></div><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-slate-50 text-left text-slate-600"><tr><th className="px-5 py-3">Furnizor</th><th className="px-5 py-3">CUI</th><th className="px-5 py-3 text-right">Recepții</th><th className="px-5 py-3 text-right">Total recepționat</th><th className="px-5 py-3 text-right">Total plătit</th><th className="px-5 py-3 text-right">Sold</th></tr></thead><tbody>{rows.map((supplier) => <tr key={supplier.id} className="border-t"><td className="px-5 py-3 font-semibold">{supplier.name}</td><td className="px-5 py-3 text-slate-500">{supplier.cui || "—"}</td><td className="px-5 py-3 text-right">{supplier.receptions_count}</td><td className="px-5 py-3 text-right">{money(supplier.received_total)}</td><td className="px-5 py-3 text-right text-emerald-700">{money(supplier.paid_total)}</td><td className={supplier.balance > 0 ? "px-5 py-3 text-right font-bold text-amber-700" : "px-5 py-3 text-right font-bold text-emerald-700"}>{money(supplier.balance)}</td></tr>)}{rows.length === 0 && <tr><td colSpan="6" className="px-5 py-8 text-center text-slate-500">Nu există furnizori pentru filtrul ales.</td></tr>}</tbody></table></div></div>
    </div></AuthenticatedLayout>;
}

function Card({ label, value, className }) {
    return <div className={"rounded-2xl p-5 " + className}><div className="text-sm opacity-80">{label}</div><div className="mt-1 text-2xl font-bold">{value}</div></div>;
}
