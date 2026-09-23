import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { useRef, useState } from "react";

export default function Show({ employee }) {
    const histories = Array.isArray(employee?.histories)
        ? employee.histories
        : [];

    const documents = Array.isArray(employee?.documents)
        ? employee.documents
        : [];

    const fileInputRef = useRef(null);

    const [showDocumentForm, setShowDocumentForm] =
        useState(false);

    const [deletingDocumentId, setDeletingDocumentId] =
        useState(null);

    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
    } = useForm({
        category: "alte_documente",
        name: "",
        document_number: "",
        document_date: "",
        valid_from: "",
        valid_until: "",
        period_start: "",
        period_end: "",
        status: "",
        description: "",
        file: null,
    });

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

    function formatDateTime(date) {
        if (!date) {
            return "-";
        }

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) {
            return String(date);
        }

        return parsed.toLocaleString("ro-RO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function formatSalary(value) {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "-";
        }

        const number = Number(value);

        if (Number.isNaN(number)) {
            return String(value);
        }

        return `${number.toLocaleString("ro-RO", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })} lei`;
    }

    function formatFileSize(bytes) {
        if (
            bytes === null ||
            bytes === undefined ||
            bytes === ""
        ) {
            return "-";
        }

        const size = Number(bytes);

        if (Number.isNaN(size) || size < 0) {
            return "-";
        }

        if (size < 1024) {
            return `${size} B`;
        }

        if (size < 1024 * 1024) {
            return `${(size / 1024).toFixed(1)} KB`;
        }

        if (size < 1024 * 1024 * 1024) {
            return `${(size / (1024 * 1024)).toFixed(1)} MB`;
        }

        return `${(
            size /
            (1024 * 1024 * 1024)
        ).toFixed(1)} GB`;
    }

    function fieldLabel(field) {
        const labels = {
            name: "Nume",
            cnp: "CNP",
            phone: "Telefon",
            email: "Email",
            position: "Functie",
            department: "Departament",
            hire_date: "Data angajarii",
            salary: "Salariu",
            schedule: "Program",
            status: "Status",
            active: "Activ",
            notes: "Observatii",
        };

        return labels[field] || field || "Modificare";
    }

    function displayHistoryValue(history, value) {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "-";
        }

        if (history.field === "hire_date") {
            return formatDate(value);
        }

        if (history.field === "salary") {
            return String(value).includes("lei")
                ? value
                : formatSalary(value);
        }

        if (history.field === "active") {
            return value === "1"
                ? "Da"
                : value === "0"
                  ? "Nu"
                  : value;
        }

        return value;
    }

    function getCategoryLabel(category) {
        const categories = {
            contract_munca: "Contract de munca",
            act_aditional: "Act aditional",
            fisa_postului: "Fisa postului",
            cerere_concediu: "Cerere de concediu",
            demisie_incetare: "Demisie / Incetare",
            medical: "Document medical",
            decizie: "Decizie",
            adeverinta: "Adeverinta",
            declaratie: "Declaratie",
            evaluare: "Evaluare",
            instruire_autorizare:
                "Instruire / Autorizare",
            alte_documente: "Alte documente",
        };

        return categories[category] || category || "-";
    }

    function getFileIcon(mimeType, fileName) {
        const mime = String(mimeType || "").toLowerCase();
        const name = String(fileName || "").toLowerCase();

        if (
            mime.includes("pdf") ||
            name.endsWith(".pdf")
        ) {
            return "📕";
        }

        if (
            mime.includes("word") ||
            name.endsWith(".doc") ||
            name.endsWith(".docx")
        ) {
            return "📘";
        }

        if (
            mime.includes("excel") ||
            mime.includes("spreadsheet") ||
            name.endsWith(".xls") ||
            name.endsWith(".xlsx")
        ) {
            return "📗";
        }

        if (
            mime.startsWith("image/") ||
            /\.(jpg|jpeg|png|webp)$/i.test(name)
        ) {
            return "🖼️";
        }

        return "📄";
    }

    function submitDocument(event) {
        event.preventDefault();

        post(
            route(
                "employees.documents.store",
                employee.id
            ),
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    setShowDocumentForm(false);

                    if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                    }
                },
            }
        );
    }

    function deleteDocument(documentId) {
        const confirmed = window.confirm(
            "Sigur vrei sa stergi acest document? Fisierul va fi sters definitiv."
        );

        if (!confirmed) {
            return;
        }

        setDeletingDocumentId(documentId);

        router.delete(
            route(
                "employees.documents.destroy",
                [
                    employee.id,
                    documentId,
                ]
            ),
            {
                preserveScroll: true,
                onFinish: () => {
                    setDeletingDocumentId(null);
                },
            }
        );
    }

    function cancelDocumentForm() {
        reset();
        setShowDocumentForm(false);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Fisa angajatului
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            {employee?.name || "-"}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={route(
                                "employees.edit",
                                employee.id
                            )}
                            className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                        >
                            Editeaza
                        </Link>

                        <Link
                            href={route(
                                "employees.index"
                            )}
                            className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                        >
                            Inapoi
                        </Link>
                    </div>
                </div>
            }
        >
            <Head
                title={`Angajat ${employee?.name || ""}`}
            />

            <div className="py-8">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

                    <div className="mb-6 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-7 text-white sm:px-8">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-5">
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-3xl backdrop-blur-sm">
                                        👤
                                    </div>

                                    <div>
                                        <div className="text-sm font-medium text-blue-100">
                                            Angajat
                                        </div>

                                        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                                            {employee?.name || "-"}
                                        </h1>

                                        <p className="mt-1 text-sm text-blue-100">
                                            {employee?.position ||
                                                "Fara functie"}
                                        </p>
                                    </div>
                                </div>

                                <div className="self-start rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm sm:self-auto">
                                    <div className="text-xs font-semibold uppercase tracking-wide text-blue-100">
                                        Status
                                    </div>

                                    <div className="mt-1 text-lg font-bold">
                                        {employee?.status ||
                                            "Activ"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 rounded-3xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-5 sm:px-8">
                            <h2 className="text-lg font-bold text-gray-900">
                                Date personale
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Informatii de identificare si contact
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2 sm:p-8">
                            <div className="rounded-2xl bg-gray-50 p-5">
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Nume complet
                                </div>

                                <div className="mt-2 text-base font-semibold text-gray-900">
                                    {employee?.name || "-"}
                                </div>
                            </div>

                            <div className="rounded-2xl bg-gray-50 p-5">
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    CNP
                                </div>

                                <div className="mt-2 text-base font-semibold text-gray-900">
                                    {employee?.cnp || "-"}
                                </div>
                            </div>

                            <div className="rounded-2xl bg-gray-50 p-5">
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Telefon
                                </div>

                                <div className="mt-2 text-base font-semibold text-gray-900">
                                    {employee?.phone || "-"}
                                </div>
                            </div>

                            <div className="rounded-2xl bg-gray-50 p-5">
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Email
                                </div>

                                <div className="mt-2 break-all text-base font-semibold text-gray-900">
                                    {employee?.email || "-"}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 rounded-3xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-5 sm:px-8">
                            <h2 className="text-lg font-bold text-gray-900">
                                Date profesionale
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Informatii despre postul si conditiile de munca
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2 lg:grid-cols-3 sm:p-8">
                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Functie
                                </div>

                                <div className="mt-2 text-base font-bold text-gray-900">
                                    {employee?.position || "-"}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Departament
                                </div>

                                <div className="mt-2 text-base font-bold text-gray-900">
                                    {employee?.department || "-"}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Data angajarii
                                </div>

                                <div className="mt-2 text-base font-bold text-gray-900">
                                    {formatDate(
                                        employee?.hire_date
                                    )}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Salariu
                                </div>

                                <div className="mt-2 text-base font-bold text-gray-900">
                                    {formatSalary(
                                        employee?.salary
                                    )}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Program
                                </div>

                                <div className="mt-2 text-base font-bold text-gray-900">
                                    {employee?.schedule || "-"}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Status
                                </div>

                                <div className="mt-2">
                                    <span
                                        className={`inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ${
                                            employee?.status ===
                                            "Activ"
                                                ? "bg-green-100 text-green-700"
                                                : employee?.status ===
                                                    "Concediu"
                                                  ? "bg-yellow-100 text-yellow-700"
                                                  : "bg-red-100 text-red-700"
                                        }`}
                                    >
                                        {employee?.status ||
                                            "Activ"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {employee?.notes && (
                        <div className="mb-6 rounded-3xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-100 px-6 py-5 sm:px-8">
                                <h2 className="text-lg font-bold text-gray-900">
                                    Observatii
                                </h2>
                            </div>

                            <div className="whitespace-pre-line px-6 py-6 text-sm leading-7 text-gray-700 sm:px-8">
                                {employee.notes}
                            </div>
                        </div>
                    )}

                    <div className="mb-6 rounded-3xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-5 sm:px-8">
                            <div className="flex flex-col gap-4">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">
                                        Documente angajat
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Documentele si actele asociate acestui angajat
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <Link
                                        href={route(
                                            "employees.documents.leave-request.create",
                                            employee.id
                                        )}
                                        className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
                                    >
                                        📅 Cerere concediu
                                    </Link>

                                    <Link
                                        href={route(
                                            "employees.documents.termination-request.create",
                                            employee.id
                                        )}
                                        className="inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
                                    >
                                        📄 Demisie / Incetare
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowDocumentForm(
                                                !showDocumentForm
                                            )
                                        }
                                        className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
                                    >
                                        {showDocumentForm
                                            ? "Inchide"
                                            : "+ Adauga document"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {showDocumentForm && (
                            <form
                                onSubmit={submitDocument}
                                className="border-b border-gray-100 bg-gray-50 px-6 py-6 sm:px-8"
                            >
                                <div className="mb-6">
                                    <h3 className="text-base font-bold text-gray-900">
                                        Incarca document nou
                                    </h3>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Completeaza informatiile documentului si selecteaza fisierul.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Categorie
                                        </label>

                                        <select
                                            value={
                                                data.category
                                            }
                                            onChange={(event) =>
                                                setData(
                                                    "category",
                                                    event.target.value
                                                )
                                            }
                                            className="w-full rounded-xl border-gray-300 bg-white text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            <option value="contract_munca">
                                                Contract de munca
                                            </option>

                                            <option value="act_aditional">
                                                Act aditional
                                            </option>

                                            <option value="fisa_postului">
                                                Fisa postului
                                            </option>

                                            <option value="cerere_concediu">
                                                Cerere de concediu
                                            </option>

                                            <option value="demisie_incetare">
                                                Demisie / Incetare
                                            </option>

                                            <option value="medical">
                                                Document medical
                                            </option>

                                            <option value="decizie">
                                                Decizie
                                            </option>

                                            <option value="adeverinta">
                                                Adeverinta
                                            </option>

                                            <option value="declaratie">
                                                Declaratie
                                            </option>

                                            <option value="evaluare">
                                                Evaluare
                                            </option>

                                            <option value="instruire_autorizare">
                                                Instruire / Autorizare
                                            </option>

                                            <option value="alte_documente">
                                                Alte documente
                                            </option>
                                        </select>

                                        {errors.category && (
                                            <p className="mt-1 text-xs text-red-600">
                                                {errors.category}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Denumire document *
                                        </label>

                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(event) =>
                                                setData(
                                                    "name",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Ex: Contract individual de munca"
                                            className="w-full rounded-xl border-gray-300 bg-white text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />

                                        {errors.name && (
                                            <p className="mt-1 text-xs text-red-600">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Numar document
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                data.document_number
                                            }
                                            onChange={(event) =>
                                                setData(
                                                    "document_number",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Ex: 123/2026"
                                            className="w-full rounded-xl border-gray-300 bg-white text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />

                                        {errors.document_number && (
                                            <p className="mt-1 text-xs text-red-600">
                                                {errors.document_number}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Data documentului
                                        </label>

                                        <input
                                            type="date"
                                            value={
                                                data.document_date
                                            }
                                            onChange={(event) =>
                                                setData(
                                                    "document_date",
                                                    event.target.value
                                                )
                                            }
                                            className="w-full rounded-xl border-gray-300 bg-white text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />

                                        {errors.document_date && (
                                            <p className="mt-1 text-xs text-red-600">
                                                {errors.document_date}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Valabil de la
                                        </label>

                                        <input
                                            type="date"
                                            value={
                                                data.valid_from
                                            }
                                            onChange={(event) =>
                                                setData(
                                                    "valid_from",
                                                    event.target.value
                                                )
                                            }
                                            className="w-full rounded-xl border-gray-300 bg-white text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />

                                        {errors.valid_from && (
                                            <p className="mt-1 text-xs text-red-600">
                                                {errors.valid_from}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Valabil pana la
                                        </label>

                                        <input
                                            type="date"
                                            value={
                                                data.valid_until
                                            }
                                            onChange={(event) =>
                                                setData(
                                                    "valid_until",
                                                    event.target.value
                                                )
                                            }
                                            className="w-full rounded-xl border-gray-300 bg-white text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />

                                        {errors.valid_until && (
                                            <p className="mt-1 text-xs text-red-600">
                                                {errors.valid_until}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Inceput perioada
                                        </label>

                                        <input
                                            type="date"
                                            value={
                                                data.period_start
                                            }
                                            onChange={(event) =>
                                                setData(
                                                    "period_start",
                                                    event.target.value
                                                )
                                            }
                                            className="w-full rounded-xl border-gray-300 bg-white text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />

                                        {errors.period_start && (
                                            <p className="mt-1 text-xs text-red-600">
                                                {errors.period_start}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Sfarsit perioada
                                        </label>

                                        <input
                                            type="date"
                                            value={
                                                data.period_end
                                            }
                                            onChange={(event) =>
                                                setData(
                                                    "period_end",
                                                    event.target.value
                                                )
                                            }
                                            className="w-full rounded-xl border-gray-300 bg-white text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />

                                        {errors.period_end && (
                                            <p className="mt-1 text-xs text-red-600">
                                                {errors.period_end}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Status
                                        </label>

                                        <input
                                            type="text"
                                            value={data.status}
                                            onChange={(event) =>
                                                setData(
                                                    "status",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Ex: Activ, Expirat, In asteptare"
                                            className="w-full rounded-xl border-gray-300 bg-white text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />

                                        {errors.status && (
                                            <p className="mt-1 text-xs text-red-600">
                                                {errors.status}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Fisier *
                                        </label>

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx"
                                            onChange={(event) =>
                                                setData(
                                                    "file",
                                                    event.target.files?.[0] ||
                                                        null
                                                )
                                            }
                                            className="block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                                        />

                                        <p className="mt-2 text-xs text-gray-500">
                                            PDF, JPG, PNG, WEBP, DOC, DOCX, XLS sau XLSX. Maximum 20 MB.
                                        </p>

                                        {errors.file && (
                                            <p className="mt-1 text-xs text-red-600">
                                                {errors.file}
                                            </p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Descriere / Observatii
                                        </label>

                                        <textarea
                                            rows="4"
                                            value={
                                                data.description
                                            }
                                            onChange={(event) =>
                                                setData(
                                                    "description",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Observatii despre document..."
                                            className="w-full rounded-xl border-gray-300 bg-white text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />

                                        {errors.description && (
                                            <p className="mt-1 text-xs text-red-600">
                                                {errors.description}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={cancelDocumentForm}
                                        className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                                    >
                                        Anuleaza
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {processing
                                            ? "Se incarca..."
                                            : "Incarca document"}
                                    </button>
                                </div>
                            </form>
                        )}

                        {documents.length === 0 ? (
                            <div className="px-6 py-14 text-center sm:px-8">
                                <div className="mb-4 text-5xl">
                                    📁
                                </div>

                                <h3 className="text-lg font-semibold text-gray-800">
                                    Nu exista documente
                                </h3>

                                <p className="mt-2 text-sm text-gray-500">
                                    Pentru acest angajat nu a fost incarcat niciun document.
                                </p>

                                {!showDocumentForm && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowDocumentForm(
                                                true
                                            )
                                        }
                                        className="mt-5 inline-flex items-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
                                    >
                                        + Adauga primul document
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {documents.map((document) => (
                                    <div
                                        key={document.id}
                                        className="px-6 py-6 sm:px-8"
                                    >
                                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                                            <div className="flex min-w-0 gap-4">
                                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gray-50 text-2xl">
                                                    {getFileIcon(
                                                        document.mime_type,
                                                        document.original_name
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="break-words text-base font-bold text-gray-900">
                                                            {document.name}
                                                        </h3>

                                                        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                                            {getCategoryLabel(
                                                                document.category
                                                            )}
                                                        </span>
                                                    </div>

                                                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500">
                                                        {document.document_number && (
                                                            <span>
                                                                Nr:{" "}
                                                                <strong className="font-semibold text-gray-700">
                                                                    {
                                                                        document.document_number
                                                                    }
                                                                </strong>
                                                            </span>
                                                        )}

                                                        {document.document_date && (
                                                            <span>
                                                                Data:{" "}
                                                                <strong className="font-semibold text-gray-700">
                                                                    {formatDate(
                                                                        document.document_date
                                                                    )}
                                                                </strong>
                                                            </span>
                                                        )}

                                                        {document.valid_from && (
                                                            <span>
                                                                De la:{" "}
                                                                <strong className="font-semibold text-gray-700">
                                                                    {formatDate(
                                                                        document.valid_from
                                                                    )}
                                                                </strong>
                                                            </span>
                                                        )}

                                                        {document.valid_until && (
                                                            <span>
                                                                Pana la:{" "}
                                                                <strong className="font-semibold text-gray-700">
                                                                    {formatDate(
                                                                        document.valid_until
                                                                    )}
                                                                </strong>
                                                            </span>
                                                        )}
                                                    </div>

                                                    {(document.period_start ||
                                                        document.period_end) && (
                                                        <div className="mt-2 text-sm text-gray-500">
                                                            Perioada:{" "}
                                                            <strong className="font-semibold text-gray-700">
                                                                {formatDate(
                                                                    document.period_start
                                                                )}
                                                                {" - "}
                                                                {formatDate(
                                                                    document.period_end
                                                                )}
                                                            </strong>
                                                        </div>
                                                    )}

                                                    {document.status && (
                                                        <div className="mt-2">
                                                            <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                                                                Status:{" "}
                                                                {
                                                                    document.status
                                                                }
                                                            </span>
                                                        </div>
                                                    )}

                                                    {document.description && (
                                                        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-600">
                                                            {
                                                                document.description
                                                            }
                                                        </p>
                                                    )}

                                                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400">
                                                        <span>
                                                            {document.original_name ||
                                                                document.name}
                                                        </span>

                                                        <span>
                                                            {formatFileSize(
                                                                document.file_size
                                                            )}
                                                        </span>

                                                        {document.user?.name && (
                                                            <span>
                                                                Incarcat de:{" "}
                                                                {
                                                                    document
                                                                        .user
                                                                        .name
                                                                }
                                                            </span>
                                                        )}

                                                        {document.created_at && (
                                                            <span>
                                                                {formatDateTime(
                                                                    document.created_at
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
                                                <a
                                                    href={route(
                                                        "employees.documents.download",
                                                        [
                                                            employee.id,
                                                            document.id,
                                                        ]
                                                    )}
                                                    className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                                                >
                                                    Descarca
                                                </a>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        deleteDocument(
                                                            document.id
                                                        )
                                                    }
                                                    disabled={
                                                        deletingDocumentId ===
                                                        document.id
                                                    }
                                                    className="inline-flex items-center justify-center rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    {deletingDocumentId ===
                                                    document.id
                                                        ? "Se sterge..."
                                                        : "Sterge"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-6 py-5 sm:px-8">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">
                                        Istoric angajat
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Modificarile efectuate asupra fisei angajatului
                                    </p>
                                </div>

                                <div className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-700">
                                    {histories.length}{" "}
                                    {histories.length === 1
                                        ? "inregistrare"
                                        : "inregistrari"}
                                </div>
                            </div>
                        </div>

                        {histories.length === 0 ? (
                            <div className="px-6 py-14 text-center sm:px-8">
                                <div className="mb-4 text-4xl">
                                    🕘
                                </div>

                                <h3 className="text-lg font-semibold text-gray-800">
                                    Nu exista inca istoric
                                </h3>

                                <p className="mt-2 text-sm text-gray-500">
                                    Modificarile angajatului vor aparea aici.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {histories.map((history) => (
                                    <div
                                        key={history.id}
                                        className="px-6 py-6 sm:px-8"
                                    >
                                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                                        {history.action ===
                                                        "created"
                                                            ? "Creat"
                                                            : "Modificare"}
                                                    </span>

                                                    {history.field && (
                                                        <span className="text-sm font-bold text-gray-900">
                                                            {fieldLabel(
                                                                history.field
                                                            )}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="mt-3">
                                                    <p className="text-sm font-medium text-gray-700">
                                                        {
                                                            history.description
                                                        }
                                                    </p>

                                                    {history.action !==
                                                        "created" &&
                                                        history.field && (
                                                            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                                                <div className="rounded-xl border border-red-100 bg-red-50 p-4">
                                                                    <div className="text-xs font-semibold uppercase tracking-wide text-red-500">
                                                                        Valoare veche
                                                                    </div>

                                                                    <div className="mt-2 whitespace-pre-line break-words text-sm font-semibold text-red-800">
                                                                        {displayHistoryValue(
                                                                            history,
                                                                            history.old_value
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                                                                    <div className="text-xs font-semibold uppercase tracking-wide text-green-600">
                                                                        Valoare noua
                                                                    </div>

                                                                    <div className="mt-2 whitespace-pre-line break-words text-sm font-semibold text-green-800">
                                                                        {displayHistoryValue(
                                                                            history,
                                                                            history.new_value
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                </div>
                                            </div>

                                            <div className="shrink-0 rounded-xl bg-gray-50 px-4 py-3 lg:min-w-[190px]">
                                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                    Data modificarii
                                                </div>

                                                <div className="mt-1 text-sm font-semibold text-gray-800">
                                                    {formatDateTime(
                                                        history.created_at
                                                    )}
                                                </div>

                                                <div className="mt-2 text-xs text-gray-500">
                                                    {history.user?.name
                                                        ? `De: ${history.user.name}`
                                                        : "Utilizator necunoscut"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Link
                            href={route(
                                "employees.index"
                            )}
                            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                        >
                            Inapoi la angajati
                        </Link>

                        <Link
                            href={route(
                                "employees.edit",
                                employee.id
                            )}
                            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
                        >
                            Editeaza angajatul
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}