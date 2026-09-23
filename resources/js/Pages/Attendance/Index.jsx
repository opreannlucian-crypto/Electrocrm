import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import { useMemo, useState } from "react";

export default function Index({
    month,
    year,
    monthName,
    today = null,
    todayAttendances = {},
    mobileWeekDays = [],
    mobileWeekAttendances = {},
    mobileWeekStart = null,
    isMobileCurrentWeek = true,
    days = [],
    rows = [],
}) {
    const user = usePage().props.auth.user;
    const isTechnician = user?.role === "technician";
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showQuickModal, setShowQuickModal] = useState(false);
    const [dayActionEmployeeId, setDayActionEmployeeId] = useState(null);
    const [exportFrom, setExportFrom] = useState("");
    const [exportTo, setExportTo] = useState("");

    const months = [
        "Ianuarie",
        "Februarie",
        "Martie",
        "Aprilie",
        "Mai",
        "Iunie",
        "Iulie",
        "August",
        "Septembrie",
        "Octombrie",
        "Noiembrie",
        "Decembrie",
    ];

    /*
    |--------------------------------------------------------------------------
    | DATA SI ORA CURENTA
    |--------------------------------------------------------------------------
    */

    const getToday = () => {
        const today = new Date();

        const currentYear = today.getFullYear();
        const currentMonth = String(today.getMonth() + 1).padStart(2, "0");
        const day = String(today.getDate()).padStart(2, "0");

        return `${currentYear}-${currentMonth}-${day}`;
    };

    const getCurrentTime = () => {
        const today = new Date();

        const hours = String(today.getHours()).padStart(2, "0");
        const minutes = String(today.getMinutes()).padStart(2, "0");

        return `${hours}:${minutes}`;
    };

    const formatLocalDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const captureLocation = (callback) => {
        if (!navigator.geolocation) {
            callback({});
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => callback({
                gps_latitude: position.coords.latitude,
                gps_longitude: position.coords.longitude,
                gps_accuracy: position.coords.accuracy,
            }),
            () => callback({}),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const todayDate = today || getToday();
    const referenceDate = new Date(`${todayDate}T12:00:00`);

    const isCurrentMonth =
        Number(month) === referenceDate.getMonth() + 1 &&
        Number(year) === referenceDate.getFullYear();

    /*
    |--------------------------------------------------------------------------
    | NORMALIZARE DATA
    |--------------------------------------------------------------------------
    */

    const normalizeDate = (value) => {
        if (!value) {
            return "";
        }

        const stringValue = String(value);

        if (stringValue.includes("T")) {
            return stringValue.split("T")[0];
        }

        if (stringValue.includes(" ")) {
            return stringValue.split(" ")[0];
        }

        return stringValue.substring(0, 10);
    };

    /*
    |--------------------------------------------------------------------------
    | GASIRE PONTAJ
    |--------------------------------------------------------------------------
    */

    const getAttendance = (row, date) => {
        const targetDate = normalizeDate(date);

        return (
            row?.attendances?.find(
                (attendance) =>
                    normalizeDate(attendance.date) === targetDate
            ) || null
        );
    };

    /*
    |--------------------------------------------------------------------------
    | PONTAJ REAL DE ZI
    |--------------------------------------------------------------------------
    */

    const getRealDayAttendance = (row) => {
        const currentAttendance = todayAttendances?.[row?.employee?.id];

        if (currentAttendance?.id) {
            return currentAttendance;
        }

        const attendance = getAttendance(row, todayDate);

        if (!attendance?.id) {
            return null;
        }

        return attendance;
    };

    /*
    |--------------------------------------------------------------------------
    | STATUS START / STOP
    |--------------------------------------------------------------------------
    */

    const getDayAttendance = (row) => {
        return getAttendance(row, todayDate);
    };

    const canStartDay = (row) => {
        // Pentru tehnician, Start ziua se raportează întotdeauna la ziua de azi
        // de pe server. Nu îl blocăm dacă pagina a rămas pe o lună anterioară.
        if (!isCurrentMonth && !isTechnician) {
            return false;
        }

        const attendance = getRealDayAttendance(row);

        if (attendance?.check_in) {
            return false;
        }

        return true;
    };

    const canStopDay = (row) => {
        if (!isCurrentMonth && !isTechnician) {
            return false;
        }

        const attendance = getRealDayAttendance(row);

        if (!attendance?.check_in) {
            return false;
        }

        if (attendance?.check_out) {
            return false;
        }

        return true;
    };

    /*
    |--------------------------------------------------------------------------
    | START ZIUA
    |--------------------------------------------------------------------------
    */

    const startDay = (row) => {
    console.log("========================================");
    console.log("START ZIUA - CLICK");
    console.log("ROW:", row);
    console.log("EMPLOYEE:", row?.employee);
    console.log("TODAY:", todayDate);
    console.log("CURRENT MONTH:", isCurrentMonth);
    console.log("CAN START:", canStartDay(row));
    console.log("========================================");

    if (!isCurrentMonth && !isTechnician) {
        console.log("START ZIUA - luna curenta este falsa.");
        return;
    }

    if (!canStartDay(row)) {
        console.log("START ZIUA - canStartDay este false.");
        return;
    }

    const employee = row?.employee;

    if (!employee?.id) {
        console.error("START ZIUA - angajat invalid:", employee);
        return;
    }

    const currentTime = getCurrentTime();

    console.log(
        "START ZIUA - trimit POST:",
        {
            employee_id: employee.id,
            date: todayDate,
            check_in: currentTime,
        }
    );

    captureLocation((gps) => router.post(
        route("attendance.startDay"),
        {
            employee_id: employee.id,
            date: todayDate,
            check_in: currentTime,
            ...gps,
        },
        {
            preserveScroll: true,
            preserveState: false,

            onStart: () => {
                console.log("START ZIUA - request pornit.");
            },

            onSuccess: () => {
                console.log("START ZIUA - SUCCESS.");
            },

            onError: (errors) => {
                console.error(
                    "START ZIUA - SERVER ERROR:",
                    errors
                );
            },

            onFinish: () => {
                console.log(
                    "START ZIUA - request finalizat."
                );
            },
        }
    ));
};

const stopDay = (row) => {
    console.log("========================================");
    console.log("STOP ZIUA - CLICK");
    console.log("ROW:", row);
    console.log("EMPLOYEE:", row?.employee);
    console.log("TODAY:", todayDate);
    console.log("CURRENT MONTH:", isCurrentMonth);
    console.log("CAN STOP:", canStopDay(row));
    console.log("========================================");

    if (!isCurrentMonth && !isTechnician) {
        console.log("STOP ZIUA - luna curenta este falsa.");
        return;
    }

    if (!canStopDay(row)) {
        console.log("STOP ZIUA - canStopDay este false.");
        return;
    }

    const employee = row?.employee;
    const attendance = getRealDayAttendance(row);

    if (!employee?.id) {
        console.error(
            "STOP ZIUA - angajat invalid:",
            employee
        );
        return;
    }

    if (!attendance?.id) {
        console.error(
            "STOP ZIUA - pontaj invalid:",
            attendance
        );
        return;
    }

    const currentTime = getCurrentTime();

    console.log(
        "STOP ZIUA - trimit POST:",
        {
            attendance_id: attendance.id,
            employee_id: employee.id,
            date: todayDate,
            check_out: currentTime,
        }
    );

    captureLocation((gps) => router.post(
        route("attendance.stopDay"),
        {
            attendance_id: attendance.id,
            employee_id: employee.id,
            date: todayDate,
            check_out: currentTime,
            ...gps,
        },
        {
            preserveScroll: true,
            preserveState: false,

            onStart: () => {
                console.log("STOP ZIUA - request pornit.");
            },

            onSuccess: () => {
                console.log("STOP ZIUA - SUCCESS.");
            },

            onError: (errors) => {
                console.error(
                    "STOP ZIUA - SERVER ERROR:",
                    errors
                );
            },

            onFinish: () => {
                console.log(
                    "STOP ZIUA - request finalizat."
                );
            },
        }
    ));
};

    /*
    |--------------------------------------------------------------------------
    | NAVIGARE LUNA
    |--------------------------------------------------------------------------
    */

    const changeMonth = (direction) => {
        let newMonth = Number(month) + direction;
        let newYear = Number(year);

        if (newMonth < 1) {
            newMonth = 12;
            newYear--;
        }

        if (newMonth > 12) {
            newMonth = 1;
            newYear++;
        }

        router.get(
            route("attendance.index"),
            {
                month: newMonth,
                year: newYear,
            },
            {
                preserveScroll: true,
                preserveState: false,
            }
        );
    };

    const goToCurrentMonth = () => {
        const today = new Date();

        router.get(
            route("attendance.index"),
            {
                month: today.getMonth() + 1,
                year: today.getFullYear(),
            },
            {
                preserveScroll: true,
                preserveState: false,
            }
        );
    };

    const changeMobileWeek = (direction) => {
        const weekDate = new Date(`${mobileWeekStart || todayDate}T12:00:00`);
        weekDate.setDate(weekDate.getDate() + direction * 7);

        router.get(
            route("attendance.index"),
            {
                month,
                year,
                week_start: formatLocalDate(weekDate),
            },
            {
                preserveScroll: true,
                preserveState: false,
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | SELECTARE LUNA
    |--------------------------------------------------------------------------
    */

    const changeSelectedMonth = (event) => {
        const newMonth = Number(event.target.value);

        router.get(
            route("attendance.index"),
            {
                month: newMonth,
                year,
            },
            {
                preserveScroll: true,
                preserveState: false,
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | SELECTARE AN
    |--------------------------------------------------------------------------
    */

    const changeSelectedYear = (event) => {
        const newYear = Number(event.target.value);

        router.get(
            route("attendance.index"),
            {
                month,
                year: newYear,
            },
            {
                preserveScroll: true,
                preserveState: false,
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | EXPORT EXCEL
    |--------------------------------------------------------------------------
    */

    const exportExcel = () => {
        const query = exportFrom
            ? `?from=${encodeURIComponent(exportFrom)}&to=${encodeURIComponent(exportTo || exportFrom)}`
            : `?month=${month}&year=${year}`;

        window.location.href =
            route("attendance.export.excel") +
            query;
    };

    /*
    |--------------------------------------------------------------------------
    | EXPORT PDF
    |--------------------------------------------------------------------------
    */

    const exportPdf = () => {
        const query = exportFrom
            ? `?from=${encodeURIComponent(exportFrom)}&to=${encodeURIComponent(exportTo || exportFrom)}`
            : `?month=${month}&year=${year}`;

        window.location.href =
            route("attendance.export.pdf") +
            query;
    };

    /*
    |--------------------------------------------------------------------------
    | FORMULAR PONTAJ INDIVIDUAL
    |--------------------------------------------------------------------------
    */

    const individualForm = useForm({
        employee_id: "",
        date: "",
        check_in: "08:00",
        check_out: "16:30",
        break_minutes: 30,
        status: "prezent",
        notes: "",
    });

    const openAttendanceModal = (employeeRow, day, attendanceOverride = null) => {
        if (isTechnician && Number(employeeRow?.employee?.id) !== Number(user?.employee_id)) {
            return;
        }

        const attendance = attendanceOverride || getAttendance(employeeRow, day.date);

        setSelectedEmployee(employeeRow.employee);
        setSelectedDate(day);

        individualForm.setData({
            employee_id: employeeRow.employee.id,
            date: day.date,
            check_in: attendance?.check_in || "08:00",
            check_out: attendance?.check_out || "16:30",
            break_minutes:
                attendance?.break_minutes !== undefined
                    ? attendance.break_minutes
                    : 30,
            status: attendance?.status || "prezent",
            notes: attendance?.notes || "",
        });
    };

    const closeAttendanceModal = () => {
        setSelectedEmployee(null);
        setSelectedDate(null);

        individualForm.reset();
    };

    const saveAttendance = (event) => {
        event.preventDefault();

        individualForm.post(
            route("attendance.store"),
            {
                preserveScroll: true,
                onSuccess: () => {
                    closeAttendanceModal();
                },
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | FORMULAR PONTAJ RAPID
    |--------------------------------------------------------------------------
    */

    const quickForm = useForm({
        date: "",
        check_in: "08:00",
        check_out: "16:30",
        break_minutes: 30,
        status: "prezent",
        notes: "",
    });

    const openQuickModal = (day = null) => {
        if (isTechnician) {
            return;
        }

        quickForm.setData({
            date: day?.date || "",
            check_in: "08:00",
            check_out: "16:30",
            break_minutes: 30,
            status: "prezent",
            notes: "",
        });

        setShowQuickModal(true);
    };

    const closeQuickModal = () => {
        setShowQuickModal(false);
        quickForm.reset();
    };

    const saveQuickAttendance = (event) => {
        event.preventDefault();

        if (isTechnician) {
            return;
        }

        quickForm.post(
            route("attendance.bulkStore"),
            {
                preserveScroll: true,
                onSuccess: () => {
                    closeQuickModal();
                },
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | STERGERE PONTAJ
    |--------------------------------------------------------------------------
    */

    const deleteAttendance = (attendance) => {
        if (!attendance?.id) {
            return;
        }

        if (
            !window.confirm(
                "Sigur vrei sa stergi pontajul pentru aceasta zi?"
            )
        ) {
            return;
        }

        router.delete(
            route("attendance.destroy", attendance.id),
            {
                preserveScroll: true,
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | TOTALURI GENERALE
    |--------------------------------------------------------------------------
    */

    const generalTotals = useMemo(() => {
        let hours = 0;
        let daysWorked = 0;
        let overtime = 0;

        rows.forEach((row) => {
            hours += Number(row.total_worked_hours || 0);
            daysWorked += Number(row.total_days_worked || 0);
            overtime += Number(row.total_overtime || 0);
        });

        return {
            hours: hours.toFixed(2),
            daysWorked,
            overtime: overtime.toFixed(2),
        };
    }, [rows]);

    /*
    |--------------------------------------------------------------------------
    | STATUS
    |--------------------------------------------------------------------------
    */

    const statusLabel = (status) => {
        switch (status) {
            case "prezent":
                return "Prezent";

            case "absent":
                return "Absent";

            case "concediu":
                return "Concediu";

            case "medical":
                return "Medical";

            case "liber":
                return "Liber";

            default:
                return status || "-";
        }
    };

    const statusClass = (status) => {
        switch (status) {
            case "prezent":
                return "bg-emerald-100 text-emerald-700";

            case "absent":
                return "bg-red-100 text-red-700";

            case "concediu":
                return "bg-blue-100 text-blue-700";

            case "medical":
                return "bg-purple-100 text-purple-700";

            case "liber":
                return "bg-gray-200 text-gray-700";

            default:
                return "bg-gray-100 text-gray-600";
        }
    };

    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Pontaj
                    </h2>

                    <p className="text-sm text-gray-500">
                        Evidenta prezentei si orelor lucrate
                    </p>
                </div>
            }
        >
            <Head title="Pontaj" />

            <div className="py-6">
                <div className="mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-8">

                    <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Pontaj lunar
                                </h1>

                                <p className="mt-1 text-sm text-gray-500">
                                    {monthName}
                                </p>
                            </div>

                            <div className="flex w-full flex-col gap-3 xl:w-auto xl:items-end">
                                <div className="flex flex-wrap items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                    <div className="mr-1 hidden pb-1 sm:block">
                                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Perioada afișată</p>
                                        <p className="text-sm font-semibold text-slate-800">Pontaj lunar</p>
                                    </div>
                                    <button type="button" onClick={() => changeMonth(-1)} aria-label="Luna anterioară" className="rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">←</button>
                                    <select value={month} onChange={changeSelectedMonth} className="rounded-xl border-gray-300 bg-white px-4 py-2.5 text-sm font-medium shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                    {months.map(
                                        (monthNameItem, index) => (
                                            <option
                                                key={index + 1}
                                                value={index + 1}
                                            >
                                                {monthNameItem}
                                            </option>
                                        )
                                    )}
                                    </select>
                                    <select value={year} onChange={changeSelectedYear} className="rounded-xl border-gray-300 bg-white px-4 py-2.5 text-sm font-medium shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                                    {Array.from(
                                        {
                                            length: 11,
                                        },
                                        (_, index) =>
                                            Number(year) - 5 + index
                                    ).map((yearItem) => (
                                        <option
                                            key={yearItem}
                                            value={yearItem}
                                        >
                                            {yearItem}
                                        </option>
                                    ))}
                                    </select>
                                    <button type="button" onClick={() => changeMonth(1)} aria-label="Luna următoare" className="rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">→</button>
                                    <button type="button" onClick={goToCurrentMonth} className="rounded-xl border border-indigo-200 bg-white px-3 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50">Luna curentă</button>
                                </div>

                                {!isTechnician && (
                                    <div className="flex flex-wrap items-end gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3">
                                        <div className="mr-1 hidden pb-1 sm:block">
                                            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Export pontaj</p>
                                            <p className="text-xs text-slate-500">O zi sau un interval</p>
                                        </div>
                                        <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600">De la
                                            <input
                                                type="date"
                                                value={exportFrom}
                                                onChange={(event) => setExportFrom(event.target.value)}
                                                className="rounded-xl border-gray-300 bg-white px-3 py-2 text-sm font-medium shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                        </label>
                                        <label className="flex flex-col gap-1 text-xs font-semibold text-gray-600">Până la
                                            <input
                                                type="date"
                                                value={exportTo}
                                                min={exportFrom || undefined}
                                                onChange={(event) => setExportTo(event.target.value)}
                                                className="rounded-xl border-gray-300 bg-white px-3 py-2 text-sm font-medium shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            />
                                        </label>
                                        <button type="button" onClick={exportExcel} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">📊 Excel</button>
                                        <button type="button" onClick={exportPdf} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700">📄 PDF</button>
                                        <button type="button" onClick={() => openQuickModal()} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700">+ Pontaj rapid</button>
                                        <p className="w-full text-xs text-slate-500">Completează doar „De la” pentru o singură zi. Lasă ambele câmpuri goale pentru luna selectată.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {isCurrentMonth && (
                        <div className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                                <div>
                                    <p className="font-semibold text-indigo-900">
                                        Pontajul zilei de astazi
                                    </p>

                                    <p className="text-sm text-indigo-700">
                                        Fiecare angajat are propriile butoane
                                        Start ziua si Stop ziua.
                                    </p>
                                </div>

                                <div className="text-sm font-semibold text-indigo-800">
                                    {todayDate}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

                        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        Total ore
                                    </p>

                                    <p className="mt-2 text-3xl font-bold text-gray-900">
                                        {generalTotals.hours}
                                    </p>
                                </div>

                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-xl">
                                    ⏱️
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        Zile lucrate
                                    </p>

                                    <p className="mt-2 text-3xl font-bold text-gray-900">
                                        {generalTotals.daysWorked}
                                    </p>
                                </div>

                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-xl">
                                    📅
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        Ore suplimentare
                                    </p>

                                    <p className="mt-2 text-3xl font-bold text-gray-900">
                                        {generalTotals.overtime}
                                    </p>
                                </div>

                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-xl">
                                    ⚡
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">

                        <div className="mb-4">
                            <h2 className="text-lg font-bold text-gray-900">
                                Rezumat lunar angajati
                            </h2>

                            <p className="text-sm text-gray-500">
                                Situatia lunara pentru fiecare angajat
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

                            {rows.map((row) => {
                                const todayAttendance =
                                    getDayAttendance(row);

                                const started =
                                    !!todayAttendance?.check_in;

                                const stopped =
                                    !!todayAttendance?.check_out;

                                const isProcessing =
                                    dayActionEmployeeId ===
                                    row.employee.id;

                                return (
                                    <div
                                        key={row.employee.id}
                                        className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100"
                                    >
                                        <div className="flex items-start justify-between gap-4">

                                            <div className="min-w-0">
                                                <h3 className="truncate text-base font-bold text-gray-900">
                                                    {row.employee.name}
                                                </h3>

                                                <p className="mt-1 truncate text-sm text-gray-500">
                                                    {row.employee.position ||
                                                        "Angajat"}
                                                </p>
                                            </div>

                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
                                                {row.employee.name
                                                    ?.charAt(0)
                                                    ?.toUpperCase() || "A"}
                                            </div>
                                        </div>

                                        <div className="mt-4 grid grid-cols-2 gap-2">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    startDay(row)
                                                }
                                                disabled={
                                                    !canStartDay(row) ||
                                                    isProcessing
                                                }
                                                className="rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                                            >
                                                {isProcessing
                                                    ? "Se proceseaza..."
                                                    : "▶ Start ziua"}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    stopDay(row)
                                                }
                                                disabled={
                                                    !canStopDay(row) ||
                                                    isProcessing
                                                }
                                                className="rounded-xl bg-red-600 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                                            >
                                                {isProcessing
                                                    ? "Se proceseaza..."
                                                    : "■ Stop ziua"}
                                            </button>
                                        </div>

                                        {isCurrentMonth && (
                                            <div className="mt-3 rounded-xl bg-gray-50 px-3 py-2 text-center text-xs">

                                                {!started && (
                                                    <span className="font-semibold text-gray-500">
                                                        Ziua nu a fost pornita
                                                    </span>
                                                )}

                                                {started && !stopped && (
                                                    <span className="font-semibold text-emerald-600">
                                                        Zi inceputa la{" "}
                                                        {
                                                            todayAttendance.check_in
                                                        }
                                                    </span>
                                                )}

                                                {started && stopped && (
                                                    <span className="font-semibold text-gray-700">
                                                        Zi finalizata:{" "}
                                                        {
                                                            todayAttendance.check_in
                                                        }{" "}
                                                        →{" "}
                                                        {
                                                            todayAttendance.check_out
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        <div className="mt-5 grid grid-cols-3 gap-2">

                                            <div className="rounded-xl bg-gray-50 p-3 text-center">
                                                <p className="text-xs text-gray-500">
                                                    Ore
                                                </p>

                                                <p className="mt-1 text-lg font-bold text-gray-900">
                                                    {Number(
                                                        row.total_worked_hours ||
                                                            0
                                                    ).toFixed(2)}
                                                </p>
                                            </div>

                                            <div className="rounded-xl bg-gray-50 p-3 text-center">
                                                <p className="text-xs text-gray-500">
                                                    Zile
                                                </p>

                                                <p className="mt-1 text-lg font-bold text-gray-900">
                                                    {row.total_days_worked ||
                                                        0}
                                                </p>
                                            </div>

                                            <div className="rounded-xl bg-gray-50 p-3 text-center">
                                                <p className="text-xs text-gray-500">
                                                    Supl.
                                                </p>

                                                <p className="mt-1 text-lg font-bold text-orange-600">
                                                    {Number(
                                                        row.total_overtime || 0
                                                    ).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {rows.length === 0 && (
                                <div className="col-span-full rounded-2xl bg-white p-8 text-center text-sm text-gray-500 shadow-sm ring-1 ring-gray-100">
                                    Nu exista angajati activi.
                                </div>
                            )}
                        </div>
                    </div>

                    {isTechnician && (
                        <section className="mb-6 lg:hidden">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Pontaj săptămânal</h2>
                                    <p className="mt-1 text-sm text-gray-500">{isMobileCurrentWeek ? "Săptămâna curentă · poți modifica ziua de azi" : "Doar consultare · nu se poate modifica"}</p>
                                </div>
                                <div className="flex shrink-0 gap-2">
                                    <button type="button" onClick={() => changeMobileWeek(-1)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-lg font-bold text-gray-700 shadow-sm">←</button>
                                    <button type="button" onClick={() => changeMobileWeek(1)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-lg font-bold text-gray-700 shadow-sm">→</button>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
                                {(rows[0] ? mobileWeekDays : []).map((day) => {
                                    const isToday = normalizeDate(day.date) === todayDate;
                                    const attendance = mobileWeekAttendances?.[day.date]
                                        || (isToday ? getRealDayAttendance(rows[0]) : null);

                                    return (
                                        <button
                                            key={day.date}
                                            type="button"
                                            disabled={day.is_weekend || !isMobileCurrentWeek || !isToday}
                                            onClick={() => openAttendanceModal(rows[0], day, attendance)}
                                            className={`flex w-full items-center justify-between gap-3 border-b border-gray-100 px-4 py-3.5 text-left last:border-b-0 disabled:cursor-default ${day.is_weekend ? "bg-gray-50" : "active:bg-indigo-50"}`}
                                        >
                                            <div className="min-w-0">
                                                <p className={`text-sm font-bold ${isToday ? "text-indigo-700" : "text-gray-800"}`}>
                                                    {day.day} · {day.weekday}
                                                    {isToday && <span className="ml-2 text-xs">Azi</span>}
                                                </p>
                                                {attendance ? (
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {attendance.check_in || "-"} → {attendance.check_out || "-"} · {Number(attendance.worked_hours || 0).toFixed(2)} h
                                                    </p>
                                                ) : (
                                                    <p className="mt-1 text-xs text-gray-400">{day.is_weekend ? "Weekend" : "Fără pontaj"}</p>
                                                )}
                                            </div>
                                            {attendance ? (
                                                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${statusClass(attendance.status)}`}>
                                                    {statusLabel(attendance.status)}
                                                </span>
                                            ) : !day.is_weekend ? (
                                                <span className="text-lg font-light text-indigo-500">+</span>
                                            ) : null}
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    <div className={`overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 ${isTechnician ? "hidden lg:block" : ""}`}>

                        <div className="border-b border-gray-100 px-5 py-4">
                            <h2 className="text-lg font-bold text-gray-900">
                                Pontaj zilnic
                            </h2>

                            <p className="text-sm text-gray-500">
                                Apasa pe o celula pentru a modifica pontajul
                            </p>
                        </div>

                        <div className="overflow-x-auto">

                            <table className="min-w-max border-collapse text-sm">

                                <thead>
                                    <tr className="bg-gray-50">

                                        <th className="sticky left-0 z-30 min-w-[320px] border-b border-r border-gray-200 bg-gray-50 px-4 py-3 text-left font-semibold text-gray-700">
                                            Angajat
                                        </th>

                                        {days.map((day) => (
                                            <th
                                                key={day.date}
                                                className={`min-w-[105px] border-b border-r border-gray-200 px-2 py-3 text-center font-semibold ${
                                                    day.is_weekend
                                                        ? "bg-red-50 text-red-600"
                                                        : "text-gray-700"
                                                }`}
                                            >
                                                <div>
                                                    {day.day}
                                                </div>

                                                <div className="mt-0.5 text-[11px] font-normal uppercase">
                                                    {day.weekday?.substring(
                                                        0,
                                                        3
                                                    )}
                                                </div>
                                            </th>
                                        ))}

                                        <th className="min-w-[100px] border-b border-gray-200 bg-indigo-50 px-3 py-3 text-center font-bold text-indigo-700">
                                            Total ore
                                        </th>

                                        <th className="min-w-[90px] border-b border-gray-200 bg-emerald-50 px-3 py-3 text-center font-bold text-emerald-700">
                                            Zile
                                        </th>

                                        <th className="min-w-[100px] border-b border-gray-200 bg-orange-50 px-3 py-3 text-center font-bold text-orange-700">
                                            Supl.
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {rows.map((row) => {
                                        const isProcessing =
                                            dayActionEmployeeId ===
                                            row.employee.id;

                                        return (
                                            <tr
                                                key={row.employee.id}
                                                className="group hover:bg-gray-50"
                                            >
                                                <td className="sticky left-0 z-20 border-b border-r border-gray-200 bg-white px-4 py-3">

                                                    <div className="font-semibold text-gray-900">
                                                        {row.employee.name}
                                                    </div>

                                                    <div className="mt-0.5 text-xs text-gray-500">
                                                        {row.employee.position ||
                                                            ""}
                                                    </div>

                                                    {isCurrentMonth && (
                                                        <div className="mt-3 grid grid-cols-2 gap-2">

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    startDay(row)
                                                                }
                                                                disabled={
                                                                    !canStartDay(
                                                                        row
                                                                    ) ||
                                                                    isProcessing
                                                                }
                                                                className="rounded-lg bg-emerald-600 px-2 py-1.5 text-[11px] font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                                                            >
                                                                {isProcessing
                                                                    ? "..."
                                                                    : "▶ Start ziua"}
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    stopDay(row)
                                                                }
                                                                disabled={
                                                                    !canStopDay(
                                                                        row
                                                                    ) ||
                                                                    isProcessing
                                                                }
                                                                className="rounded-lg bg-red-600 px-2 py-1.5 text-[11px] font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                                                            >
                                                                {isProcessing
                                                                    ? "..."
                                                                    : "■ Stop ziua"}
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>

                                                {days.map((day) => {
                                                    const attendance =
                                                        getAttendance(
                                                            row,
                                                            day.date
                                                        );

                                                    return (
                                                        <td
                                                            key={day.date}
                                                            onClick={() =>
                                                                !day.is_weekend &&
                                                                openAttendanceModal(
                                                                    row,
                                                                    day
                                                                )
                                                            }
                                                            className={`border-b border-r border-gray-200 p-1 text-center ${
                                                                day.is_weekend
                                                                    ? "bg-gray-50"
                                                                    : "cursor-pointer hover:bg-indigo-50"
                                                            }`}
                                                        >
                                                            {attendance ? (
                                                                <div className="space-y-1">

                                                                    <div className="text-xs font-semibold text-gray-800">
                                                                        {attendance.check_in ||
                                                                            "-"}{" "}
                                                                        →{" "}
                                                                        {attendance.check_out ||
                                                                            "-"}
                                                                    </div>

                                                                    <div className="text-xs font-bold text-indigo-600">
                                                                        {Number(
                                                                            attendance.worked_hours ||
                                                                                0
                                                                        ).toFixed(
                                                                            2
                                                                        )}{" "}
                                                                        h
                                                                    </div>

                                                                    <span
                                                                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusClass(
                                                                            attendance.status
                                                                        )}`}
                                                                    >
                                                                        {statusLabel(
                                                                            attendance.status
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <div className="py-4 text-xs text-gray-300">
                                                                    {day.is_weekend
                                                                        ? "—"
                                                                        : "+"}
                                                                </div>
                                                            )}
                                                        </td>
                                                    );
                                                })}

                                                <td className="border-b border-gray-200 bg-indigo-50 px-3 py-3 text-center font-bold text-indigo-700">
                                                    {Number(
                                                        row.total_worked_hours ||
                                                            0
                                                    ).toFixed(2)}
                                                </td>

                                                <td className="border-b border-gray-200 bg-emerald-50 px-3 py-3 text-center font-bold text-emerald-700">
                                                    {row.total_days_worked ||
                                                        0}
                                                </td>

                                                <td className="border-b border-gray-200 bg-orange-50 px-3 py-3 text-center font-bold text-orange-700">
                                                    {Number(
                                                        row.total_overtime || 0
                                                    ).toFixed(2)}
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {rows.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={
                                                    days.length + 4
                                                }
                                                className="px-6 py-12 text-center text-gray-500"
                                            >
                                                Nu exista date pentru afisare.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {selectedEmployee && selectedDate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">

                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    Pontaj angajat
                                </h3>

                                <p className="mt-1 text-sm text-gray-500">
                                    {selectedEmployee.name} —{" "}
                                    {selectedDate.date}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeAttendanceModal}
                                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <form
                            onSubmit={saveAttendance}
                            className="space-y-4 p-6"
                        >
                            <input
                                type="hidden"
                                value={
                                    individualForm.data.employee_id
                                }
                            />

                            <input
                                type="hidden"
                                value={
                                    individualForm.data.date
                                }
                            />

                            <div className="grid grid-cols-2 gap-4">

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Intrare
                                    </label>

                                    <input
                                        type="time"
                                        value={
                                            individualForm.data.check_in
                                        }
                                        onChange={(e) =>
                                            individualForm.setData(
                                                "check_in",
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border-gray-300"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Iesire
                                    </label>

                                    <input
                                        type="time"
                                        value={
                                            individualForm.data.check_out
                                        }
                                        onChange={(e) =>
                                            individualForm.setData(
                                                "check_out",
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border-gray-300"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Pauza (minute)
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        value={
                                            individualForm.data.break_minutes
                                        }
                                        onChange={(e) =>
                                            individualForm.setData(
                                                "break_minutes",
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border-gray-300"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Status
                                    </label>

                                    <select
                                        value={
                                            individualForm.data.status
                                        }
                                        onChange={(e) =>
                                            individualForm.setData(
                                                "status",
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border-gray-300"
                                    >
                                        <option value="prezent">
                                            Prezent
                                        </option>

                                        <option value="absent">
                                            Absent
                                        </option>

                                        <option value="concediu">
                                            Concediu
                                        </option>

                                        <option value="medical">
                                            Medical
                                        </option>

                                        <option value="liber">
                                            Liber
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Observatii
                                </label>

                                <textarea
                                    rows="3"
                                    value={
                                        individualForm.data.notes
                                    }
                                    onChange={(e) =>
                                        individualForm.setData(
                                            "notes",
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border-gray-300"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">

                                <button
                                    type="button"
                                    onClick={closeAttendanceModal}
                                    className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Anuleaza
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        individualForm.processing
                                    }
                                    className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {individualForm.processing
                                        ? "Se salveaza..."
                                        : "Salveaza"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showQuickModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">

                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    Pontaj rapid
                                </h3>

                                <p className="mt-1 text-sm text-gray-500">
                                    Aplica pontajul tuturor angajatilor activi
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeQuickModal}
                                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <form
                            onSubmit={saveQuickAttendance}
                            className="space-y-4 p-6"
                        >

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Data
                                </label>

                                <input
                                    type="date"
                                    value={quickForm.data.date}
                                    onChange={(e) =>
                                        quickForm.setData(
                                            "date",
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border-gray-300"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Intrare
                                    </label>

                                    <input
                                        type="time"
                                        value={
                                            quickForm.data.check_in
                                        }
                                        onChange={(e) =>
                                            quickForm.setData(
                                                "check_in",
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border-gray-300"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Iesire
                                    </label>

                                    <input
                                        type="time"
                                        value={
                                            quickForm.data.check_out
                                        }
                                        onChange={(e) =>
                                            quickForm.setData(
                                                "check_out",
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border-gray-300"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Pauza (minute)
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        value={
                                            quickForm.data.break_minutes
                                        }
                                        onChange={(e) =>
                                            quickForm.setData(
                                                "break_minutes",
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border-gray-300"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Status
                                    </label>

                                    <select
                                        value={
                                            quickForm.data.status
                                        }
                                        onChange={(e) =>
                                            quickForm.setData(
                                                "status",
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border-gray-300"
                                    >
                                        <option value="prezent">
                                            Prezent
                                        </option>

                                        <option value="absent">
                                            Absent
                                        </option>

                                        <option value="concediu">
                                            Concediu
                                        </option>

                                        <option value="medical">
                                            Medical
                                        </option>

                                        <option value="liber">
                                            Liber
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    Observatii
                                </label>

                                <textarea
                                    rows="3"
                                    value={
                                        quickForm.data.notes
                                    }
                                    onChange={(e) =>
                                        quickForm.setData(
                                            "notes",
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border-gray-300"
                                />
                            </div>

                            <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                                Pontajul va fi aplicat tuturor angajatilor
                                activi pentru data selectata.
                            </div>

                            <div className="flex justify-end gap-2 pt-2">

                                <button
                                    type="button"
                                    onClick={closeQuickModal}
                                    className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Anuleaza
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        quickForm.processing ||
                                        !quickForm.data.date
                                    }
                                    className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {quickForm.processing
                                        ? "Se aplica..."
                                        : "Aplica tuturor"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
