import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DocumentSection from "@/Components/DocumentSection";
import { Head, Link } from "@inertiajs/react";
import { useMemo, useState } from "react";

export default function Show({
    client,
    history = [],
}) {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    const clientTypeLabels = {
        persoana_fizica: "Persoană fizică",
        persoana_juridica: "Persoană juridică",
        firma: "Firmă",
        pfa: "PFA",
        asociatie: "Asociație",
    };

    const workOrderStatusLabels = {
        noua: "Nouă",
        programata: "Programată",
        lucru: "În lucru",
        finalizata: "Finalizată",
        anulata: "Anulată",
    };

    const quoteStatusLabels = {
        draft: "Ciornă",
        finalizat: "Finalizat",
        trimis: "Trimis",
        acceptat: "Acceptat",
        refuzat: "Refuzat",
    };

    function formatDate(date) {
        if (!date) {
            return "-";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "-";
        }

        return parsedDate.toLocaleDateString("ro-RO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }

    function getHistoryType(item) {
        if (item.type === "work_order") {
            return {
                label: "Lucrare",
                icon: "🔧",
                iconClass:
                    "bg-orange-100 text-orange-700 border-orange-200",
                badgeClass:
                    "bg-orange-50 text-orange-700 border-orange-200",
            };
        }

        if (item.type === "quote") {
            return {
                label: "Deviz",
                icon: "🧾",
                iconClass:
                    "bg-blue-100 text-blue-700 border-blue-200",
                badgeClass:
                    "bg-blue-50 text-blue-700 border-blue-200",
            };
        }

        if (item.type === "offer") {
            return {
                label: "Ofertă",
                icon: "📄",
                iconClass:
                    "bg-purple-100 text-purple-700 border-purple-200",
                badgeClass:
                    "bg-purple-50 text-purple-700 border-purple-200",
            };
        }

        if (item.type === "report") {
            return {
                label: "Proces-verbal",
                icon: "📋",
                iconClass:
                    "bg-emerald-100 text-emerald-700 border-emerald-200",
                badgeClass:
                    "bg-emerald-50 text-emerald-700 border-emerald-200",
            };
        }

        return {
            label: item.type_label || "Document",
            icon: "📁",
            iconClass:
                "bg-slate-100 text-slate-700 border-slate-200",
            badgeClass:
                "bg-slate-50 text-slate-700 border-slate-200",
        };
    }

    function getStatus(item) {
        if (!item.status) {
            return null;
        }

        if (item.type === "work_order") {
            return (
                workOrderStatusLabels[item.status] ||
                item.status
            );
        }

        return (
            quoteStatusLabels[item.status] ||
            item.status
        );
    }

    function getStatusClass(item) {
        const status = item.status;

        if (item.type === "work_order") {
            if (status === "finalizata") {
                return "bg-emerald-100 text-emerald-700 border-emerald-200";
            }

            if (status === "anulata") {
                return "bg-red-100 text-red-700 border-red-200";
            }

            if (status === "lucru") {
                return "bg-orange-100 text-orange-700 border-orange-200";
            }

            if (status === "programata") {
                return "bg-purple-100 text-purple-700 border-purple-200";
            }

            return "bg-blue-100 text-blue-700 border-blue-200";
        }

        if (status === "finalizat" || status === "acceptat") {
            return "bg-emerald-100 text-emerald-700 border-emerald-200";
        }

        if (status === "refuzat") {
            return "bg-red-100 text-red-700 border-red-200";
        }

        if (status === "trimis") {
            return "bg-purple-100 text-purple-700 border-purple-200";
        }

        return "bg-slate-100 text-slate-700 border-slate-200";
    }

    const filteredHistory = useMemo(() => {
        const normalizedSearch = search
            .trim()
            .toLowerCase();

        return history.filter((item) => {
            const matchesFilter =
                filter === "all" ||
                item.type === filter;

            if (!matchesFilter) {
                return false;
            }

            if (!normalizedSearch) {
                return true;
            }

            const searchableText = [
                item.number,
                item.title,
                item.type_label,
                item.type,
                item.status,
                item.scheduled_date,
                item.scheduled_time,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchableText.includes(
                normalizedSearch
            );
        });
    }, [history, search, filter]);

    const clientType =
        clientTypeLabels[client?.type] ||
        client?.type ||
        "Client";

    return (
        <AuthenticatedLayout>
            <Head title={`Client - ${client?.name || ""}`} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* HEADER CLIENT */}

                    <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden">

                        <div className="px-6 sm:px-8 py-7">

                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                                <div className="flex items-center gap-5">

                                    <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-3xl">
                                        👤
                                    </div>

                                    <div>

                                        <div className="text-sm text-slate-400 uppercase tracking-wider font-semibold">
                                            Fișa clientului
                                        </div>

                                        <h1 className="text-3xl sm:text-4xl font-bold text-white mt-1">
                                            {client?.name || "-"}
                                        </h1>

                                        <div className="flex flex-wrap items-center gap-2 mt-3">

                                            <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/20 text-blue-300 text-sm font-semibold">
                                                {clientType}
                                            </span>

                                            {client?.cui && (
                                                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-slate-300 text-sm">
                                                    CUI: {client.cui}
                                                </span>
                                            )}

                                        </div>

                                    </div>

                                </div>

                                <div className="flex flex-wrap gap-3">

                                    <Link
                                        href={route(
                                            "clients.edit",
                                            client.id
                                        )}
                                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white font-semibold transition shadow-sm"
                                    >
                                        ✏️ Editează
                                    </Link>

                                    <Link
                                        href={route(
                                            "clients.index"
                                        )}
                                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold transition"
                                    >
                                        ← Înapoi
                                    </Link>

                                </div>

                            </div>

                        </div>

                    </div>

                    {/* INFORMATII CLIENT */}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

                        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm">

                            <div className="px-6 py-5 border-b border-slate-200">

                                <div className="flex items-center gap-3">

                                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                                        👤
                                    </div>

                                    <div>

                                        <h2 className="text-lg font-bold text-slate-900">
                                            Date client
                                        </h2>

                                        <p className="text-sm text-slate-500">
                                            Informațiile principale ale clientului.
                                        </p>

                                    </div>

                                </div>

                            </div>

                            <div className="p-6">

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">

                                    <div>
                                        <div className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                                            Nume / Denumire
                                        </div>

                                        <div className="mt-1 font-semibold text-slate-900">
                                            {client?.name || "-"}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                                            Tip client
                                        </div>

                                        <div className="mt-1 font-semibold text-slate-900">
                                            {clientType}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                                            CUI
                                        </div>

                                        <div className="mt-1 font-semibold text-slate-900">
                                            {client?.cui || "-"}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                                            Persoană de contact
                                        </div>

                                        <div className="mt-1 font-semibold text-slate-900">
                                            {client?.contact_person || "-"}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                                            Telefon
                                        </div>

                                        <div className="mt-1 font-semibold text-slate-900">
                                            {client?.phone || "-"}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                                            Email
                                        </div>

                                        <div className="mt-1 font-semibold text-slate-900 break-all">
                                            {client?.email || "-"}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                                            Localitate
                                        </div>

                                        <div className="mt-1 font-semibold text-slate-900">
                                            {client?.city || "-"}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                                            Adresă
                                        </div>

                                        <div className="mt-1 font-semibold text-slate-900">
                                            {client?.address || "-"}
                                        </div>
                                    </div>

                                </div>

                                {client?.notes && (
                                    <div className="mt-6 pt-6 border-t border-slate-200">

                                        <div className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                                            Observații
                                        </div>

                                        <div className="mt-2 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-line">
                                            {client.notes}
                                        </div>

                                    </div>
                                )}

                            </div>

                        </div>

                        {/* STATISTICI */}

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">

                            <div className="px-6 py-5 border-b border-slate-200">

                                <h2 className="text-lg font-bold text-slate-900">
                                    Activitate client
                                </h2>

                                <p className="text-sm text-slate-500 mt-1">
                                    Rezumat documente.
                                </p>

                            </div>

                            <div className="p-6 space-y-4">

                                <div className="rounded-xl bg-orange-50 border border-orange-100 p-4">
                                    <div className="text-xs uppercase tracking-wide text-orange-600 font-semibold">
                                        Lucrări
                                    </div>

                                    <div className="text-3xl font-bold text-orange-700 mt-1">
                                        {
                                            history.filter(
                                                (item) =>
                                                    item.type ===
                                                    "work_order"
                                            ).length
                                        }
                                    </div>
                                </div>

                                <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                                    <div className="text-xs uppercase tracking-wide text-blue-600 font-semibold">
                                        Devize
                                    </div>

                                    <div className="text-3xl font-bold text-blue-700 mt-1">
                                        {
                                            history.filter(
                                                (item) =>
                                                    item.type ===
                                                    "quote"
                                            ).length
                                        }
                                    </div>
                                </div>

                                <div className="rounded-xl bg-purple-50 border border-purple-100 p-4">
                                    <div className="text-xs uppercase tracking-wide text-purple-600 font-semibold">
                                        Oferte
                                    </div>

                                    <div className="text-3xl font-bold text-purple-700 mt-1">
                                        {
                                            history.filter(
                                                (item) =>
                                                    item.type ===
                                                    "offer"
                                            ).length
                                        }
                                    </div>
                                </div>

                                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                                    <div className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">
                                        Procese-verbale
                                    </div>

                                    <div className="text-3xl font-bold text-emerald-700 mt-1">
                                        {
                                            history.filter(
                                                (item) =>
                                                    item.type ===
                                                    "report"
                                            ).length
                                        }
                                    </div>
                                </div>

                            </div>

                        </div>

                    </div>

                    {/* ISTORIC CLIENT */}

                    <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

                        <div className="px-6 sm:px-8 py-6 border-b border-slate-200">

                            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">

                                <div className="flex items-center gap-3">

                                    <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xl">
                                        🕘
                                    </div>

                                    <div>

                                        <h2 className="text-xl font-bold text-slate-900">
                                            Istoric client
                                        </h2>

                                        <p className="text-sm text-slate-500 mt-1">
                                            Toate documentele, de la cel mai recent la cel mai vechi.
                                        </p>

                                    </div>

                                </div>

                                <div className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold">
                                    {filteredHistory.length} din {history.length}{" "}
                                    {history.length === 1
                                        ? "document"
                                        : "documente"}
                                </div>

                            </div>

                            {/* CAUTARE SI FILTRARE */}

                            <div className="mt-6 flex flex-col lg:flex-row gap-3">

                                <div className="relative flex-1">

                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-lg text-slate-400">
                                            🔎
                                        </span>
                                    </div>

                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Caută după număr, lucrare, titlu, status..."
                                        className="w-full pl-11 pr-11 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm text-slate-900 placeholder:text-slate-400"
                                    />

                                    {search && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSearch("")
                                            }
                                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-700"
                                            title="Șterge căutarea"
                                        >
                                            ✕
                                        </button>
                                    )}

                                </div>

                                <div className="flex flex-wrap gap-2">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFilter("all")
                                        }
                                        className={`px-4 py-3 rounded-xl text-sm font-semibold border transition ${
                                            filter === "all"
                                                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                                        }`}
                                    >
                                        Toate
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFilter("work_order")
                                        }
                                        className={`px-4 py-3 rounded-xl text-sm font-semibold border transition ${
                                            filter === "work_order"
                                                ? "bg-orange-600 text-white border-orange-600 shadow-sm"
                                                : "bg-white text-slate-600 border-slate-200 hover:bg-orange-50"
                                        }`}
                                    >
                                        🔧 Lucrări
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFilter("quote")
                                        }
                                        className={`px-4 py-3 rounded-xl text-sm font-semibold border transition ${
                                            filter === "quote"
                                                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                                : "bg-white text-slate-600 border-slate-200 hover:bg-blue-50"
                                        }`}
                                    >
                                        🧾 Devize
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFilter("offer")
                                        }
                                        className={`px-4 py-3 rounded-xl text-sm font-semibold border transition ${
                                            filter === "offer"
                                                ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                                                : "bg-white text-slate-600 border-slate-200 hover:bg-purple-50"
                                        }`}
                                    >
                                        📄 Oferte
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFilter("report")
                                        }
                                        className={`px-4 py-3 rounded-xl text-sm font-semibold border transition ${
                                            filter === "report"
                                                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                                : "bg-white text-slate-600 border-slate-200 hover:bg-emerald-50"
                                        }`}
                                    >
                                        📋 Procese-verbale
                                    </button>

                                </div>

                            </div>

                            {(search || filter !== "all") && (
                                <div className="mt-4 flex items-center justify-between gap-3">

                                    <div className="text-sm text-slate-500">
                                        {filteredHistory.length === 0
                                            ? "Nu a fost găsit niciun document."
                                            : `Au fost găsite ${filteredHistory.length} ${
                                                  filteredHistory.length === 1
                                                      ? "document"
                                                      : "documente"
                                              }.`}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch("");
                                            setFilter("all");
                                        }}
                                        className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                                    >
                                        Resetează filtrele
                                    </button>

                                </div>
                            )}

                        </div>

                        {filteredHistory.length === 0 ? (

                            <div className="p-10 text-center">

                                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-3xl">
                                    {history.length === 0
                                        ? "📂"
                                        : "🔎"}
                                </div>

                                <h3 className="mt-4 text-lg font-bold text-slate-900">
                                    {history.length === 0
                                        ? "Nu există activitate"
                                        : "Nu există rezultate"}
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    {history.length === 0
                                        ? "Pentru acest client nu există încă lucrări, devize sau oferte."
                                        : "Încearcă un alt termen de căutare sau resetează filtrele."}
                                </p>

                                {history.length > 0 &&
                                    (search ||
                                        filter !== "all") && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearch("");
                                                setFilter(
                                                    "all"
                                                );
                                            }}
                                            className="mt-5 inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition"
                                        >
                                            Afișează toate documentele
                                        </button>
                                    )}

                            </div>

                        ) : (

                            <div className="p-6 sm:p-8">

                                <div className="relative">

                                    <div className="absolute left-[23px] top-5 bottom-5 w-px bg-slate-200 hidden sm:block"></div>

                                    <div className="space-y-5">

                                        {filteredHistory.map(
                                            (item) => {

                                                const type =
                                                    getHistoryType(
                                                        item
                                                    );

                                                const status =
                                                    getStatus(
                                                        item
                                                    );

                                                return (
                                                    <div
                                                        key={`${item.type}-${item.id}`}
                                                        className="relative flex gap-4"
                                                    >

                                                        <div
                                                            className={`
                                                                relative z-10
                                                                shrink-0
                                                                w-12 h-12
                                                                rounded-xl
                                                                border
                                                                flex
                                                                items-center
                                                                justify-center
                                                                text-xl
                                                                ${type.iconClass}
                                                            `}
                                                        >
                                                            {
                                                                type.icon
                                                            }
                                                        </div>

                                                        <div className="flex-1 min-w-0">

                                                            <div className="border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:border-slate-300 transition bg-white">

                                                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

                                                                    <div className="min-w-0">

                                                                        <div className="flex flex-wrap items-center gap-2">

                                                                            <span
                                                                                className={`
                                                                                    px-2.5
                                                                                    py-1
                                                                                    rounded-full
                                                                                    border
                                                                                    text-xs
                                                                                    font-bold
                                                                                    ${type.badgeClass}
                                                                                `}
                                                                            >
                                                                                {
                                                                                    type.label
                                                                                }
                                                                            </span>

                                                                            {status && (
                                                                                <span
                                                                                    className={`
                                                                                        px-2.5
                                                                                        py-1
                                                                                        rounded-full
                                                                                        border
                                                                                        text-xs
                                                                                        font-semibold
                                                                                        ${getStatusClass(
                                                                                            item
                                                                                        )}
                                                                                    `}
                                                                                >
                                                                                    {
                                                                                        status
                                                                                    }
                                                                                </span>
                                                                            )}

                                                                        </div>

                                                                        <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">

                                                                            <h3 className="text-lg font-bold text-slate-900">
                                                                                {
                                                                                    item.number
                                                                                }
                                                                            </h3>

                                                                            <span className="text-sm text-slate-500">
                                                                                {
                                                                                    item.title ||
                                                                                    "-"
                                                                                }
                                                                            </span>

                                                                        </div>

                                                                        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">

                                                                            <span className="inline-flex items-center gap-1.5">
                                                                                📅{" "}
                                                                                {formatDate(
                                                                                    item.date
                                                                                )}
                                                                            </span>

                                                                            {item.scheduled_date && (
                                                                                <span className="inline-flex items-center gap-1.5">
                                                                                    🛠️{" "}
                                                                                    Programată:{" "}
                                                                                    {formatDate(
                                                                                        item.scheduled_date
                                                                                    )}
                                                                                </span>
                                                                            )}

                                                                            {item.scheduled_time && (
                                                                                <span className="inline-flex items-center gap-1.5">
                                                                                    🕐{" "}
                                                                                    {
                                                                                        item.scheduled_time
                                                                                    }
                                                                                </span>
                                                                            )}

                                                                        </div>

                                                                    </div>

                                                                    <div className="shrink-0">

                                                                        <Link
                                                                            href={
                                                                                item.url
                                                                            }
                                                                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition"
                                                                        >
                                                                            Vezi documentul
                                                                            <span>
                                                                                →
                                                                            </span>
                                                                        </Link>

                                                                    </div>

                                                                </div>

                                                            </div>

                                                        </div>

                                                    </div>
                                                );
                                            }
                                        )}

                                    </div>

                                </div>

                            </div>

                        )}

                    </div>

                    <div className="mt-8">
                        <DocumentSection
                            title="Documente client"
                            documents={client?.documents || []}
                            parentId={client.id}
                            storeRoute="clients.documents.store"
                            downloadRoute="clients.documents.download"
                            destroyRoute="clients.documents.destroy"
                        />
                    </div>

                    {/* FOOTER ACTIONS */}

                    <div className="mt-6 flex flex-wrap gap-3">

                        <Link
                            href={route(
                                "clients.edit",
                                client.id
                            )}
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white font-semibold transition"
                        >
                            ✏️ Editează clientul
                        </Link>

                        <Link
                            href={route("clients.index")}
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-semibold transition"
                        >
                            ← Lista clienți
                        </Link>

                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
