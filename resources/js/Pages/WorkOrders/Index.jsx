import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useMemo, useState } from "react";

export default function Index({ workOrders }) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("toate");
    const [priorityFilter, setPriorityFilter] = useState("toate");
    const [employeeFilter, setEmployeeFilter] = useState("toti");

    const statusLabels = {
        noua: "Nouă",
        programata: "Programată",
        lucru: "În lucru",
        finalizata: "Finalizată",
        anulata: "Anulată",
    };

    const priorityLabels = {
        scazuta: "Scăzută",
        normala: "Normală",
        ridicata: "Ridicată",
        urgenta: "Urgentă",
    };

    const statusClasses = {
        noua: "bg-blue-50 text-blue-700 border-blue-200",
        programata: "bg-amber-50 text-amber-700 border-amber-200",
        lucru: "bg-orange-50 text-orange-700 border-orange-200",
        finalizata: "bg-emerald-50 text-emerald-700 border-emerald-200",
        anulata: "bg-red-50 text-red-700 border-red-200",
    };

    const priorityClasses = {
        scazuta: "bg-slate-100 text-slate-600 border-slate-200",
        normala: "bg-blue-50 text-blue-600 border-blue-200",
        ridicata: "bg-orange-50 text-orange-700 border-orange-200",
        urgenta: "bg-red-50 text-red-700 border-red-200",
    };

    const items = Array.isArray(workOrders?.data)
        ? workOrders.data
        : Array.isArray(workOrders)
        ? workOrders
        : [];

    const employees = useMemo(() => {
        const map = new Map();

        items.forEach((workOrder) => {
            if (workOrder.employee?.id) {
                map.set(
                    workOrder.employee.id,
                    workOrder.employee.name
                );
            }
        });

        return Array.from(map.entries()).sort((a, b) =>
            a[1].localeCompare(b[1])
        );
    }, [items]);

    const filteredWorkOrders = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return items.filter((workOrder) => {
            const clientName =
                workOrder.client?.name || "";

            const employeeName =
                workOrder.employee?.name || "";

            const searchableText = [
                workOrder.number,
                workOrder.type,
                workOrder.address,
                workOrder.contact_person,
                workOrder.phone,
                clientName,
                employeeName,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                !normalizedSearch ||
                searchableText.includes(normalizedSearch);

            const matchesStatus =
                statusFilter === "toate" ||
                workOrder.status === statusFilter;

            const matchesPriority =
                priorityFilter === "toate" ||
                workOrder.priority === priorityFilter;

            const matchesEmployee =
                employeeFilter === "toti" ||
                String(workOrder.employee_id) ===
                    String(employeeFilter);

            return (
                matchesSearch &&
                matchesStatus &&
                matchesPriority &&
                matchesEmployee
            );
        });
    }, [
        items,
        search,
        statusFilter,
        priorityFilter,
        employeeFilter,
    ]);

    const statistics = useMemo(() => {
        return {
            total: items.length,
            noua: items.filter(
                (item) => item.status === "noua"
            ).length,
            programata: items.filter(
                (item) => item.status === "programata"
            ).length,
            lucru: items.filter(
                (item) => item.status === "lucru"
            ).length,
            finalizata: items.filter(
                (item) => item.status === "finalizata"
            ).length,
        };
    }, [items]);

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

    function clearFilters() {
        setSearch("");
        setStatusFilter("toate");
        setPriorityFilter("toate");
        setEmployeeFilter("toti");
    }

    function deleteWorkOrder(id) {
        if (
            confirm(
                "Sigur dorești ștergerea acestei lucrări?"
            )
        ) {
            router.delete(
                route("work_orders.destroy", id)
            );
        }
    }

    function changeStatus(id, status) {
        router.post(
            route("work_orders.status", id),
            {
                status,
            },
            {
                preserveScroll: true,
            }
        );
    }

    const hasFilters =
        search ||
        statusFilter !== "toate" ||
        priorityFilter !== "toate" ||
        employeeFilter !== "toti";

    return (
        <AuthenticatedLayout>
            <Head title="Lucrări" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* HEADER */}

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-7">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl shadow-sm">
                                    🔧
                                </div>

                                <div>
                                    <h1 className="text-3xl font-bold text-slate-900">
                                        Lucrări
                                    </h1>

                                    <p className="text-sm text-slate-500 mt-1">
                                        Gestionează lucrările,
                                        programările și intervențiile.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Link
                            href={route(
                                "work_orders.create"
                            )}
                            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-sm transition"
                        >
                            <span className="text-lg">
                                +
                            </span>
                            Lucrare nouă
                        </Link>
                    </div>

                    {/* STATISTICI */}

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">

                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-wide font-semibold text-slate-400">
                                        Total
                                    </p>

                                    <p className="text-3xl font-bold text-slate-900 mt-1">
                                        {statistics.total}
                                    </p>
                                </div>

                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                    📋
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                            <p className="text-xs uppercase tracking-wide font-semibold text-blue-500">
                                Noi
                            </p>

                            <p className="text-3xl font-bold text-blue-700 mt-1">
                                {statistics.noua}
                            </p>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                            <p className="text-xs uppercase tracking-wide font-semibold text-amber-500">
                                Programate
                            </p>

                            <p className="text-3xl font-bold text-amber-700 mt-1">
                                {statistics.programata}
                            </p>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                            <p className="text-xs uppercase tracking-wide font-semibold text-orange-500">
                                În lucru
                            </p>

                            <p className="text-3xl font-bold text-orange-700 mt-1">
                                {statistics.lucru}
                            </p>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                            <p className="text-xs uppercase tracking-wide font-semibold text-emerald-500">
                                Finalizate
                            </p>

                            <p className="text-3xl font-bold text-emerald-700 mt-1">
                                {statistics.finalizata}
                            </p>
                        </div>

                    </div>

                    {/* FILTRE */}

                    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mb-6">

                        <div className="flex flex-col xl:flex-row gap-4">

                            <div className="flex-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    🔎
                                </div>

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Caută după număr, client, lucrare, telefon, adresă..."
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none transition"
                                />
                            </div>

                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(
                                        e.target.value
                                    )
                                }
                                className="w-full xl:w-48 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none"
                            >
                                <option value="toate">
                                    Toate statusurile
                                </option>

                                <option value="noua">
                                    Nouă
                                </option>

                                <option value="programata">
                                    Programată
                                </option>

                                <option value="lucru">
                                    În lucru
                                </option>

                                <option value="finalizata">
                                    Finalizată
                                </option>

                                <option value="anulata">
                                    Anulată
                                </option>
                            </select>

                            <select
                                value={priorityFilter}
                                onChange={(e) =>
                                    setPriorityFilter(
                                        e.target.value
                                    )
                                }
                                className="w-full xl:w-48 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none"
                            >
                                <option value="toate">
                                    Toate prioritățile
                                </option>

                                <option value="scazuta">
                                    Scăzută
                                </option>

                                <option value="normala">
                                    Normală
                                </option>

                                <option value="ridicata">
                                    Ridicată
                                </option>

                                <option value="urgenta">
                                    Urgentă
                                </option>
                            </select>

                            <select
                                value={employeeFilter}
                                onChange={(e) =>
                                    setEmployeeFilter(
                                        e.target.value
                                    )
                                }
                                className="w-full xl:w-48 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none"
                            >
                                <option value="toti">
                                    Toți angajații
                                </option>

                                {employees.map(
                                    ([id, name]) => (
                                        <option
                                            key={id}
                                            value={id}
                                        >
                                            {name}
                                        </option>
                                    )
                                )}
                            </select>

                            {hasFilters && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold transition whitespace-nowrap"
                                >
                                    Resetare
                                </button>
                            )}

                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                            <div className="text-sm text-slate-500">
                                Se afișează{" "}
                                <span className="font-bold text-slate-800">
                                    {filteredWorkOrders.length}
                                </span>{" "}
                                din{" "}
                                <span className="font-bold text-slate-800">
                                    {items.length}
                                </span>{" "}
                                lucrări
                            </div>
                        </div>

                    </div>

                    {/* LISTA */}

                    {filteredWorkOrders.length === 0 ? (

                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-12 text-center">

                            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-3xl">
                                🔍
                            </div>

                            <h2 className="text-lg font-bold text-slate-900 mt-4">
                                Nu am găsit lucrări
                            </h2>

                            <p className="text-sm text-slate-500 mt-1">
                                Încearcă să modifici criteriile
                                de căutare sau filtrele.
                            </p>

                            {hasFilters && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="mt-5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition"
                                >
                                    Resetează filtrele
                                </button>
                            )}

                        </div>

                    ) : (

                        <div className="space-y-4">

                            {filteredWorkOrders.map(
                                (workOrder) => {

                                    const status =
                                        workOrder.status ||
                                        "noua";

                                    const priority =
                                        workOrder.priority ||
                                        "normala";

                                    return (
                                        <div
                                            key={workOrder.id}
                                            className="group bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 transition overflow-hidden"
                                        >

                                            <div className="p-5 sm:p-6">

                                                {/* RANDUL PRINCIPAL */}

                                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

                                                    {/* IDENTITATE */}

                                                    <div className="lg:col-span-4 min-w-0">

                                                        <div className="flex items-start gap-4">

                                                            <div className="shrink-0 w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xl">
                                                                🔧
                                                            </div>

                                                            <div className="min-w-0 flex-1">

                                                                <div className="flex flex-wrap items-center gap-2">

                                                                    <span className="text-lg font-bold text-slate-900 break-all">
                                                                        {workOrder.number ||
                                                                            "-"}
                                                                    </span>

                                                                </div>

                                                                <h2 className="mt-1 text-base font-semibold text-slate-700 break-words">
                                                                    {workOrder.type ||
                                                                        "Lucrare"}
                                                                </h2>

                                                                <div className="mt-3 flex flex-wrap gap-2">

                                                                    <span
                                                                        className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-bold ${
                                                                            statusClasses[
                                                                                status
                                                                            ] ||
                                                                            "bg-slate-100 text-slate-600 border-slate-200"
                                                                        }`}
                                                                    >
                                                                        {statusLabels[
                                                                            status
                                                                        ] ||
                                                                            status}
                                                                    </span>

                                                                    <span
                                                                        className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${
                                                                            priorityClasses[
                                                                                priority
                                                                            ] ||
                                                                            "bg-slate-100 text-slate-600 border-slate-200"
                                                                        }`}
                                                                    >
                                                                        {priorityLabels[
                                                                            priority
                                                                        ] ||
                                                                            priority}
                                                                    </span>

                                                                </div>

                                                            </div>

                                                        </div>

                                                    </div>

                                                    {/* CLIENT */}

                                                    <div className="lg:col-span-3 min-w-0">

                                                        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 min-h-[96px]">

                                                            <div className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                                                                Client
                                                            </div>

                                                            <div className="mt-2 font-semibold text-slate-900 break-words">
                                                                {workOrder.client?.name ||
                                                                    "-"}
                                                            </div>

                                                            {workOrder.client?.phone && (
                                                                <div className="text-sm text-slate-500 mt-2">
                                                                    📞{" "}
                                                                    {
                                                                        workOrder
                                                                            .client
                                                                            .phone
                                                                    }
                                                                </div>
                                                            )}

                                                        </div>

                                                    </div>

                                                    {/* PROGRAMARE */}

                                                    <div className="lg:col-span-2 min-w-0">

                                                        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 min-h-[96px]">

                                                            <div className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                                                                Programare
                                                            </div>

                                                            <div className="mt-2 font-semibold text-slate-900">
                                                                {formatDate(
                                                                    workOrder.scheduled_date
                                                                )}
                                                            </div>

                                                            {workOrder.scheduled_time && (
                                                                <div className="text-sm text-slate-500 mt-2">
                                                                    🕐{" "}
                                                                    {
                                                                        workOrder.scheduled_time
                                                                    }
                                                                </div>
                                                            )}

                                                        </div>

                                                    </div>

                                                    {/* RESPONSABIL */}

                                                    <div className="lg:col-span-3 min-w-0">

                                                        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 min-h-[96px]">

                                                            <div className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                                                                Responsabil
                                                            </div>

                                                            <div className="mt-2 font-semibold text-slate-900 break-words">
                                                                {workOrder.employee?.name ||
                                                                    "Nealocat"}
                                                            </div>

                                                            {workOrder.contact_person && (
                                                                <div className="text-sm text-slate-500 mt-2 break-words">
                                                                    👤{" "}
                                                                    {
                                                                        workOrder.contact_person
                                                                    }
                                                                </div>
                                                            )}

                                                        </div>

                                                    </div>

                                                </div>

                                                {/* INFORMATII SUPLIMENTARE */}

                                                <div className="mt-5 pt-4 border-t border-slate-100">

                                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                                                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500 min-w-0">

                                                            {workOrder.address && (
                                                                <span className="inline-flex items-center gap-1.5 break-words">
                                                                    📍{" "}
                                                                    {
                                                                        workOrder.address
                                                                    }
                                                                </span>
                                                            )}

                                                            {workOrder.phone && (
                                                                <span className="inline-flex items-center gap-1.5">
                                                                    📞{" "}
                                                                    {
                                                                        workOrder.phone
                                                                    }
                                                                </span>
                                                            )}

                                                            <span className="inline-flex items-center gap-1.5">
                                                                📅 Creată:{" "}
                                                                {formatDate(
                                                                    workOrder.created_at
                                                                )}
                                                            </span>

                                                        </div>

                                                        {/* ACTIUNI */}

                                                        <div className="flex flex-wrap gap-2 lg:justify-end shrink-0">

                                                            <Link
                                                                href={route(
                                                                    "work_orders.show",
                                                                    workOrder.id
                                                                )}
                                                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition"
                                                            >
                                                                👁️ Vezi
                                                            </Link>

                                                            <Link
                                                                href={route(
                                                                    "work_orders.edit",
                                                                    workOrder.id
                                                                )}
                                                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold transition"
                                                            >
                                                                ✏️ Editează
                                                            </Link>

                                                            <a
                                                                href={route(
                                                                    "work_orders.report",
                                                                    workOrder.id
                                                                )}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-semibold transition"
                                                            >
                                                                📄 PV
                                                            </a>

                                                        </div>

                                                    </div>

                                                </div>

                                                {/* STATUS + STERGERE */}

                                                <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                                                    <div className="text-xs text-slate-400">
                                                        ID lucrare:{" "}
                                                        <span className="font-semibold text-slate-500">
                                                            #{workOrder.id}
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2">

                                                        <select
                                                            value={status}
                                                            onChange={(e) =>
                                                                changeStatus(
                                                                    workOrder.id,
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 focus:border-slate-400 focus:ring-2 focus:ring-slate-100 outline-none"
                                                        >
                                                            <option value="noua">
                                                                Nouă
                                                            </option>

                                                            <option value="programata">
                                                                Programată
                                                            </option>

                                                            <option value="lucru">
                                                                În lucru
                                                            </option>

                                                            <option value="finalizata">
                                                                Finalizată
                                                            </option>

                                                            <option value="anulata">
                                                                Anulată
                                                            </option>
                                                        </select>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                deleteWorkOrder(
                                                                    workOrder.id
                                                                )
                                                            }
                                                            className="px-3 py-2 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition"
                                                        >
                                                            Șterge
                                                        </button>

                                                    </div>

                                                </div>

                                            </div>

                                        </div>
                                    );
                                }
                            )}

                        </div>

                    )}

                    {/* PAGINARE */}

                    {workOrders?.links &&
                        workOrders.links.length > 3 && (
                            <div className="mt-6 bg-white border border-slate-200 rounded-2xl shadow-sm p-4">

                                <div className="flex flex-wrap justify-center gap-2">

                                    {workOrders.links.map(
                                        (link, index) => {

                                            const label =
                                                link.label
                                                    .replace(
                                                        "&laquo; Previous",
                                                        "←"
                                                    )
                                                    .replace(
                                                        "Next &raquo;",
                                                        "→"
                                                    );

                                            if (!link.url) {
                                                return (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-2 rounded-lg bg-slate-50 text-slate-300 text-sm"
                                                        dangerouslySetInnerHTML={{
                                                            __html: label,
                                                        }}
                                                    />
                                                );
                                            }

                                            return (
                                                <Link
                                                    key={index}
                                                    href={link.url}
                                                    preserveScroll
                                                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                                                        link.active
                                                            ? "bg-slate-900 text-white"
                                                            : "bg-slate-50 hover:bg-slate-100 text-slate-600"
                                                    }`}
                                                    dangerouslySetInnerHTML={{
                                                        __html: label,
                                                    }}
                                                />
                                            );
                                        }
                                    )}

                                </div>

                            </div>
                        )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}