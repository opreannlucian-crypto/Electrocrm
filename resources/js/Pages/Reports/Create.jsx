import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useEffect, useState } from "react";

export default function Create({
    workOrders = [],
    quotes = [],
    licenses = [],
    template = null,
    selectedWorkOrderId = null,
}) {
    const [processing, setProcessing] = useState(false);

    const handleWorkOrderChange = (event) => {
        const value = event.target.value;

        if (!value) {
            return;
        }

        const workOrder = workOrders.find(
            (item) =>
                String(item.id) === String(value)
        );

        if (!workOrder) {
            return;
        }

        const setValue = (selector, value) => {
            const element =
                document.querySelector(selector);

            if (
                element &&
                !element.value &&
                value !== null &&
                value !== undefined
            ) {
                element.value = value;
            }
        };

        setValue(
            'input[name="client_name"]',
            workOrder.client?.name
        );

        setValue(
            'input[name="client_cui"]',
            workOrder.client?.cui
        );

        setValue(
            'input[name="client_address"]',
            workOrder.client?.address
        );

        setValue(
            'input[name="client_phone"]',
            workOrder.client?.phone
        );

        setValue(
            'input[name="contact_person"]',
            workOrder.contact_person
        );

        setValue(
            'input[name="location"]',
            workOrder.address
        );

        setValue(
            'textarea[name="subject"]',
            workOrder.type
        );

        const licenseId =
            workOrder.license_id ||
            workOrder.license?.id ||
            "";

        const licenseSelect =
            document.querySelector(
                'select[name="license_id"]'
            );

        if (
            licenseSelect &&
            licenseId
        ) {
            licenseSelect.value =
                licenseId;

            const license =
                licenses.find(
                    (item) =>
                        String(item.id) ===
                        String(licenseId)
                );

            if (license) {
                const licenseName =
                    document.querySelector(
                        'input[name="license_name"]'
                    );

                const licenseDescription =
                    document.querySelector(
                        'textarea[name="license_description"]'
                    );

                if (licenseName) {
                    licenseName.value =
                        license.name || "";
                }

                if (licenseDescription) {
                    licenseDescription.value =
                        license.description || "";
                }
            }
        }
    };

    useEffect(() => {
        if (selectedWorkOrderId) {
            handleWorkOrderChange({ target: { value: String(selectedWorkOrderId) } });
        }
    }, [selectedWorkOrderId]);

    const handleQuoteChange = (event) => {
        const value = event.target.value;

        if (!value) {
            return;
        }

        const quote = quotes.find(
            (item) =>
                String(item.id) ===
                String(value)
        );

        if (!quote) {
            return;
        }

        const setValue = (selector, value) => {
            const element =
                document.querySelector(selector);

            if (
                element &&
                !element.value &&
                value !== null &&
                value !== undefined
            ) {
                element.value = value;
            }
        };

        setValue(
            'input[name="client_name"]',
            quote.client?.name
        );

        setValue(
            'input[name="client_cui"]',
            quote.client?.cui
        );

        setValue(
            'input[name="client_address"]',
            quote.client?.address
        );

        setValue(
            'input[name="client_phone"]',
            quote.client?.phone
        );

        const title =
            document.querySelector(
                'input[name="title"]'
            );

        if (
            title &&
            title.value === "PROCES-VERBAL" &&
            quote.title
        ) {
            title.value =
                quote.title;
        }

        const licenseId =
            quote.license_id ||
            quote.license?.id ||
            "";

        const licenseSelect =
            document.querySelector(
                'select[name="license_id"]'
            );

        if (
            licenseSelect &&
            licenseId
        ) {
            licenseSelect.value =
                licenseId;

            const license =
                licenses.find(
                    (item) =>
                        String(item.id) ===
                        String(licenseId)
                );

            if (license) {
                const licenseName =
                    document.querySelector(
                        'input[name="license_name"]'
                    );

                const licenseDescription =
                    document.querySelector(
                        'textarea[name="license_description"]'
                    );

                if (licenseName) {
                    licenseName.value =
                        license.name || "";
                }

                if (licenseDescription) {
                    licenseDescription.value =
                        license.description || "";
                }
            }
        }
    };

    const handleLicenseChange = (event) => {
        const value =
            event.target.value;

        const license =
            licenses.find(
                (item) =>
                    String(item.id) ===
                    String(value)
            );

        const licenseName =
            document.querySelector(
                'input[name="license_name"]'
            );

        const licenseDescription =
            document.querySelector(
                'textarea[name="license_description"]'
            );

        if (!value || !license) {
            if (licenseName) {
                licenseName.value = "";
            }

            if (licenseDescription) {
                licenseDescription.value = "";
            }

            return;
        }

        if (licenseName) {
            licenseName.value =
                license.name || "";
        }

        if (licenseDescription) {
            licenseDescription.value =
                license.description || "";
        }
    };

    const submit = (event) => {
        event.preventDefault();

        const form =
            event.currentTarget;

        const formData =
            new FormData(form);

        const data = {
            number:
                formData.get("number") || null,

            title:
                formData.get("title") || "",

            document_date:
                formData.get(
                    "document_date"
                ) || null,

            location:
                formData.get(
                    "location"
                ) || null,

            client_name:
                formData.get(
                    "client_name"
                ) || null,

            client_cui:
                formData.get(
                    "client_cui"
                ) || null,

            client_address:
                formData.get(
                    "client_address"
                ) || null,

            client_phone:
                formData.get(
                    "client_phone"
                ) || null,

            contact_person:
                formData.get(
                    "contact_person"
                ) || null,

            work_order_id:
                formData.get(
                    "work_order_id"
                ) || null,

            quote_id:
                formData.get(
                    "quote_id"
                ) || null,

            license_id:
                formData.get(
                    "license_id"
                ) || null,

            license_name:
                formData.get(
                    "license_name"
                ) || null,

            license_description:
                formData.get(
                    "license_description"
                ) || null,

            participants:
                formData.get(
                    "participants"
                ) || null,

            subject:
                formData.get(
                    "subject"
                ) || null,

            content:
                formData.get(
                    "content"
                ) || null,

            findings:
                formData.get(
                    "findings"
                ) || null,

            conclusions:
                formData.get(
                    "conclusions"
                ) || null,

            observations:
                formData.get(
                    "observations"
                ) || null,

            provider_signature_name:
                formData.get(
                    "provider_signature_name"
                ) || null,

            provider_signature_position:
                formData.get(
                    "provider_signature_position"
                ) || null,

            client_signature_name:
                formData.get(
                    "client_signature_name"
                ) || null,

            client_signature_position:
                formData.get(
                    "client_signature_position"
                ) || null,
        };

        setProcessing(true);

        router.post(
            "/reports",
            data,
            {
                preserveScroll: true,

                onFinish: () => {
                    setProcessing(false);
                },
            }
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Proces-verbal liber
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Creeaza un proces-verbal complet editabil.
                    </p>
                </div>
            }
        >
            <Head title="Proces-verbal liber" />

            <div className="py-8">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-center gap-3">

                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"
                                    />

                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M14 3v5h5"
                                    />
                                </svg>

                            </div>

                            <div>

                                <h1 className="text-2xl font-bold text-gray-900">
                                    Proces-verbal liber
                                </h1>

                                <p className="text-sm text-gray-500">
                                    Completeaza datele documentului.
                                </p>

                            </div>

                        </div>

                        <Link
                            href="/reports"
                            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                            Inapoi
                        </Link>

                    </div>

                    <form
                        onSubmit={submit}
                        className="space-y-6"
                    >

                        {/* ====================================================
                           DATE DOCUMENT
                        ==================================================== */}

                        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                            <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5">

                                <h2 className="text-lg font-bold text-gray-900">
                                    Date document
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Informatii generale despre procesul-verbal.
                                </p>

                            </div>

                            <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-3">

                                <div className="md:col-span-2">

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Titlu proces-verbal *
                                    </label>

                                    <input
                                        type="text"
                                        name="title"
                                        defaultValue={template?.data?.title || "PROCES-VERBAL"}
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Numar document
                                    </label>

                                    <input
                                        type="text"
                                        name="number"
                                        placeholder="PV-001"
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Data documentului
                                    </label>

                                    <input
                                        type="date"
                                        name="document_date"
                                        defaultValue={
                                            new Date()
                                                .toISOString()
                                                .slice(0, 10)
                                        }
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Locatie
                                    </label>

                                    <input
                                        type="text"
                                        name="location"
                                        placeholder="Locatia"
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                            </div>

                        </div>


                        {/* ====================================================
                           ASOCIERI
                        ==================================================== */}

                        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                            <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5">

                                <h2 className="text-lg font-bold text-gray-900">
                                    Asocieri
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Leaga procesul-verbal de o lucrare,
                                    oferta/deviz sau licenta.
                                </p>

                            </div>

                            <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-3">

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Lucrare
                                    </label>

                                    <select
                                        name="work_order_id"
                                        defaultValue={selectedWorkOrderId || ""}
                                        onChange={
                                            handleWorkOrderChange
                                        }
                                        className="w-full rounded-xl border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">
                                            Fara lucrare
                                        </option>

                                        {workOrders.map(
                                            (workOrder) => (
                                                <option
                                                    key={
                                                        workOrder.id
                                                    }
                                                    value={
                                                        workOrder.id
                                                    }
                                                >
                                                    {
                                                        workOrder.number
                                                    }{" "}
                                                    -{" "}
                                                    {
                                                        workOrder.type ||
                                                        "Lucrare"
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Oferta / Deviz
                                    </label>

                                    <select
                                        name="quote_id"
                                        defaultValue=""
                                        onChange={
                                            handleQuoteChange
                                        }
                                        className="w-full rounded-xl border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">
                                            Fara oferta / deviz
                                        </option>

                                        {quotes.map(
                                            (quote) => (
                                                <option
                                                    key={
                                                        quote.id
                                                    }
                                                    value={
                                                        quote.id
                                                    }
                                                >
                                                    {
                                                        quote.number
                                                    }{" "}
                                                    -{" "}
                                                    {
                                                        quote.title ||
                                                        "Document"
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>

                                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">

                                    <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                                        Licenta / autorizatie
                                    </div>

                                    <div className="mt-1 text-sm text-gray-600">
                                        Licenta se preia automat
                                        din lucrare sau oferta/deviz
                                        si va aparea in PDF doar
                                        in antet, sus in dreapta.
                                    </div>

                                    <input
                                        type="hidden"
                                        name="license_id"
                                        defaultValue=""
                                    />

                                    <input
                                        type="hidden"
                                        name="license_name"
                                        defaultValue=""
                                    />

                                    <input
                                        type="hidden"
                                        name="license_description"
                                        defaultValue=""
                                    />

                                </div>

                            </div>

                        </div>


                        {/* ====================================================
                           CLIENT
                        ==================================================== */}

                        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                            <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5">

                                <h2 className="text-lg font-bold text-gray-900">
                                    Beneficiar / Client
                                </h2>

                            </div>

                            <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Client / Institutie
                                    </label>

                                    <input
                                        type="text"
                                        name="client_name"
                                        placeholder="Client / Institutie"
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        CUI
                                    </label>

                                    <input
                                        type="text"
                                        name="client_cui"
                                        placeholder="CUI"
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Adresa
                                    </label>

                                    <input
                                        type="text"
                                        name="client_address"
                                        placeholder="Adresa"
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Telefon
                                    </label>

                                    <input
                                        type="text"
                                        name="client_phone"
                                        placeholder="Telefon"
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                                <div className="md:col-span-2">

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Persoana de contact
                                    </label>

                                    <input
                                        type="text"
                                        name="contact_person"
                                        placeholder="Persoana de contact"
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                            </div>

                        </div>


                        {/* ====================================================
                           PARTICIPANTI
                        ==================================================== */}

                        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                            <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5">

                                <h2 className="text-lg font-bold text-gray-900">
                                    Participanti
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Persoanele care participa la intocmirea
                                    procesului-verbal.
                                </p>

                            </div>

                            <div className="p-6">

                                <textarea
                                    name="participants"
                                    rows={6}
                                    placeholder={
                                        "Exemplu:\n" +
                                        "Ion Popescu - beneficiar\n" +
                                        "Vasile Ionescu - tehnician ELECTRODEP"
                                    }
                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />

                            </div>

                        </div>


                        {/* ====================================================
                           SUBIECT
                        ==================================================== */}

                        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                            <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5">

                                <h2 className="text-lg font-bold text-gray-900">
                                    Obiectul procesului-verbal
                                </h2>

                            </div>

                            <div className="p-6">

                                <textarea
                                    name="subject"
                                    rows={4}
                                    placeholder="Obiectul procesului-verbal..."
                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />

                            </div>

                        </div>


                        {/* ====================================================
                           CONTINUT
                        ==================================================== */}

                        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                            <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5">

                                <h2 className="text-lg font-bold text-gray-900">
                                    Continut
                                </h2>

                            </div>

                            <div className="p-6">

                                <textarea
                                    name="content"
                                    defaultValue={template?.data?.content || ""}
                                    rows={10}
                                    placeholder="Continutul complet al procesului-verbal..."
                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />

                            </div>

                        </div>


                        {/* ====================================================
                           CONSTATARI
                        ==================================================== */}

                        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                            <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5">

                                <h2 className="text-lg font-bold text-gray-900">
                                    Constatari
                                </h2>

                            </div>

                            <div className="p-6">

                                <textarea
                                    name="findings"
                                    defaultValue={template?.data?.findings || ""}
                                    rows={7}
                                    placeholder="Constatari..."
                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />

                            </div>

                        </div>


                        {/* ====================================================
                           CONCLUZII
                        ==================================================== */}

                        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                            <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5">

                                <h2 className="text-lg font-bold text-gray-900">
                                    Concluzii
                                </h2>

                            </div>

                            <div className="p-6">

                                <textarea
                                    name="conclusions"
                                    defaultValue={template?.data?.conclusions || ""}
                                    rows={7}
                                    placeholder="Concluzii..."
                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />

                            </div>

                        </div>


                        {/* ====================================================
                           OBSERVATII
                        ==================================================== */}

                        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                            <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5">

                                <h2 className="text-lg font-bold text-gray-900">
                                    Observatii
                                </h2>

                            </div>

                            <div className="p-6">

                                <textarea
                                    name="observations"
                                    defaultValue={template?.data?.observations || ""}
                                    rows={6}
                                    placeholder="Observatii..."
                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />

                            </div>

                        </div>


                        {/* ====================================================
                           SEMNATURI
                        ==================================================== */}

                        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                            <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5">

                                <h2 className="text-lg font-bold text-gray-900">
                                    Semnaturi
                                </h2>

                            </div>

                            <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Nume reprezentant ELECTRODEP
                                    </label>

                                    <input
                                        type="text"
                                        name="provider_signature_name"
                                        placeholder="Nume reprezentant ELECTRODEP"
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Functie reprezentant ELECTRODEP
                                    </label>

                                    <input
                                        type="text"
                                        name="provider_signature_position"
                                        placeholder="Functie reprezentant ELECTRODEP"
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Nume reprezentant beneficiar
                                    </label>

                                    <input
                                        type="text"
                                        name="client_signature_name"
                                        placeholder="Nume reprezentant beneficiar"
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Functie reprezentant beneficiar
                                    </label>

                                    <input
                                        type="text"
                                        name="client_signature_position"
                                        placeholder="Functie reprezentant beneficiar"
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                            </div>

                        </div>


                        {/* ====================================================
                           ACTIUNI
                        ==================================================== */}

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                            <Link
                                href="/reports"
                                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                            >
                                Renunta
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-7 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing
                                    ? "Se salveaza..."
                                    : "Salveaza procesul-verbal"}
                            </button>

                        </div>

                    </form>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
