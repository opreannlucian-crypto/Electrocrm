import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DocumentSection from "@/Components/DocumentSection";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { useMemo, useState } from "react";

export default function Show({
    workOrder,
    quotes = [],
    products = [],
    unlinkedOfferMaterials = [],
}) {
    const user = usePage().props.auth.user;
    const isTechnician = user?.role === "technician";
    const isAdministrator = user?.role === "administrator";

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

    const mapUrl = (latitude, longitude) =>
        latitude !== null && latitude !== undefined &&
        longitude !== null && longitude !== undefined
            ? "https://www.google.com/maps?q=" + latitude + "," + longitude
            : null;

    const addressForMaps = (address) =>
        String(address || "")
            .replace(/\bstr\.?\s*/gi, "Strada ")
            .replace(/\bmun\.?\s*/gi, "")
            .replace(/\bjud\.?\s*/gi, "")
            .replace(/\s*,\s*/g, ", ")
            .replace(/\s+/g, " ")
            .trim();

    const addressMapUrl = (address, origin = "") =>
        "https://www.google.com/maps/dir/?api=1" +
        (origin ? "&origin=" + encodeURIComponent(origin) : "") +
        "&destination=" + encodeURIComponent(addressForMaps(address) + ", România") +
        "&travelmode=driving";

    const openAddressNavigation = (address) => {
        const openMap = (origin = "") => window.open(
            addressMapUrl(address, origin),
            "_blank",
            "noopener,noreferrer"
        );

        if (!navigator.geolocation) {
            openMap();
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => openMap(
                position.coords.latitude + "," + position.coords.longitude
            ),
            () => openMap(),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const [photoFiles, setPhotoFiles] = useState([]);
    const [photoType, setPhotoType] = useState("before");
    const [photoNotes, setPhotoNotes] = useState("");

    const {
        data: photoData,
        setData: setPhotoData,
        post: postPhoto,
        processing: photoProcessing,
        errors: photoErrors,
        reset: resetPhotoForm,
    } = useForm({
        photos: [],
        type: "before",
        notes: "",
    });

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [pendingStatus, setPendingStatus] = useState(null);

    const [showMaterialModal, setShowMaterialModal] = useState(false);
    const [materialRows, setMaterialRows] = useState([]);

    const employees = useMemo(() => {
        if (Array.isArray(workOrder?.employees) && workOrder.employees.length) {
            return workOrder.employees;
        }

        if (workOrder?.employee) {
            return [workOrder.employee];
        }

        return [];
    }, [workOrder]);

    const timeEntries = useMemo(() => {
        return Array.isArray(workOrder?.time_entries)
            ? workOrder.time_entries
            : Array.isArray(workOrder?.timeEntries)
            ? workOrder.timeEntries
            : [];
    }, [workOrder]);

    const openEntries = useMemo(() => {
        return timeEntries.filter((entry) => !entry.ended_at);
    }, [timeEntries]);

    const hasOpenTimeEntry = openEntries.length > 0;

    function toDateTimeInput(value) {
        if (!value) return "";
        const date = new Date(value);
        const pad = (number) => String(number).padStart(2, "0");
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }

    function editTimeEntry(entry) {
        const startedAt = window.prompt("Start (AAAA-LL-ZZTHH:MM)", toDateTimeInput(entry.started_at));
        if (startedAt === null || !startedAt.trim()) return;
        const endedAt = window.prompt("Stop (AAAA-LL-ZZTHH:MM). Lasă gol dacă lucrarea este încă activă.", toDateTimeInput(entry.ended_at));
        if (endedAt === null) return;
        router.put(route("work_orders.time.update", [workOrder.id, entry.id]), { started_at: startedAt, ended_at: endedAt || null, notes: entry.notes || "" }, { preserveScroll: true });
    }

    const materialsUsed = Array.isArray(workOrder?.materials_used)
        ? workOrder.materials_used
        : Array.isArray(workOrder?.materialsUsed)
        ? workOrder.materialsUsed
        : [];

    const offerMaterialsWithoutProduct = Array.isArray(unlinkedOfferMaterials)
        ? unlinkedOfferMaterials
        : [];

    const hasListedMaterials =
        materialsUsed.length > 0 || offerMaterialsWithoutProduct.length > 0;

    function formatDate(value) {
        if (!value) {
            return "-";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString("ro-RO");
    }

    function formatDateLong(value) {
        if (!value) {
            return "-";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString("ro-RO", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    }

    function formatDateTime(value) {
        if (!value) {
            return "-";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleString("ro-RO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function formatNumber(value) {
        return Number(value || 0).toLocaleString("ro-RO", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }

    function getStatusLabel(status) {
        const statuses = {
            noua: "Nouă",
            programata: "Programată",
            lucru: "În lucru",
            finalizata: "Finalizată",
            anulata: "Anulată",
        };

        return statuses[status] || status || "-";
    }

    function getStatusClasses(status) {
        const classes = {
            noua: "bg-slate-100 text-slate-700 border-slate-200",
            programata: "bg-blue-100 text-blue-700 border-blue-200",
            lucru: "bg-amber-100 text-amber-700 border-amber-200",
            finalizata: "bg-emerald-100 text-emerald-700 border-emerald-200",
            anulata: "bg-red-100 text-red-700 border-red-200",
        };

        return classes[status] || classes.noua;
    }

    function requestStatusChange(status) {
        setPendingStatus(status);
        setShowStatusModal(true);
    }

    function confirmStatusChange() {
        if (!pendingStatus) {
            return;
        }

        router.post(
            route("work_orders.status", workOrder.id),
            {
                status: pendingStatus,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowStatusModal(false);
                    setPendingStatus(null);
                },
                onError: () => {
                    setShowStatusModal(false);
                    setPendingStatus(null);
                },
            }
        );
    }

    function startWork() {
        captureLocation((gps) => router.post(
            route("work_orders.time.start", workOrder.id),
            gps,
            { preserveScroll: true }
        ));
    }

    function stopWork() {
        captureLocation((gps) => router.post(
            route("work_orders.time.stop", workOrder.id),
            gps,
            { preserveScroll: true }
        ));
    }

    function createDevizFromWork() {
        window.location.href = route("quotes.create-deviz", {
            work_order_id: workOrder.id,
            from_work_order: 1,
        });
    }

    function deleteWorkOrder() {
        router.delete(
            route("work_orders.destroy", workOrder.id),
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowDeleteModal(false);
                },
            }
        );
    }

    function handlePhotoFiles(event) {
        const files = Array.from(event.target.files || []);

        setPhotoFiles(files);

        setPhotoData("photos", files);
    }

    function submitPhotos(event) {
        event.preventDefault();

        setPhotoData("type", photoType);
        setPhotoData("notes", photoNotes);

        postPhoto(
            route("work_orders.photos.store", workOrder.id),
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setPhotoFiles([]);
                    setPhotoType("before");
                    setPhotoNotes("");
                    resetPhotoForm();
                },
            }
        );
    }

    function deletePhoto(photoId) {
        if (!confirm("Sigur vrei să ștergi această fotografie?")) {
            return;
        }

        router.delete(
            route("work_orders.photos.destroy", [
                workOrder.id,
                photoId,
            ]),
            {
                preserveScroll: true,
            }
        );
    }

    function openMaterialModal() {
        setMaterialRows(
            materialsUsed.map((item) => ({
                product_id:
                    item.product_id ??
                    item.product?.id ??
                    "",
                quantity: item.quantity ?? "",
            }))
        );

        setShowMaterialModal(true);
    }

    function addMaterialRow() {
        setMaterialRows((rows) => [
            ...rows,
            {
                product_id: "",
                quantity: "",
            },
        ]);
    }

    function removeMaterialRow(index) {
        setMaterialRows((rows) =>
            rows.filter((_, rowIndex) => rowIndex !== index)
        );
    }

    function updateMaterialRow(index, field, value) {
        setMaterialRows((rows) =>
            rows.map((row, rowIndex) =>
                rowIndex === index
                    ? {
                          ...row,
                          [field]: value,
                      }
                    : row
            )
        );
    }

    function saveMaterials() {
        router.put(
            route("work_orders.update", workOrder.id),
            {
                client_id: workOrder.client_id,
                employee_id: workOrder.employee_id ?? "",
                employee_ids: employees.map((employee) => employee.id),
                license_id: workOrder.license_id ?? "",
                type: workOrder.type ?? "",
                priority: workOrder.priority ?? "normal",
                status: workOrder.status ?? "noua",
                scheduled_date: workOrder.scheduled_date
                    ? String(workOrder.scheduled_date).substring(0, 10)
                    : "",
                scheduled_time: workOrder.scheduled_time ?? "",
                address: workOrder.address ?? "",
                contact_person: workOrder.contact_person ?? "",
                phone: workOrder.phone ?? "",
                description: workOrder.description ?? "",
                materials: workOrder.materials ?? "",
                materials_used: materialRows,
                notes: workOrder.notes ?? "",
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowMaterialModal(false);
                },
            }
        );
    }

    const pendingStatusLabel = getStatusLabel(pendingStatus);

    return (
        <AuthenticatedLayout>
            <Head title={`Lucrare ${workOrder?.number || ""}`} />

            <div className="min-h-screen bg-slate-50 py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    {/* HEADER */}

                    <div className="mb-6 overflow-hidden rounded-2xl bg-white shadow-xl">
                        <div className="border-b border-slate-200 px-6 py-6 sm:px-8">
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                                <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="text-sm font-semibold text-slate-500">
                                            Lucrare
                                        </span>

                                        <span className="rounded-lg bg-slate-100 px-3 py-1 font-mono text-sm font-bold text-slate-700">
                                            {workOrder?.number || "-"}
                                        </span>

                                        <span
                                            className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusClasses(
                                                workOrder?.status
                                            )}`}
                                        >
                                            {getStatusLabel(
                                                workOrder?.status
                                            )}
                                        </span>
                                    </div>

                                    <h1 className="mt-3 text-3xl font-bold text-slate-900">
                                        {workOrder?.type || "Lucrare"}
                                    </h1>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Detalii, tehnicieni, pontaj, materiale și documente.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2">

                                    <Link
                                        href={route(
                                            "work_orders.index"
                                        )}
                                        className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                                    >
                                        ← Înapoi
                                    </Link>

                                    {!isTechnician && (
                                        <Link
                                            href={route(
                                                "work_orders.edit",
                                                workOrder.id
                                            )}
                                            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
                                        >
                                            Editează
                                        </Link>
                                    )}

                                    {workOrder?.status !== "lucru" &&
                                        workOrder?.status !==
                                            "finalizata" &&
                                        workOrder?.status !== "anulata" && (
                                            <button
                                                type="button"
                                                onClick={startWork}
                                                style={{ display: isTechnician ? "none" : undefined }}
                                                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
                                            >
                                                ▶ Start lucrare
                                            </button>
                                        )}

                                    {workOrder?.status === "lucru" && (
                                        <button
                                            type="button"
                                            onClick={stopWork}
                                            style={{ display: isTechnician ? "none" : undefined }}
                                            className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
                                        >
                                            ■ Stop lucrare
                                        </button>
                                    )}

                                    {!isTechnician && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowDeleteModal(true)
                                            }
                                            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100"
                                        >
                                            Șterge
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* TEHNICIENI */}

                        <div className="border-b border-slate-200 bg-slate-50 px-6 py-5 sm:px-8">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                                <div>
                                    <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                        Tehnicieni alocați
                                    </div>

                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {employees.length > 0 ? (
                                            employees.map((employee) => {
                                                const employeeOpenEntry =
                                                    openEntries.find(
                                                        (entry) =>
                                                            Number(
                                                                entry.employee_id
                                                            ) ===
                                                            Number(
                                                                employee.id
                                                            )
                                                    );

                                                return (
                                                    <div
                                                        key={employee.id}
                                                        className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2"
                                                    >
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                                            {employee.name
                                                                ?.charAt(0)
                                                                ?.toUpperCase() ||
                                                                "T"}
                                                        </div>

                                                        <div>
                                                            <div className="text-sm font-bold text-blue-900">
                                                                {employee.name}
                                                            </div>

                                                            <div className="text-xs text-blue-700">
                                                                {employeeOpenEntry
                                                                    ? "Lucrează acum"
                                                                    : "Alocat"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <span className="text-sm font-semibold text-red-600">
                                                Nu există tehnicieni alocați.
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                                    <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                        Pontaj lucrare
                                    </div>

                                    <div className="mt-1 text-lg font-bold text-slate-900">
                                        {openEntries.length} /{" "}
                                        {employees.length} activ
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* DATE GENERALE */}

                    <div className="grid gap-6 lg:grid-cols-3">

                        <div className="space-y-6 lg:col-span-2">

                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-200 px-6 py-5">
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Date lucrare
                                    </h2>
                                </div>

                                <div className="grid gap-6 p-6 sm:grid-cols-2">

                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                            Client
                                        </div>

                                        <div className="mt-1 font-bold text-slate-900">
                                            {workOrder?.client?.name || "-"}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                            Tehnician principal
                                        </div>

                                        <div className="mt-1 font-bold text-slate-900">
                                            {workOrder?.employee?.name || "-"}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                            Data programată
                                        </div>

                                        <div className="mt-1 font-bold text-slate-900">
                                            {formatDateLong(
                                                workOrder?.scheduled_date
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                            Ora programată
                                        </div>

                                        <div className="mt-1 font-bold text-slate-900">
                                            {workOrder?.scheduled_time || "-"}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                            Tip lucrare
                                        </div>

                                        <div className="mt-1 font-bold text-slate-900">
                                            {workOrder?.type || "-"}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                            Prioritate
                                        </div>

                                        <div className="mt-1 font-bold text-slate-900">
                                            {workOrder?.priority || "-"}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                            Persoană contact
                                        </div>

                                        <div className="mt-1 font-bold text-slate-900">
                                            {workOrder?.contact_person || "-"}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                            Telefon
                                        </div>

                                        {workOrder?.phone ? (
                                            <a
                                                href={`tel:${workOrder.phone}`}
                                                className="mt-1 inline-flex font-bold text-blue-600 hover:text-blue-700"
                                            >
                                                📞 {workOrder.phone}
                                            </a>
                                        ) : (
                                            <div className="mt-1 font-bold text-slate-900">
                                                -
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t border-slate-200 p-6">
                                    <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                        Adresă intervenție
                                    </div>

                                    <div className="mt-2 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                        <span className="text-lg">
                                            📍
                                        </span>

                                        {workOrder?.address ? (
                                            <a
                                                href={addressMapUrl(workOrder.address)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-semibold text-blue-700 underline hover:text-blue-900"
                                            >
                                                {workOrder.address}
                                                <span className="ml-2 text-sm no-underline">
                                                    Deschide harta ↗
                                                </span>
                                            </a>
                                        ) : (
                                            <span className="font-semibold text-slate-800">-</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* DESCRIERE */}

                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-200 px-6 py-5">
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Descrierea lucrării
                                    </h2>
                                </div>

                                <div className="p-6">
                                    <div className="min-h-[100px] whitespace-pre-line rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
                                        {workOrder?.description ||
                                            "Nu există o descriere pentru această lucrare."}
                                    </div>
                                </div>
                            </div>

                            {/* PONTAJ */}

                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900">
                                            Pontaj lucrare
                                        </h2>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Intervalele de lucru pentru fiecare tehnician.
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
                                        {timeEntries.length} intervale
                                    </div>
                                </div>

                                <div className="p-6">
                                    {employees.length === 0 ? (
                                        <div className="rounded-xl border border-dashed border-red-300 bg-red-50 p-5 text-sm font-semibold text-red-700">
                                            Lucrarea nu are tehnicieni alocați.
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {employees.map((employee) => {
                                                const entries =
                                                    timeEntries.filter(
                                                        (entry) =>
                                                            Number(
                                                                entry.employee_id
                                                            ) ===
                                                            Number(
                                                                employee.id
                                                            )
                                                    );

                                                const totalMinutes =
                                                    entries.reduce(
                                                        (
                                                            total,
                                                            entry
                                                        ) =>
                                                            total +
                                                            Number(
                                                                entry.duration_minutes ||
                                                                    0
                                                            ),
                                                        0
                                                    );

                                                const currentEntry =
                                                    entries.find(
                                                        (entry) =>
                                                            !entry.ended_at
                                                    );

                                                return (
                                                    <div
                                                        key={employee.id}
                                                        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                                                    >
                                                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                                            <div>
                                                                <div className="font-bold text-slate-900">
                                                                    {
                                                                        employee.name
                                                                    }
                                                                </div>

                                                                <div className="mt-1 text-sm text-slate-500">
                                                                    {currentEntry
                                                                        ? "Pontaj activ"
                                                                        : "Fără pontaj activ"}
                                                                </div>
                                                            </div>

                                                            <div className="text-left md:text-right">
                                                                <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                                                    Total
                                                                </div>

                                                                <div className="mt-1 text-lg font-bold text-slate-900">
                                                                    {Math.floor(
                                                                        totalMinutes /
                                                                            60
                                                                    )}{" "}
                                                                    h{" "}
                                                                    {totalMinutes %
                                                                        60}{" "}
                                                                    min
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {entries.length > 0 && (
                                                            <div className="mt-4 overflow-x-auto">
                                                                <table className="min-w-full text-sm">
                                                                    <thead>
                                                                        <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                                                                            <th className="px-3 py-2">
                                                                                Start
                                                                            </th>
                                                                            <th className="px-3 py-2">
                                                                                Stop
                                                                            </th>
                                                                            <th className="px-3 py-2">
                                                                                Durată
                                                                            </th>
                                                                            {isAdministrator && <th className="px-3 py-2">GPS</th>}
                                                                            {isAdministrator && <th className="px-3 py-2 text-right">Acțiune</th>}
                                                                        </tr>
                                                                    </thead>

                                                                    <tbody>
                                                                        {entries.map(
                                                                            (
                                                                                entry
                                                                            ) => (
                                                                                <tr
                                                                                    key={
                                                                                        entry.id
                                                                                    }
                                                                                    className="border-b border-slate-100 last:border-0"
                                                                                >
                                                                                    <td className="px-3 py-3 font-semibold text-slate-700">
                                                                                        {formatDateTime(
                                                                                            entry.started_at
                                                                                        )}
                                                                                    </td>

                                                                                    <td className="px-3 py-3 font-semibold text-slate-700">
                                                                                        {entry.ended_at
                                                                                            ? formatDateTime(
                                                                                                  entry.ended_at
                                                                                              )
                                                                                            : "În desfășurare"}
                                                                                    </td>

                                                                                    <td className="px-3 py-3 font-bold text-slate-900">
                                                                                        {entry.duration_minutes !=
                                                                                        null
                                                                                            ? `${Math.floor(
                                                                                                  Number(
                                                                                                      entry.duration_minutes
                                                                                                  ) /
                                                                                                      60
                                                                                              )} h ${Number(
                                                                                                  entry.duration_minutes
                                                                                              ) % 60} min`
                                                                                            : "-"}
                                                                                    </td>
                                                                                    {isAdministrator && <td className="px-3 py-3"><div className="flex flex-col gap-1 text-xs">{mapUrl(entry.start_latitude, entry.start_longitude) ? <a href={mapUrl(entry.start_latitude, entry.start_longitude)} target="_blank" rel="noreferrer" className="text-blue-700 underline">Start hartă</a> : <span className="text-slate-400">Start: lipsă</span>}{mapUrl(entry.stop_latitude, entry.stop_longitude) ? <a href={mapUrl(entry.stop_latitude, entry.stop_longitude)} target="_blank" rel="noreferrer" className="text-blue-700 underline">Stop hartă</a> : <span className="text-slate-400">Stop: lipsă</span>}</div></td>}
                                                                                    {isAdministrator && <td className="px-3 py-3 text-right"><button type="button" onClick={() => editTimeEntry(entry)} className="rounded border border-blue-600 px-2 py-1 text-xs font-semibold text-blue-700">Corectează</button></td>}
                                                                                </tr>
                                                                            )
                                                                        )}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* MATERIALE */}

                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900">
                                            Materiale consumate
                                        </h2>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Materialele folosite în această lucrare.
                                        </p>
                                    </div>

                                    {!isTechnician && (
                                        <button
                                            type="button"
                                            onClick={openMaterialModal}
                                            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
                                        >
                                            Editează materiale
                                        </button>
                                    )}
                                </div>

                                <div className="p-6">
                                    {!hasListedMaterials ? (
                                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                                            <div className="text-3xl">
                                                📦
                                            </div>

                                            <div className="mt-2 font-bold text-slate-900">
                                                Nu există materiale consumate.
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full text-sm">
                                                <thead>
                                                    <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                                                        <th className="px-3 py-3">
                                                            Produs
                                                        </th>
                                                        <th className="px-3 py-3">
                                                            Cantitate
                                                        </th>
                                                        <th className="px-3 py-3">
                                                            Preț
                                                        </th>
                                                        <th className="px-3 py-3 text-right">
                                                            Total
                                                        </th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {materialsUsed.map(
                                                        (item) => {
                                                            const product =
                                                                item.product;

                                                            const quantity =
                                                                Number(
                                                                    item.quantity ||
                                                                        0
                                                                );

                                                            const unitPrice =
                                                                Number(
                                                                    item.unit_price ??
                                                                        product?.purchase_price ??
                                                                        0
                                                                );

                                                            return (
                                                                <tr
                                                                    key={
                                                                        item.id
                                                                    }
                                                                    className="border-b border-slate-100 last:border-0"
                                                                >
                                                                    <td className="px-3 py-3 font-semibold text-slate-800">
                                                                        {product?.name ||
                                                                            "-"}
                                                                    </td>

                                                                    <td className="px-3 py-3">
                                                                        {formatNumber(
                                                                            quantity
                                                                        )}{" "}
                                                                        {product?.unit ||
                                                                            ""}
                                                                    </td>

                                                                    <td className="px-3 py-3">
                                                                        {formatNumber(
                                                                            unitPrice
                                                                        )}{" "}
                                                                        lei
                                                                    </td>

                                                                    <td className="px-3 py-3 text-right font-bold">
                                                                        {formatNumber(
                                                                            quantity *
                                                                                unitPrice
                                                                        )}{" "}
                                                                        lei
                                                                    </td>
                                                                </tr>
                                                            );
                                                        }
                                                    )}

                                                    {offerMaterialsWithoutProduct.map(
                                                        (item) => {
                                                            const quantity = Number(item.quantity || 0);
                                                            const unitPrice = Number(item.unit_price || 0);

                                                            return (
                                                                <tr
                                                                    key={`offer-material-${item.id}`}
                                                                    className="border-b border-amber-100 bg-amber-50/60 last:border-0"
                                                                >
                                                                    <td className="px-3 py-3 font-semibold text-slate-800">
                                                                        {item.name || "-"}
                                                                        <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                                                                            Din ofertă — neasociat stocului
                                                                        </span>
                                                                    </td>

                                                                    <td className="px-3 py-3">
                                                                        {formatNumber(quantity)} {item.unit || ""}
                                                                    </td>

                                                                    <td className="px-3 py-3">
                                                                        {formatNumber(unitPrice)} lei
                                                                    </td>

                                                                    <td className="px-3 py-3 text-right font-bold">
                                                                        {formatNumber(quantity * unitPrice)} lei
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
                            </div>

                            {/* FOTOGRAFII */}

                            <DocumentSection
                                title="Documente lucrare"
                                documents={workOrder?.documents || []}
                                parentId={workOrder.id}
                                storeRoute="work_orders.documents.store"
                                downloadRoute="work_orders.documents.download"
                                destroyRoute="work_orders.documents.destroy"
                                canDelete={!isTechnician}
                            />

                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-200 px-6 py-5">
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Fotografii lucrare
                                    </h2>
                                </div>

                                <div className="p-6">

                                    <form
                                        onSubmit={submitPhotos}
                                        className="rounded-xl border border-slate-200 bg-slate-50 p-5"
                                    >
                                        <div className="grid gap-4 md:grid-cols-3">

                                            <div className="md:col-span-2">
                                                <label className="mb-2 block text-sm font-bold text-slate-700">
                                                    Fotografii
                                                </label>

                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                                                    onChange={
                                                        handlePhotoFiles
                                                    }
                                                    className="block w-full rounded-xl border border-slate-300 bg-white p-3 text-sm"
                                                />

                                                {photoFiles.length > 0 && (
                                                    <p className="mt-2 text-xs text-slate-500">
                                                        {photoFiles.length} fotografii selectate.
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-bold text-slate-700">
                                                    Tip
                                                </label>

                                                <select
                                                    value={photoType}
                                                    onChange={(e) => {
                                                        setPhotoType(
                                                            e.target.value
                                                        );
                                                        setPhotoData(
                                                            "type",
                                                            e.target.value
                                                        );
                                                    }}
                                                    className="w-full rounded-xl border-slate-300 p-3"
                                                >
                                                    <option value="before">
                                                        Înainte
                                                    </option>

                                                    <option value="during">
                                                        În timpul lucrării
                                                    </option>

                                                    <option value="after">
                                                        După
                                                    </option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <label className="mb-2 block text-sm font-bold text-slate-700">
                                                Observații fotografie
                                            </label>

                                            <textarea
                                                rows="3"
                                                value={photoNotes}
                                                onChange={(e) => {
                                                    setPhotoNotes(
                                                        e.target.value
                                                    );
                                                    setPhotoData(
                                                        "notes",
                                                        e.target.value
                                                    );
                                                }}
                                                className="w-full rounded-xl border-slate-300 p-3"
                                                placeholder="Observații..."
                                            />
                                        </div>

                                        {photoErrors.photos && (
                                            <p className="mt-2 text-sm font-semibold text-red-600">
                                                {photoErrors.photos}
                                            </p>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={
                                                photoProcessing ||
                                                photoFiles.length === 0
                                            }
                                            className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {photoProcessing
                                                ? "Se încarcă..."
                                                : "Încarcă fotografiile"}
                                        </button>
                                    </form>

                                    {workOrder?.photos?.length > 0 && (
                                        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                            {workOrder.photos.map(
                                                (photo) => (
                                                    <div
                                                        key={photo.id}
                                                        className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                                                    >
                                                        <img
                                                            src={`/storage/${photo.file}`}
                                                            alt={
                                                                photo.original_name ||
                                                                "Fotografie lucrare"
                                                            }
                                                            className="h-56 w-full object-cover"
                                                        />

                                                        <div className="p-4">
                                                            <div className="font-bold text-slate-900">
                                                                {photo.original_name ||
                                                                    "Fotografie"}
                                                            </div>

                                                            <div className="mt-1 text-xs font-semibold uppercase text-slate-400">
                                                                {photo.type}
                                                            </div>

                                                            {photo.notes && (
                                                                <div className="mt-2 text-sm text-slate-600">
                                                                    {
                                                                        photo.notes
                                                                    }
                                                                </div>
                                                            )}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    deletePhoto(
                                                                        photo.id
                                                                    )
                                                                }
                                                                className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100"
                                                            >
                                                                Șterge fotografia
                                                            </button>
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* SIDEBAR */}

                        <div className="space-y-6">

                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-slate-900">
                                    Acțiuni
                                </h2>

                                <div className="mt-5 space-y-3">

                                    {workOrder?.status !== "lucru" &&
                                        workOrder?.status !==
                                            "finalizata" &&
                                        workOrder?.status !== "anulata" && (
                                            <button
                                                type="button"
                                                onClick={startWork}
                                                className="w-full rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white transition hover:bg-emerald-700"
                                            >
                                                ▶ START LUCRARE
                                            </button>
                                        )}

                                    {workOrder?.status === "lucru" && (
                                        <button
                                            type="button"
                                            onClick={stopWork}
                                            className="w-full rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700"
                                        >
                                            ■ STOP LUCRARE
                                        </button>
                                    )}

                                    {!isTechnician && (
                                        <button
                                            type="button"
                                            onClick={createDevizFromWork}
                                            className="w-full rounded-xl bg-orange-500 px-5 py-3 font-bold text-white transition hover:bg-orange-600"
                                        >
                                            🧾 Creează deviz din lucrare
                                        </button>
                                    )}

                                    <Link
                                        href={route(
                                            "work_orders.edit",
                                            workOrder.id
                                        )}
                                        className="block w-full rounded-xl border border-blue-200 bg-blue-50 px-5 py-3 text-center font-bold text-blue-700 transition hover:bg-blue-100"
                                    >
                                        Editează lucrarea
                                    </Link>

                                    <Link
                                        href={route("reports.create", { work_order_id: workOrder.id })}
                                        className="block w-full rounded-xl border border-slate-300 bg-white px-5 py-3 text-center font-bold text-slate-700 transition hover:bg-slate-50"
                                    >
                                        Creează proces-verbal
                                    </Link>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-slate-900">
                                    Rezumat pontaj
                                </h2>

                                <div className="mt-5 space-y-4">

                                    {employees.map((employee) => {
                                        const employeeEntries =
                                            timeEntries.filter(
                                                (entry) =>
                                                    Number(
                                                        entry.employee_id
                                                    ) ===
                                                    Number(employee.id)
                                            );

                                        const minutes =
                                            employeeEntries.reduce(
                                                (
                                                    total,
                                                    entry
                                                ) =>
                                                    total +
                                                    Number(
                                                        entry.duration_minutes ||
                                                            0
                                                    ),
                                                0
                                            );

                                        const active =
                                            employeeEntries.some(
                                                (entry) =>
                                                    !entry.ended_at
                                            );

                                        return (
                                            <div
                                                key={employee.id}
                                                className="rounded-xl border border-slate-200 p-4"
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                        <div className="font-bold text-slate-900">
                                                            {
                                                                employee.name
                                                            }
                                                        </div>

                                                        <div
                                                            className={`mt-1 text-xs font-bold ${
                                                                active
                                                                    ? "text-emerald-600"
                                                                    : "text-slate-400"
                                                            }`}
                                                        >
                                                            {active
                                                                ? "● ACTIV"
                                                                : "○ INACTIV"}
                                                        </div>
                                                    </div>

                                                    <div className="text-right">
                                                        <div className="text-xs font-bold uppercase text-slate-400">
                                                            Total
                                                        </div>

                                                        <div className="font-bold text-slate-900">
                                                            {Math.floor(
                                                                minutes /
                                                                    60
                                                            )}{" "}
                                                            h{" "}
                                                            {minutes %
                                                                60}{" "}
                                                            min
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-slate-900">
                                    Informații sistem
                                </h2>

                                <div className="mt-5 space-y-4 text-sm">

                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                            Creată
                                        </div>

                                        <div className="mt-1 font-semibold text-slate-700">
                                            {formatDateTime(
                                                workOrder?.created_at
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                            Pornită
                                        </div>

                                        <div className="mt-1 font-semibold text-slate-700">
                                            {formatDateTime(
                                                workOrder?.started_at
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                            Finalizată
                                        </div>

                                        <div className="mt-1 font-semibold text-slate-700">
                                            {formatDateTime(
                                                workOrder?.completed_at
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL STATUS */}

            {showStatusModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <h2 className="text-xl font-bold text-slate-900">
                            Schimbare status
                        </h2>

                        <p className="mt-3 text-sm text-slate-600">
                            Sigur vrei să schimbi statusul lucrării în{" "}
                            <strong>{pendingStatusLabel}</strong>?
                        </p>

                        {pendingStatus === "lucru" && (
                            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                                La pornire se va crea automat pontaj pentru
                                toți tehnicienii alocați lucrării.
                            </div>
                        )}

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowStatusModal(false);
                                    setPendingStatus(null);
                                }}
                                className="rounded-xl border border-slate-300 px-4 py-2.5 font-bold text-slate-700"
                            >
                                Renunță
                            </button>

                            <button
                                type="button"
                                onClick={confirmStatusChange}
                                className="rounded-xl bg-blue-600 px-5 py-2.5 font-bold text-white"
                            >
                                Confirmă
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL ȘTERGERE */}

            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <h2 className="text-xl font-bold text-red-700">
                            Ștergere lucrare
                        </h2>

                        <p className="mt-3 text-sm text-slate-600">
                            Sigur vrei să ștergi lucrarea{" "}
                            <strong>{workOrder?.number}</strong>?
                        </p>

                        <p className="mt-3 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
                            Materialele consumate vor fi returnate automat în
                            stoc.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    setShowDeleteModal(false)
                                }
                                className="rounded-xl border border-slate-300 px-4 py-2.5 font-bold text-slate-700"
                            >
                                Renunță
                            </button>

                            <button
                                type="button"
                                onClick={deleteWorkOrder}
                                className="rounded-xl bg-red-600 px-5 py-2.5 font-bold text-white hover:bg-red-700"
                            >
                                Șterge definitiv
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL MATERIALE */}

            {showMaterialModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4">
                    <div className="mx-auto mt-10 w-full max-w-4xl rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">
                                    Materiale consumate
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Modificarea cantităților va ajusta automat
                                    stocul.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowMaterialModal(false)
                                }
                                className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4">
                                {materialRows.map((row, index) => {
                                    const product = products.find(
                                        (item) =>
                                            String(item.id) ===
                                            String(row.product_id)
                                    );

                                    return (
                                        <div
                                            key={index}
                                            className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_180px_auto]"
                                        >
                                            <div>
                                                <label className="mb-2 block text-sm font-bold text-slate-700">
                                                    Produs
                                                </label>

                                                <select
                                                    value={
                                                        row.product_id
                                                    }
                                                    onChange={(e) =>
                                                        updateMaterialRow(
                                                            index,
                                                            "product_id",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full rounded-xl border-slate-300 bg-white p-3"
                                                >
                                                    <option value="">
                                                        Selectează produs
                                                    </option>

                                                    {products.map(
                                                        (productItem) => (
                                                            <option
                                                                key={
                                                                    productItem.id
                                                                }
                                                                value={
                                                                    productItem.id
                                                                }
                                                            >
                                                                {
                                                                    productItem.name
                                                                }
                                                                {productItem.code
                                                                    ? ` - ${productItem.code}`
                                                                    : ""}
                                                            </option>
                                                        )
                                                    )}
                                                </select>

                                                {product && (
                                                    <div className="mt-2 text-xs text-slate-500">
                                                        Stoc disponibil:{" "}
                                                        <strong>
                                                            {formatNumber(
                                                                product.stock_quantity
                                                            )}{" "}
                                                            {product.unit}
                                                        </strong>
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm font-bold text-slate-700">
                                                    Cantitate
                                                </label>

                                                <input
                                                    type="number"
                                                    min="0.01"
                                                    step="0.01"
                                                    value={
                                                        row.quantity
                                                    }
                                                    onChange={(e) =>
                                                        updateMaterialRow(
                                                            index,
                                                            "quantity",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full rounded-xl border-slate-300 bg-white p-3"
                                                />
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeMaterialRow(
                                                        index
                                                    )
                                                }
                                                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-100"
                                            >
                                                Șterge
                                            </button>
                                        </div>
                                    );
                                })}

                                {materialRows.length === 0 && (
                                    <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                                        Nu există materiale selectate.
                                    </div>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={addMaterialRow}
                                className="mt-5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
                            >
                                + Adaugă material
                            </button>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-5">
                            <button
                                type="button"
                                onClick={() =>
                                    setShowMaterialModal(false)
                                }
                                className="rounded-xl border border-slate-300 px-5 py-2.5 font-bold text-slate-700"
                            >
                                Renunță
                            </button>

                            <button
                                type="button"
                                onClick={saveMaterials}
                                className="rounded-xl bg-blue-600 px-5 py-2.5 font-bold text-white hover:bg-blue-700"
                            >
                                Salvează materialele
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
