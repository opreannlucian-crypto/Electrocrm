import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useMemo, useState } from "react";

export default function Calendar({ events = [] }) {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("toate");
    const [employeeFilter, setEmployeeFilter] = useState("toti");

    const statusLabels = {
        noua: "Nouă",
        programata: "Programată",
        lucru: "În lucru",
        finalizata: "Finalizată",
        anulata: "Anulată",
    };

    const statusColors = {
        noua: "#3b82f6",
        programata: "#eab308",
        lucru: "#f97316",
        finalizata: "#22c55e",
        anulata: "#ef4444",
    };

    const employees = useMemo(() => {
        const unique = new Map();

        events.forEach((event) => {
            const employee = event.extendedProps?.employee;

            if (employee && employee !== "-") {
                unique.set(employee, employee);
            }
        });

        return Array.from(unique.values()).sort((a, b) =>
            a.localeCompare(b, "ro")
        );
    }, [events]);

    const filteredEvents = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return events.filter((event) => {
            const props = event.extendedProps || {};

            const searchableText = [
                event.title,
                props.number,
                props.client,
                props.phone,
                props.address,
                props.employee,
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                !normalizedSearch ||
                searchableText.includes(normalizedSearch);

            const matchesStatus =
                statusFilter === "toate" ||
                props.status === statusFilter;

            const matchesEmployee =
                employeeFilter === "toti" ||
                props.employee === employeeFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesEmployee
            );
        });
    }, [events, search, statusFilter, employeeFilter]);

    const statistics = useMemo(() => {
        return {
            total: filteredEvents.length,
            noua: filteredEvents.filter(
                (event) =>
                    event.extendedProps?.status === "noua"
            ).length,
            programata: filteredEvents.filter(
                (event) =>
                    event.extendedProps?.status === "programata"
            ).length,
            lucru: filteredEvents.filter(
                (event) =>
                    event.extendedProps?.status === "lucru"
            ).length,
            finalizata: filteredEvents.filter(
                (event) =>
                    event.extendedProps?.status === "finalizata"
            ).length,
        };
    }, [filteredEvents]);

    function handleEventClick(info) {
        const eventId = info.event.id;

        if (!eventId) {
            return;
        }

        router.visit(
            route("work_orders.show", eventId)
        );
    }

    function renderEventContent(eventInfo) {
        const props =
            eventInfo.event.extendedProps || {};

        const status =
            props.status || "noua";

        const color =
            statusColors[status] || "#64748b";

        return (
            <div
                className="w-full overflow-hidden rounded-lg px-2 py-1.5 cursor-pointer"
                style={{
                    borderLeft: `4px solid ${color}`,
                    backgroundColor: `${color}18`,
                }}
            >
                <div className="flex items-center gap-1.5">
                    <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                            backgroundColor: color,
                        }}
                    />

                    <span className="text-[11px] font-bold text-slate-700 truncate">
                        {eventInfo.timeText || "09:00"}
                    </span>
                </div>

                <div className="mt-0.5 text-xs font-bold text-slate-900 truncate">
                    {props.number ||
                        eventInfo.event.title}
                </div>

                {props.client && (
                    <div className="text-[11px] text-slate-600 truncate">
                        {props.client}
                    </div>
                )}
            </div>
        );
    }

    return (
        <AuthenticatedLayout>
            <Head title="Calendar lucrări" />

            <div className="min-h-screen bg-slate-50 py-6">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">

                    {/* HEADER */}

                    <div className="bg-slate-900 rounded-3xl shadow-xl overflow-hidden">
                        <div className="px-6 sm:px-8 py-7">

                            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">

                                <div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-2xl">
                                            📅
                                        </div>

                                        <div>
                                            <div className="text-xs uppercase tracking-[0.2em] font-bold text-blue-300">
                                                ELECTRODEP
                                            </div>

                                            <h1 className="text-2xl sm:text-3xl font-bold text-white">
                                                Calendar lucrări
                                            </h1>
                                        </div>
                                    </div>

                                    <p className="text-sm text-slate-400 mt-4">
                                        Planifică și urmărește lucrările programate.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        router.visit(
                                            route(
                                                "work_orders.create"
                                            )
                                        )
                                    }
                                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg transition"
                                >
                                    <span className="text-lg">
                                        +
                                    </span>
                                    Lucrare nouă
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* STATISTICI */}

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                            <div className="text-xs uppercase tracking-wide font-bold text-slate-400">
                                Total afișate
                            </div>

                            <div className="text-2xl font-bold text-slate-900 mt-1">
                                {statistics.total}
                            </div>
                        </div>

                        <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4">
                            <div className="text-xs uppercase tracking-wide font-bold text-blue-600">
                                Noi
                            </div>

                            <div className="text-2xl font-bold text-blue-700 mt-1">
                                {statistics.noua}
                            </div>
                        </div>

                        <div className="bg-yellow-50 rounded-2xl border border-yellow-100 p-4">
                            <div className="text-xs uppercase tracking-wide font-bold text-yellow-600">
                                Programate
                            </div>

                            <div className="text-2xl font-bold text-yellow-700 mt-1">
                                {statistics.programata}
                            </div>
                        </div>

                        <div className="bg-orange-50 rounded-2xl border border-orange-100 p-4">
                            <div className="text-xs uppercase tracking-wide font-bold text-orange-600">
                                În lucru
                            </div>

                            <div className="text-2xl font-bold text-orange-700 mt-1">
                                {statistics.lucru}
                            </div>
                        </div>

                        <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-4">
                            <div className="text-xs uppercase tracking-wide font-bold text-emerald-600">
                                Finalizate
                            </div>

                            <div className="text-2xl font-bold text-emerald-700 mt-1">
                                {statistics.finalizata}
                            </div>
                        </div>

                    </div>

                    {/* FILTRE */}

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mt-6 p-5">

                        <div className="flex flex-col xl:flex-row gap-4">

                            {/* SEARCH */}

                            <div className="relative flex-1">
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
                                    placeholder="Caută după client, număr lucrare, telefon, adresă..."
                                    className="w-full pl-11 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 text-sm"
                                />

                                {search && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSearch("")
                                        }
                                        className="absolute inset-y-0 right-0 pr-4 text-slate-400 hover:text-slate-700"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            {/* STATUS */}

                            <div className="xl:w-56">
                                <select
                                    value={statusFilter}
                                    onChange={(e) =>
                                        setStatusFilter(
                                            e.target.value
                                        )
                                    }
                                    className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 text-sm font-semibold"
                                >
                                    <option value="toate">
                                        Toate statusurile
                                    </option>

                                    {Object.entries(
                                        statusLabels
                                    ).map(
                                        ([
                                            value,
                                            label,
                                        ]) => (
                                            <option
                                                key={value}
                                                value={value}
                                            >
                                                {label}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            {/* ANGAJAT */}

                            <div className="xl:w-56">
                                <select
                                    value={employeeFilter}
                                    onChange={(e) =>
                                        setEmployeeFilter(
                                            e.target.value
                                        )
                                    }
                                    className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 text-sm font-semibold"
                                >
                                    <option value="toti">
                                        Toți angajații
                                    </option>

                                    {employees.map(
                                        (employee) => (
                                            <option
                                                key={
                                                    employee
                                                }
                                                value={
                                                    employee
                                                }
                                            >
                                                {employee}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            {/* RESET */}

                            {(search ||
                                statusFilter !==
                                    "toate" ||
                                employeeFilter !==
                                    "toti") && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch("");
                                        setStatusFilter(
                                            "toate"
                                        );
                                        setEmployeeFilter(
                                            "toti"
                                        );
                                    }}
                                    className="px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition"
                                >
                                    Resetează filtrele
                                </button>
                            )}

                        </div>

                        {/* LEGENDĂ */}

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5 pt-4 border-t border-slate-100">

                            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                Status:
                            </span>

                            {Object.entries(
                                statusLabels
                            ).map(
                                ([value, label]) => (
                                    <div
                                        key={value}
                                        className="flex items-center gap-2 text-xs font-semibold text-slate-600"
                                    >
                                        <span
                                            className="w-2.5 h-2.5 rounded-full"
                                            style={{
                                                backgroundColor:
                                                    statusColors[
                                                        value
                                                    ],
                                            }}
                                        />

                                        {label}
                                    </div>
                                )
                            )}

                        </div>

                    </div>

                    {/* CALENDAR */}

                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm mt-6 overflow-hidden">

                        <div className="p-4 sm:p-6">

                            <style>{`
                                .electro-calendar .fc {
                                    font-family: inherit;
                                }

                                .electro-calendar .fc-toolbar-title {
                                    font-size: 1.25rem;
                                    font-weight: 800;
                                    color: #0f172a;
                                }

                                .electro-calendar .fc-button {
                                    background: #0f172a;
                                    border-color: #0f172a;
                                    box-shadow: none;
                                    font-weight: 700;
                                    border-radius: 10px;
                                    padding: 8px 12px;
                                }

                                .electro-calendar .fc-button:hover {
                                    background: #1e293b;
                                    border-color: #1e293b;
                                }

                                .electro-calendar .fc-button-primary:not(:disabled).fc-button-active {
                                    background: #2563eb;
                                    border-color: #2563eb;
                                }

                                .electro-calendar .fc-today-button {
                                    background: #e2e8f0;
                                    color: #334155;
                                    border-color: #e2e8f0;
                                }

                                .electro-calendar .fc-col-header-cell {
                                    background: #f8fafc;
                                    padding: 10px 0;
                                }

                                .electro-calendar .fc-col-header-cell-cushion {
                                    color: #475569;
                                    font-size: 12px;
                                    font-weight: 800;
                                    text-transform: uppercase;
                                    letter-spacing: .05em;
                                }

                                .electro-calendar .fc-daygrid-day-number {
                                    color: #475569;
                                    font-weight: 700;
                                    padding: 8px;
                                }

                                .electro-calendar .fc-day-today {
                                    background: #eff6ff !important;
                                }

                                .electro-calendar .fc-timegrid-slot-label {
                                    color: #64748b;
                                    font-size: 12px;
                                }

                                .electro-calendar .fc-event {
                                    border: none;
                                    background: transparent;
                                    padding: 1px;
                                }

                                .electro-calendar .fc-event:hover {
                                    filter: brightness(.97);
                                }

                                .electro-calendar .fc-list-event {
                                    cursor: pointer;
                                }

                                .electro-calendar .fc-list-event:hover td {
                                    background: #f8fafc;
                                }

                                @media (max-width: 640px) {
                                    .electro-calendar .fc-toolbar {
                                        flex-direction: column;
                                        gap: 10px;
                                    }

                                    .electro-calendar .fc-toolbar-chunk {
                                        display: flex;
                                        justify-content: center;
                                    }

                                    .electro-calendar .fc-toolbar-title {
                                        font-size: 1.1rem;
                                    }
                                }
                            `}</style>

                            <div className="electro-calendar">
                                <FullCalendar
                                    plugins={[
                                        dayGridPlugin,
                                        timeGridPlugin,
                                        interactionPlugin,
                                    ]}
                                    initialView="dayGridMonth"
                                    locale="ro"
                                    firstDay={1}
                                    height="auto"
                                    events={filteredEvents}
                                    eventClick={
                                        handleEventClick
                                    }
                                    eventContent={
                                        renderEventContent
                                    }
                                    displayEventTime={true}
                                    dayMaxEvents={4}
                                    nowIndicator={true}
                                    selectable={false}
                                    editable={false}
                                    headerToolbar={{
                                        left: "prev,next today",
                                        center: "title",
                                        right: "dayGridMonth,timeGridWeek,timeGridDay",
                                    }}
                                    buttonText={{
                                        today: "Astăzi",
                                        month: "Lună",
                                        week: "Săptămână",
                                        day: "Zi",
                                    }}
                                    slotMinTime="07:00:00"
                                    slotMaxTime="21:00:00"
                                    allDaySlot={false}
                                />
                            </div>

                        </div>

                        {/* FOOTER */}

                        <div className="px-5 sm:px-6 py-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                            <div className="text-sm text-slate-500">
                                Sunt afișate{" "}
                                <span className="font-bold text-slate-800">
                                    {filteredEvents.length}
                                </span>{" "}
                                lucrări.
                            </div>

                            <div className="text-xs text-slate-400">
                                Apasă pe o lucrare pentru a deschide fișa completă.
                            </div>

                        </div>

                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}