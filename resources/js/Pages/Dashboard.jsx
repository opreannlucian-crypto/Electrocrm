import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";

function DigitalClock({ compact = false }) {
    const [now, setNow] = useState(() => new Date());
    const [temperature, setTemperature] = useState(null);

    useEffect(() => {
        const interval = window.setInterval(() => setNow(new Date()), 1000);
        return () => window.clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!navigator.geolocation) return undefined;

        let cancelled = false;
        navigator.geolocation.getCurrentPosition(async ({ coords }) => {
            try {
                const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m`);
                const weather = await response.json();
                if (!cancelled && Number.isFinite(weather?.current?.temperature_2m)) {
                    setTemperature(Math.round(weather.current.temperature_2m));
                }
            } catch {
                // Ceasul rămâne funcțional dacă serviciul meteo nu este disponibil.
            }
        }, () => {}, { enableHighAccuracy: false, timeout: 8000, maximumAge: 30 * 60 * 1000 });

        return () => { cancelled = true; };
    }, []);

    const time = new Intl.DateTimeFormat("ro-RO", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(now);
    const date = new Intl.DateTimeFormat("ro-RO", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(now);

    return <section className={`rounded-2xl border border-white/20 bg-slate-950/20 ${compact ? "mt-5 p-4" : "min-w-80 bg-gradient-to-br from-slate-900 to-blue-950 p-5 text-white shadow-lg"}`}>
        <div className="flex items-start justify-between gap-4">
            <div>
                <p className={`text-xs font-bold uppercase tracking-[0.16em] ${compact ? "text-blue-100" : "text-blue-200"}`}>Ora locală</p>
                <time className={`mt-1 block font-mono font-bold tracking-tight ${compact ? "text-4xl text-white" : "text-5xl"}`}>{time}</time>
                <p className={`mt-1 capitalize ${compact ? "text-sm text-blue-100" : "text-sm text-slate-300"}`}>{date}</p>
            </div>
            <div className={`rounded-2xl px-3 py-2 text-center ${compact ? "bg-white/15" : "bg-white/10"}`}>
                <span className="block text-xl">🌡️</span>
                <span className="mt-1 block text-sm font-bold">{temperature === null ? "—" : `${temperature}°C`}</span>
                <span className={`block text-[10px] ${compact ? "text-blue-100" : "text-slate-300"}`}>temperatură</span>
            </div>
        </div>
    </section>;
}

function MobileDashboard({ user, stats, quoteStats, scheduledToday, dashboardActivities, formatWorkTime, formatDate }) {
    const isTechnician = user?.role === "technician";
    const todayLabel = new Intl.DateTimeFormat("ro-RO", {
        weekday: "long",
        day: "numeric",
        month: "long",
    }).format(new Date());
    const firstName = user?.name?.trim().split(/\s+/)[0] || "";
    const quickActions = isTechnician
        ? [
            { icon: "🧰", label: "Lucrări", href: route("work_orders.index") },
            { icon: "📅", label: "Calendar", href: route("calendar.index") },
            { icon: "⏱️", label: "Pontaj", href: route("attendance.index") },
        ]
        : [
            { icon: "🧾", label: "Factură", href: route("invoices.create") },
            { icon: "🧰", label: "Lucrare", href: route("work_orders.create") },
            { icon: "💰", label: "Încasare", href: route("receipts.index") },
        ];

    return (
        <div className="lg:hidden">
            <section className="overflow-hidden bg-gradient-to-br from-blue-700 via-blue-700 to-sky-600 px-5 pb-7 pt-6 text-white shadow-sm">
                <p className="text-sm font-medium text-blue-100">ElectroCRM · {todayLabel}</p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight">Bună, {firstName}</h1>
                <p className="mt-1 text-sm text-blue-100">{isTechnician ? "Spațiul tău de lucru pentru azi" : "Privire de ansamblu asupra activității"}</p>
                <DigitalClock compact />
            </section>

            <main className="space-y-7 bg-slate-50 px-4 py-5">
                <section>
                    <h2 className="text-base font-bold text-slate-900">Rezumat astăzi</h2>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                        <Link href={route("work_orders.index")} className="rounded-2xl bg-emerald-600 p-4 text-white shadow-sm">
                            <p className="text-xs font-semibold text-emerald-50">Timp lucrat activ</p>
                            <p className="mt-2 text-2xl font-bold">{formatWorkTime(stats.activeWorkMinutes)}</p>
                        </Link>
                        <Link href={route("calendar.index")} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-xs font-semibold text-slate-500">Programări</p>
                            <p className="mt-2 text-2xl font-bold text-slate-900">{stats.scheduledToday ?? 0}</p>
                        </Link>
                        <Link href={route("work_orders.index")} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-xs font-semibold text-slate-500">Lucrări active</p>
                            <p className="mt-2 text-2xl font-bold text-slate-900">{stats.workingWorkOrders ?? 0}</p>
                        </Link>
                        <Link href={isTechnician ? route("work_orders.index") : route("quotes.index")} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-xs font-semibold text-slate-500">{isTechnician ? "Total lucrări" : "Oferte trimise"}</p>
                            <p className="mt-2 text-2xl font-bold text-slate-900">{isTechnician ? (stats.workOrders ?? 0) : (quoteStats.sent ?? 0)}</p>
                        </Link>
                    </div>
                </section>

                <section>
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-base font-bold text-slate-900">Jurnal activități</h2>
                        <Link href={route("calendar.index")} className="text-xs font-bold text-blue-700">Vezi toate</Link>
                    </div>
                    <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        {dashboardActivities.length === 0 ? (
                            <p className="px-4 py-7 text-center text-sm text-slate-500">Nu ai activități viitoare în jurnal.</p>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {dashboardActivities.slice(0, 3).map((activity) => (
                                    <li key={activity.id} className="flex gap-3 px-4 py-3.5">
                                        <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${activity.status === "completed" ? "bg-emerald-500" : "bg-amber-400"}`} />
                                        <div className="min-w-0">
                                            <p className={`text-sm font-semibold ${activity.status === "completed" ? "text-slate-400 line-through" : "text-slate-800"}`}>{activity.title}</p>
                                            <p className="mt-1 text-xs text-slate-500">{formatDate(activity.activity_date)}{activity.assigned_employee?.name ? ` · ${activity.assigned_employee.name}` : ""}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </section>

                <section>
                    <h2 className="text-base font-bold text-slate-900">Acțiuni rapide</h2>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                        {quickActions.map((action) => (
                            <Link key={action.label} href={action.href} className="flex min-h-24 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-2 text-center text-xs font-bold text-slate-700 shadow-sm transition active:bg-blue-50">
                                <span className="mb-2 text-2xl">{action.icon}</span>
                                {action.label}
                            </Link>
                        ))}
                    </div>
                </section>

                <section>
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-base font-bold text-slate-900">Programări azi</h2>
                        <Link href={route("calendar.index")} className="text-xs font-bold text-blue-700">Calendar</Link>
                    </div>
                    <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        {scheduledToday.length === 0 ? <p className="px-4 py-7 text-center text-sm text-slate-500">Nu există lucrări programate astăzi.</p> : <ul className="divide-y divide-slate-100">{scheduledToday.slice(0, 3).map((workOrder) => <li key={workOrder.id} className="px-4 py-3.5"><Link href={route("work_orders.show", workOrder.id)} className="block"><p className="text-sm font-semibold text-slate-800">{workOrder.number || "Lucrare"}</p><p className="mt-1 text-xs text-slate-500">{workOrder.client?.name || "Fără client"} · {workOrder.scheduled_time?.slice(0, 5) || "Fără oră"}</p></Link></li>)}</ul>}
                    </div>
                </section>
            </main>
        </div>
    );
}

export default function Dashboard({
    stats = {},
    quoteStats = {},
    devizStats = {},
    acceptedQuotesValue = 0,
    scheduledToday = [],
    latestQuotes = [],
    latestWorkOrders = [],
    dashboardActivities = [],
    activityEmployees = [],
}) {
    const user = usePage().props.auth.user;
    const isTechnician = user?.role === "technician";
    useEffect(() => {
        const refreshId = window.setInterval(() => {
            router.reload({ only: ["stats"], preserveScroll: true, preserveState: true });
        }, 60_000);

        return () => window.clearInterval(refreshId);
    }, []);
    const activityForm = useForm({
        activity_date: new Date().toISOString().slice(0, 10),
        title: "",
        notes: "",
        assigned_employee_id: "",
    });
    const submitActivity = (event) => {
        event.preventDefault();
        activityForm.post(route("dashboard.activities.store"), {
            onSuccess: () => activityForm.reset("title", "notes", "assigned_employee_id"),
        });
    };

    /*
    |--------------------------------------------------------------------------
    | STATUS LUCRARI
    |--------------------------------------------------------------------------
    */

    const statusLabel = {
        noua: "Noua",
        lucru: "In lucru",
        finalizata: "Finalizata",
        anulata: "Anulata",
    };

    const statusStyle = {
        noua: "bg-blue-100 text-blue-700",
        lucru: "bg-yellow-100 text-yellow-700",
        finalizata: "bg-green-100 text-green-700",
        anulata: "bg-red-100 text-red-700",
    };

    /*
    |--------------------------------------------------------------------------
    | STATUS OFERTE
    |--------------------------------------------------------------------------
    */

    const quoteStatusLabel = {
        draft: "Ciorna",
        sent: "Trimisa",
        accepted: "Acceptata",
        rejected: "Respinsa",
    };

    const quoteStatusStyle = {
        draft: "bg-gray-100 text-gray-700",
        sent: "bg-blue-100 text-blue-700",
        accepted: "bg-green-100 text-green-700",
        rejected: "bg-red-100 text-red-700",
    };

    /*
    |--------------------------------------------------------------------------
    | STATUS DEVIZE
    |--------------------------------------------------------------------------
    */

    const devizStatusLabel = {
        draft: "Ciorna",
        finalizat: "Finalizat",
    };

    const devizStatusStyle = {
        draft: "bg-gray-100 text-gray-700",
        finalizat: "bg-purple-100 text-purple-700",
    };

    /*
    |--------------------------------------------------------------------------
    | FORMAT DATA
    |--------------------------------------------------------------------------
    */

    function formatDate(date) {
        if (!date) {
            return "-";
        }

        const value = String(date).substring(0, 10);

        const match = value.match(
            /^(\d{4})-(\d{2})-(\d{2})$/
        );

        if (match) {
            const [, year, month, day] = match;

            return `${day}.${month}.${year}`;
        }

        return String(date);
    }

    /*
    |--------------------------------------------------------------------------
    | FORMAT ORA
    |--------------------------------------------------------------------------
    */

    function formatTime(time) {
        if (!time) {
            return "Fara ora";
        }

        const value = String(time);

        if (value.length >= 5) {
            return value.substring(0, 5);
        }

        return value;
    }

    /*
    |--------------------------------------------------------------------------
    | FORMAT BANI
    |--------------------------------------------------------------------------
    */

    function formatMoney(value) {
        return Number(value || 0).toLocaleString(
            "ro-RO",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        );
    }

    function formatWorkTime(minutes) {
        const total = Math.max(0, Number(minutes) || 0);
        return `${Math.floor(total / 60)}h ${Math.round(total % 60)}m`;
    }

    /*
    |--------------------------------------------------------------------------
    | CALCUL TOTAL DOCUMENT
    |--------------------------------------------------------------------------
    */

    function calculateQuoteTotal(quote) {
        if (!quote) {
            return 0;
        }

        const items = Array.isArray(quote.items)
            ? quote.items
            : [];

        const subtotal = items.reduce(
            (total, item) => {
                const quantity =
                    Number(item.quantity) || 0;

                const unitPrice =
                    Number(item.unit_price) || 0;

                const discount =
                    Number(item.discount) || 0;

                const itemSubtotal =
                    quantity * unitPrice;

                const itemTotal =
                    itemSubtotal -
                    (
                        itemSubtotal *
                        discount /
                        100
                    );

                return total + itemTotal;
            },
            0
        );

        const generalDiscount =
            Number(quote.discount) || 0;

        const afterDiscount =
            subtotal -
            (
                subtotal *
                generalDiscount /
                100
            );

        const vatRate =
            Number(quote.vat_rate) || 0;

        const vat =
            (
                afterDiscount *
                vatRate
            ) / 100;

        return afterDiscount + vat;
    }

    /*
    |--------------------------------------------------------------------------
    | ULTIMELE OFERTE
    |--------------------------------------------------------------------------
    */

    const latestOffers = useMemo(() => {
        return latestQuotes
            .filter(
                (quote) =>
                    quote.type === "oferta"
            )
            .slice(0, 5);
    }, [latestQuotes]);

    /*
    |--------------------------------------------------------------------------
    | ULTIMELE DEVIZE
    |--------------------------------------------------------------------------
    */

    const latestDevizes = useMemo(() => {
        return latestQuotes
            .filter(
                (quote) =>
                    quote.type === "deviz"
            )
            .slice(0, 5);
    }, [latestQuotes]);

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <MobileDashboard
                user={user}
                stats={stats}
                quoteStats={quoteStats}
                scheduledToday={scheduledToday}
                dashboardActivities={dashboardActivities}
                formatWorkTime={formatWorkTime}
                formatDate={formatDate}
            />

            <div className="hidden py-8 lg:block">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    {/* =====================================================
                        HEADER
                    ====================================================== */}

                    <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                            <p className="mt-1 text-sm text-gray-500">Privire de ansamblu asupra activitatii ElectroCRM</p>
                        </div>
                        <DigitalClock />
                    </div>


                    {/* =====================================================
                        REZUMAT
                    ====================================================== */}

                    <section>

                        <div className="mb-4">

                            <h2 className="text-xl font-bold text-gray-900">
                                Rezumat
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Situatia generala din sistem
                            </p>

                        </div>


                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

                            <Link
                                href={route("work_orders.index")}
                                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                            >

                                <div className="flex items-center justify-between">

                                    <div>

                                        <p className="text-sm font-medium text-gray-500">
                                            Timp de lucru azi
                                        </p>

                                        <p className="mt-2 text-3xl font-bold text-gray-900">
                                            {formatWorkTime(stats.activeWorkMinutes)}
                                        </p>

                                        <p className="mt-2 text-sm text-blue-600">
                                            Lucrat efectiv pe lucrări
                                        </p>

                                    </div>

                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
                                        ⏱️
                                    </div>

                                </div>

                            </Link>


                            <Link
                                href={route("employees.index")}
                                style={{ display: "none" }}
                                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                            >

                                <div className="flex items-center justify-between">

                                    <div>

                                        <p className="text-sm font-medium text-gray-500">
                                            Angajati
                                        </p>

                                        <p className="mt-2 text-3xl font-bold text-gray-900">
                                            {stats.employees ?? 0}
                                        </p>

                                        <p className="mt-2 text-sm text-purple-600">
                                            Vezi angajatii →
                                        </p>

                                    </div>

                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-2xl">
                                        👷
                                    </div>

                                </div>

                            </Link>


                            <Link
                                href={route("work_orders.index")}
                                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                            >

                                <div className="flex items-center justify-between">

                                    <div>

                                        <p className="text-sm font-medium text-gray-500">
                                            Total lucrari
                                        </p>

                                        <p className="mt-2 text-3xl font-bold text-gray-900">
                                            {stats.workOrders ?? 0}
                                        </p>

                                        <p className="mt-2 text-sm text-indigo-600">
                                            Vezi lucrarile →
                                        </p>

                                    </div>

                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-2xl">
                                        🛠️
                                    </div>

                                </div>

                            </Link>


                            <Link
                                href={route("work_orders.index")}
                                className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                            >

                                <div className="flex items-center justify-between">

                                    <div>

                                        <p className="text-sm font-medium text-gray-500">
                                            In lucru
                                        </p>

                                        <p className="mt-2 text-3xl font-bold text-yellow-600">
                                            {stats.workingWorkOrders ?? 0}
                                        </p>

                                        <p className="mt-2 text-sm text-gray-500">
                                            Lucrari active
                                        </p>

                                    </div>

                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100 text-2xl">
                                        🔧
                                    </div>

                                </div>

                            </Link>

                        </div>

                    </section>


                    {/* =====================================================
                        PROGRAMARI
                    ====================================================== */}

                    <section className="mt-10">

                        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                            <div>

                                <h2 className="text-xl font-bold text-gray-900">
                                    Programari
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Lucrarile programate pentru astazi
                                </p>

                            </div>

                            <Link
                                href={route("calendar.index")}
                                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                            >
                                Deschide calendar →
                            </Link>

                        </div>


                        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                            {scheduledToday.length === 0 ? (

                                <div className="px-6 py-14 text-center">

                                    <div className="mb-4 text-5xl">
                                        📅
                                    </div>

                                    <h3 className="text-lg font-semibold text-gray-800">
                                        Nu exista lucrari programate astazi
                                    </h3>

                                    <p className="mt-2 text-sm text-gray-500">
                                        Programarile vor aparea aici.
                                    </p>

                                </div>

                            ) : (

                                <div className="overflow-x-auto">

                                    <table className="w-full">

                                        <thead>

                                            <tr className="border-b border-gray-200 bg-gray-50">

                                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Lucrare
                                                </th>

                                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Client
                                                </th>

                                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Angajat
                                                </th>

                                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Ora
                                                </th>

                                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Status
                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody className="divide-y divide-gray-100">

                                            {scheduledToday
                                                .slice(0, 6)
                                                .map(
                                                    (workOrder) => {

                                                        const status =
                                                            workOrder.status ||
                                                            "noua";

                                                        return (
                                                            <tr
                                                                key={
                                                                    workOrder.id
                                                                }
                                                                className="transition hover:bg-gray-50"
                                                            >

                                                                <td className="px-6 py-4">

                                                                    <Link
                                                                        href={route(
                                                                            "work_orders.show",
                                                                            workOrder.id
                                                                        )}
                                                                        className="font-semibold text-gray-900 hover:text-blue-600"
                                                                    >
                                                                        {workOrder.number ||
                                                                            "-"}
                                                                    </Link>

                                                                    {workOrder.type && (
                                                                        <div className="mt-1 text-xs text-gray-500">
                                                                            {
                                                                                workOrder.type
                                                                            }
                                                                        </div>
                                                                    )}

                                                                </td>


                                                                <td className="px-6 py-4 text-sm text-gray-700">
                                                                    {workOrder.client
                                                                        ?.name ||
                                                                        "-"}
                                                                </td>


                                                                <td className="px-6 py-4 text-sm text-gray-700">

                                                                    {workOrder.employee
                                                                        ?.name || (
                                                                        <span className="text-gray-400">
                                                                            Nealocat
                                                                        </span>
                                                                    )}

                                                                </td>


                                                                <td className="px-6 py-4">

                                                                    <span className="inline-flex rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700">
                                                                        {formatTime(
                                                                            workOrder.scheduled_time
                                                                        )}
                                                                    </span>

                                                                </td>


                                                                <td className="px-6 py-4">

                                                                    <span
                                                                        className={`inline-flex rounded-full px-3 py-1.5 text-xs font-medium ${
                                                                            statusStyle[
                                                                                status
                                                                            ] ||
                                                                            "bg-gray-100 text-gray-700"
                                                                        }`}
                                                                    >
                                                                        {
                                                                            statusLabel[
                                                                                status
                                                                            ] ||
                                                                            status
                                                                        }
                                                                    </span>

                                                                </td>

                                                            </tr>
                                                        );
                                                    }
                                                )}

                                        </tbody>

                                    </table>

                                </div>

                            )}

                        </div>

                    </section>


                    {/* =====================================================
                        JURNAL ACTIVITĂȚI
                    ====================================================== */}

                    <section className="mt-10">
                        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Jurnal activități</h2>
                                <p className="mt-1 text-sm text-gray-500">Activități programate, de transmis mai departe echipei.</p>
                            </div>
                            <Link href={route("calendar.index")} className="text-sm font-semibold text-blue-600 hover:text-blue-700">Vezi calendarul →</Link>
                        </div>

                        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
                            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                                {dashboardActivities.length === 0 ? <div className="px-6 py-10 text-center text-sm text-gray-500">Nu ai activități viitoare în jurnal.</div> : <ul className="divide-y divide-gray-100">{dashboardActivities.map((activity) => <li key={activity.id} className="flex gap-3 px-5 py-4"><div className="min-w-0 flex-1"><div className={`font-semibold ${activity.status === "completed" ? "text-gray-400 line-through" : "text-gray-900"}`}>{activity.title}</div>{activity.notes && <p className="mt-1 text-sm text-gray-500">{activity.notes}</p>}<p className="mt-2 text-xs text-gray-500">{formatDate(activity.activity_date)} · {activity.assigned_employee?.name ? `Responsabil: ${activity.assigned_employee.name}` : "Nealocat"}</p><div className="mt-3 flex flex-wrap gap-1"><button type="button" disabled={isTechnician || activity.status === "assigned"} onClick={() => router.patch(route("dashboard.activities.update", activity.id), { status: "assigned" })} className="rounded border border-blue-300 px-2 py-1 text-xs font-semibold text-blue-700 disabled:opacity-40">Alocat</button><button type="button" disabled={isTechnician || activity.status === "in_progress"} onClick={() => router.patch(route("dashboard.activities.update", activity.id), { status: "in_progress" })} className="rounded border border-amber-300 px-2 py-1 text-xs font-semibold text-amber-800 disabled:opacity-40">În lucru</button><button type="button" disabled={isTechnician || activity.status === "completed"} onClick={() => router.patch(route("dashboard.activities.update", activity.id), { status: "completed" })} className="rounded border border-emerald-300 px-2 py-1 text-xs font-semibold text-emerald-700 disabled:opacity-40">Finalizat</button></div></div></li>)}</ul>}
                            </div>

                            {!isTechnician && <form onSubmit={submitActivity} className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5 shadow-sm"><h3 className="text-base font-bold text-gray-900">+ Activitate nouă</h3><div className="mt-4 space-y-3"><label className="block text-sm font-medium text-gray-700">Data<input required type="date" value={activityForm.data.activity_date} onChange={(event) => activityForm.setData("activity_date", event.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 text-sm" /></label><label className="block text-sm font-medium text-gray-700">Activitate *<input required value={activityForm.data.title} onChange={(event) => activityForm.setData("title", event.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 text-sm" placeholder="Ce trebuie făcut?" /></label><label className="block text-sm font-medium text-gray-700">Responsabil<select value={activityForm.data.assigned_employee_id} onChange={(event) => activityForm.setData("assigned_employee_id", event.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 text-sm"><option value="">Nealocat</option>{activityEmployees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}</select></label><label className="block text-sm font-medium text-gray-700">Detalii<textarea value={activityForm.data.notes} onChange={(event) => activityForm.setData("notes", event.target.value)} className="mt-1 block w-full rounded-lg border-gray-300 text-sm" rows="2" /></label><button disabled={activityForm.processing} className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50">Adaugă în jurnal</button></div></form>}
                        </div>
                    </section>

                    {/* =====================================================
                        DOCUMENTE
                    ====================================================== */}

                    <section className="mt-10" style={{ display: isTechnician ? "none" : undefined }}>

                        <div className="mb-5">

                            <h2 className="text-xl font-bold text-gray-900">
                                Documente
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Oferte, devize, contracte si procese-verbale
                            </p>

                        </div>


                        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

                            <Link
                                href={route("quotes.index")}
                                className="group rounded-2xl border border-blue-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                            >

                                <div className="flex items-center justify-between">

                                    <div>

                                        <div className="text-lg font-bold text-gray-900">
                                            Oferte & Devize
                                        </div>

                                        <div className="mt-1 text-sm text-gray-500">
                                            {quoteStats.total ?? 0} documente
                                        </div>

                                        <div className="mt-3 text-sm font-semibold text-blue-600">
                                            Deschide →
                                        </div>

                                    </div>

                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
                                        📑
                                    </div>

                                </div>

                            </Link>


                            <Link
                                href={route("contracts.index")}
                                className="group rounded-2xl border border-purple-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-purple-200 hover:shadow-lg"
                            >

                                <div className="flex items-center justify-between">

                                    <div>

                                        <div className="text-lg font-bold text-gray-900">
                                            Contracte
                                        </div>

                                        <div className="mt-1 text-sm text-gray-500">
                                            Contracte si sabloane
                                        </div>

                                        <div className="mt-3 text-sm font-semibold text-purple-600">
                                            Deschide →
                                        </div>

                                    </div>

                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-2xl">
                                        📃
                                    </div>

                                </div>

                            </Link>


                            <Link
                                href={route("reports.index")}
                                className="group rounded-2xl border border-green-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-green-200 hover:shadow-lg"
                            >

                                <div className="flex items-center justify-between">

                                    <div>

                                        <div className="text-lg font-bold text-gray-900">
                                            Procese-verbale
                                        </div>

                                        <div className="mt-1 text-sm text-gray-500">
                                            Documente tehnice
                                        </div>

                                        <div className="mt-3 text-sm font-semibold text-green-600">
                                            Deschide →
                                        </div>

                                    </div>

                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-2xl">
                                        📝
                                    </div>

                                </div>

                            </Link>

                        </div>


                        {/* STATISTICI DOCUMENTE */}

                        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                            <Link
                                href={route("quotes.index")}
                                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                            >

                                <div className="text-sm text-gray-500">
                                    Oferte trimise
                                </div>

                                <div className="mt-2 text-2xl font-bold text-blue-600">
                                    {quoteStats.sent ?? 0}
                                </div>

                            </Link>


                            <Link
                                href={route("quotes.index")}
                                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                            >

                                <div className="text-sm text-gray-500">
                                    Oferte acceptate
                                </div>

                                <div className="mt-2 text-2xl font-bold text-green-600">
                                    {quoteStats.accepted ?? 0}
                                </div>

                            </Link>


                            <Link
                                href={route("quotes.index")}
                                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                            >

                                <div className="text-sm text-gray-500">
                                    Devize finalizate
                                </div>

                                <div className="mt-2 text-2xl font-bold text-purple-600">
                                    {devizStats.finalizat ?? 0}
                                </div>

                            </Link>


                            <Link
                                href={route("quotes.index")}
                                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                            >

                                <div className="text-sm text-gray-500">
                                    Valoare acceptata
                                </div>

                                <div className="mt-2 text-xl font-bold text-green-600">
                                    {formatMoney(
                                        acceptedQuotesValue
                                    )}{" "}
                                    lei
                                </div>

                            </Link>

                        </div>

                    </section>


                    {/* =====================================================
                        ACTIVITATE RECENTA
                    ====================================================== */}

                    <section className="mt-10">

                        <div className="mb-5">

                            <h2 className="text-xl font-bold text-gray-900">
                                Activitate recenta
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Cele mai recente inregistrari din sistem
                            </p>

                        </div>


                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

                            {/* =================================================
                                ULTIMELE LUCRARI
                            ================================================== */}

                            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">

                                    <div>

                                        <h3 className="font-bold text-gray-900">
                                            Ultimele lucrari
                                        </h3>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Cele mai recente lucrari
                                        </p>

                                    </div>

                                    <Link
                                        href={route(
                                            "work_orders.index"
                                        )}
                                        className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                                    >
                                        Toate
                                    </Link>

                                </div>


                                {latestWorkOrders.length === 0 ? (

                                    <div className="px-6 py-12 text-center text-sm text-gray-500">
                                        Nu exista lucrari.
                                    </div>

                                ) : (

                                    <div className="divide-y divide-gray-100">

                                        {latestWorkOrders
                                            .slice(0, 5)
                                            .map(
                                                (workOrder) => {

                                                    const status =
                                                        workOrder.status ||
                                                        "noua";

                                                    return (
                                                        <div
                                                            key={
                                                                workOrder.id
                                                            }
                                                            className="flex items-center justify-between gap-4 px-6 py-4"
                                                        >

                                                            <div className="min-w-0">

                                                                <Link
                                                                    href={route(
                                                                        "work_orders.show",
                                                                        workOrder.id
                                                                    )}
                                                                    className="font-semibold text-gray-900 hover:text-blue-600"
                                                                >
                                                                    {workOrder.number ||
                                                                        "-"}
                                                                </Link>

                                                                <div className="mt-1 truncate text-sm text-gray-500">
                                                                    {
                                                                        workOrder
                                                                            .client
                                                                            ?.name ||
                                                                        "-"
                                                                    }
                                                                </div>

                                                            </div>


                                                            <span
                                                                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
                                                                    statusStyle[
                                                                        status
                                                                    ] ||
                                                                    "bg-gray-100 text-gray-700"
                                                                }`}
                                                            >
                                                                {
                                                                    statusLabel[
                                                                        status
                                                                    ] ||
                                                                    status
                                                                }
                                                            </span>

                                                        </div>
                                                    );
                                                }
                                            )}

                                    </div>

                                )}

                            </div>


                            {/* =================================================
                                ULTIMELE DOCUMENTE
                            ================================================== */}

                            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm" style={{ display: isTechnician ? "none" : undefined }}>

                                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">

                                    <div>

                                        <h3 className="font-bold text-gray-900">
                                            Ultimele documente
                                        </h3>

                                        <p className="mt-1 text-xs text-gray-500">
                                            Oferte si devize recente
                                        </p>

                                    </div>

                                    <Link
                                        href={route(
                                            "quotes.index"
                                        )}
                                        className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                                    >
                                        Toate
                                    </Link>

                                </div>


                                {latestQuotes.length === 0 ? (

                                    <div className="px-6 py-12 text-center text-sm text-gray-500">
                                        Nu exista documente.
                                    </div>

                                ) : (

                                    <div className="divide-y divide-gray-100">

                                        {latestQuotes
                                            .slice(0, 5)
                                            .map(
                                                (quote) => {

                                                    const isDeviz =
                                                        quote.type ===
                                                        "deviz";

                                                    const status =
                                                        quote.status ||
                                                        "draft";

                                                    const total =
                                                        calculateQuoteTotal(
                                                            quote
                                                        );

                                                    return (
                                                        <div
                                                            key={
                                                                quote.id
                                                            }
                                                            className="flex items-center justify-between gap-4 px-6 py-4"
                                                        >

                                                            <div className="min-w-0">

                                                                <Link
                                                                    href={route(
                                                                        "quotes.show",
                                                                        quote.id
                                                                    )}
                                                                    className="font-semibold text-gray-900 hover:text-blue-600"
                                                                >
                                                                    {
                                                                        quote.number
                                                                    }
                                                                </Link>

                                                                <div className="mt-1 truncate text-sm text-gray-500">
                                                                    {
                                                                        quote.title ||
                                                                        "-"
                                                                    }
                                                                </div>

                                                            </div>


                                                            <div className="shrink-0 text-right">

                                                                <div className="text-sm font-bold text-gray-900">
                                                                    {
                                                                        formatMoney(
                                                                            total
                                                                        )
                                                                    }{" "}
                                                                    lei
                                                                </div>


                                                                <span
                                                                    className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                                        isDeviz
                                                                            ? devizStatusStyle[
                                                                                  status
                                                                              ] ||
                                                                              "bg-gray-100 text-gray-700"
                                                                            : quoteStatusStyle[
                                                                                  status
                                                                              ] ||
                                                                              "bg-gray-100 text-gray-700"
                                                                    }`}
                                                                >
                                                                    {
                                                                        isDeviz
                                                                            ? devizStatusLabel[
                                                                                  status
                                                                              ] ||
                                                                              status
                                                                            : quoteStatusLabel[
                                                                                  status
                                                                              ] ||
                                                                              status
                                                                    }
                                                                </span>

                                                            </div>

                                                        </div>
                                                    );
                                                }
                                            )}

                                    </div>

                                )}

                            </div>

                        </div>

                    </section>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
