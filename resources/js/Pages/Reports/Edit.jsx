import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";

export default function Edit({
    freeReport,
    workOrders = [],
    quotes = [],
    licenses = [],
}) {
    const [processing, setProcessing] = useState(false);

    const [data, setData] = useState({
        number: freeReport?.number || "",
        title: freeReport?.title || "PROCES-VERBAL",
        document_date:
            freeReport?.document_date
                ? String(freeReport.document_date).slice(0, 10)
                : new Date().toISOString().slice(0, 10),

        location: freeReport?.location || "",

        client_name: freeReport?.client_name || "",
        client_cui: freeReport?.client_cui || "",
        client_address: freeReport?.client_address || "",
        client_phone: freeReport?.client_phone || "",
        contact_person: freeReport?.contact_person || "",

        work_order_id: freeReport?.work_order_id || "",
        quote_id: freeReport?.quote_id || "",
        license_id: freeReport?.license_id || "",

        license_name: freeReport?.license_name || "",
        license_description:
            freeReport?.license_description || "",

        participants: freeReport?.participants || "",
        subject: freeReport?.subject || "",
        content: freeReport?.content || "",
        findings: freeReport?.findings || "",
        conclusions: freeReport?.conclusions || "",
        observations: freeReport?.observations || "",

        provider_signature_name:
            freeReport?.provider_signature_name || "",

        provider_signature_position:
            freeReport?.provider_signature_position || "",

        client_signature_name:
            freeReport?.client_signature_name || "",

        client_signature_position:
            freeReport?.client_signature_position || "",
    });

    const setField = (field, value) => {
        setData((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const handleWorkOrderChange = (event) => {
        const value = event.target.value;

        setData((current) => ({
            ...current,
            work_order_id: value,
        }));

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

        setData((current) => ({
            ...current,

            work_order_id: value,

            client_name:
                workOrder.client?.name ||
                current.client_name,

            client_cui:
                workOrder.client?.cui ||
                current.client_cui,

            client_address:
                workOrder.client?.address ||
                current.client_address,

            client_phone:
                workOrder.client?.phone ||
                current.client_phone,

            contact_person:
                workOrder.contact_person ||
                current.contact_person,

            location:
                workOrder.address ||
                current.location,

            subject:
                workOrder.type ||
                current.subject,

            license_id:
                workOrder.license_id ||
                workOrder.license?.id ||
                current.license_id,

            license_name:
                workOrder.license?.name ||
                current.license_name,

            license_description:
                workOrder.license?.description ||
                current.license_description,
        }));
    };

    const handleQuoteChange = (event) => {
        const value = event.target.value;

        setData((current) => ({
            ...current,
            quote_id: value,
        }));

        if (!value) {
            return;
        }

        const quote = quotes.find(
            (item) =>
                String(item.id) === String(value)
        );

        if (!quote) {
            return;
        }

        setData((current) => ({
            ...current,

            quote_id: value,

            client_name:
                quote.client?.name ||
                current.client_name,

            client_cui:
                quote.client?.cui ||
                current.client_cui,

            client_address:
                quote.client?.address ||
                current.client_address,

            client_phone:
                quote.client?.phone ||
                current.client_phone,

            title:
                quote.title ||
                current.title,

            license_id:
                quote.license_id ||
                quote.license?.id ||
                current.license_id,

            license_name:
                quote.license?.name ||
                current.license_name,

            license_description:
                quote.license?.description ||
                current.license_description,
        }));
    };

    const handleLicenseChange = (event) => {
        const value = event.target.value;

        if (!value) {
            setData((current) => ({
                ...current,
                license_id: "",
                license_name: "",
                license_description: "",
            }));

            return;
        }

        const license = licenses.find(
            (item) =>
                String(item.id) ===
                String(value)
        );

        setData((current) => ({
            ...current,

            license_id: value,

            license_name:
                license?.name ||
                "",

            license_description:
                license?.description ||
                "",
        }));
    };

    const submit = (event) => {
        event.preventDefault();

        setProcessing(true);

        router.put(
            `/reports/${freeReport.id}`,
            data,
            {
                preserveScroll: true,

                onFinish: () => {
                    setProcessing(false);
                },
            }
        );
    };

    const documentDate = data.document_date
        ? new Date(
              data.document_date
          ).toLocaleDateString("ro-RO")
        : "-";

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Editeaza procesul-verbal
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Modifica datele procesului-verbal si salveaza modificarile.
                    </p>
                </div>
            }
        >
            <Head
                title={`Editeaza ${data.number || "procesul-verbal"}`}
            />

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
                                        d="M15.232 5.232l3.536 3.536M4 20h4l10.5-10.5a2.121 2.121 0 10-3-3L5 17v3z"
                                    />
                                </svg>
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Editeaza procesul-verbal
                                </h1>

                                <p className="text-sm text-gray-500">
                                    {data.number || "Proces-verbal"}
                                </p>
                            </div>

                        </div>

                        <div className="flex gap-2">

                            <Link
                                href={`/reports/${freeReport.id}`}
                                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                            >
                                Inapoi
                            </Link>

                        </div>

                    </div>

                    <form
                        onSubmit={submit}
                        className="space-y-6"
                    >

                        {/* =====================================================
                            DATE DOCUMENT
                        ===================================================== */}

                        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                            <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5">

                                <h2 className="text-lg font-bold text-gray-900">
                                    Date document
                                </h2>

                            </div>

                            <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-3">

                                <div className="md:col-span-2">

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Titlu proces-verbal *
                                    </label>

                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(event) =>
                                            setField(
                                                "title",
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Numar document
                                    </label>

                                    <input
                                        type="text"
                                        value={data.number}
                                        onChange={(event) =>
                                            setField(
                                                "number",
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Data documentului
                                    </label>

                                    <input
                                        type="date"
                                        value={data.document_date}
                                        onChange={(event) =>
                                            setField(
                                                "document_date",
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                    <div className="mt-1 text-xs text-gray-500">
                                        {documentDate}
                                    </div>

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Locatie
                                    </label>

                                    <input
                                        type="text"
                                        value={data.location}
                                        onChange={(event) =>
                                            setField(
                                                "location",
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                            </div>

                        </div>

                        {/* =====================================================
                            ASOCIERI
                        ===================================================== */}

                        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                            <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5">

                                <h2 className="text-lg font-bold text-gray-900">
                                    Asocieri
                                </h2>

                            </div>

                            <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-3">

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Lucrare
                                    </label>

                                    <select
                                        value={
                                            data.work_order_id
                                        }
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
                                        value={
                                            data.quote_id
                                        }
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

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Licenta / Autorizatie
                                    </label>

                                    <select
                                        value={
                                            data.license_id
                                        }
                                        onChange={
                                            handleLicenseChange
                                        }
                                        className="w-full rounded-xl border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">
                                            Fara licenta
                                        </option>

                                        {licenses.map(
                                            (license) => (
                                                <option
                                                    key={
                                                        license.id
                                                    }
                                                    value={
                                                        license.id
                                                    }
                                                >
                                                    {
                                                        license.name
                                                    }

                                                    {license.code
                                                        ? ` - ${license.code}`
                                                        : ""}
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>

                            </div>

                        </div>

                        {/* =====================================================
                            CLIENT
                        ===================================================== */}

                        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                            <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5">

                                <h2 className="text-lg font-bold text-gray-900">
                                    Beneficiar / Client
                                </h2>

                            </div>

                            <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">

                                <input
                                    type="text"
                                    value={data.client_name}
                                    onChange={(event) =>
                                        setField(
                                            "client_name",
                                            event.target.value
                                        )
                                    }
                                    placeholder="Client / Institutie"
                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />

                                <input
                                    type="text"
                                    value={data.client_cui}
                                    onChange={(event) =>
                                        setField(
                                            "client_cui",
                                            event.target.value
                                        )
                                    }
                                    placeholder="CUI"
                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />

                                <input
                                    type="text"
                                    value={data.client_address}
                                    onChange={(event) =>
                                        setField(
                                            "client_address",
                                            event.target.value
                                        )
                                    }
                                    placeholder="Adresa"
                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />

                                <input
                                    type="text"
                                    value={data.client_phone}
                                    onChange={(event) =>
                                        setField(
                                            "client_phone",
                                            event.target.value
                                        )
                                    }
                                    placeholder="Telefon"
                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />

                                <input
                                    type="text"
                                    value={
                                        data.contact_person
                                    }
                                    onChange={(event) =>
                                        setField(
                                            "contact_person",
                                            event.target.value
                                        )
                                    }
                                    placeholder="Persoana de contact"
                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 md:col-span-2"
                                />

                            </div>

                        </div>

                        {/* =====================================================
                            LICENTA
                        ===================================================== */}

                        <div className="overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-sm">

                            <div className="border-b border-blue-100 bg-blue-50/60 px-6 py-5">

                                <h2 className="text-lg font-bold text-gray-900">
                                    Licenta / Autorizatie
                                </h2>

                            </div>

                            <div className="space-y-5 p-6">

                                <input
                                    type="text"
                                    value={
                                        data.license_name
                                    }
                                    onChange={(event) =>
                                        setField(
                                            "license_name",
                                            event.target.value
                                        )
                                    }
                                    placeholder="Denumire licenta"
                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />

                                <textarea
                                    value={
                                        data.license_description
                                    }
                                    onChange={(event) =>
                                        setField(
                                            "license_description",
                                            event.target.value
                                        )
                                    }
                                    rows={5}
                                    placeholder="Descriere licenta"
                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />

                            </div>

                        </div>

                        {/* =====================================================
                            PARTICIPANTI
                        ===================================================== */}

                        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                            <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5">

                                <h2 className="text-lg font-bold text-gray-900">
                                    Participanti
                                </h2>

                            </div>

                            <div className="p-6">

                                <textarea
                                    value={
                                        data.participants
                                    }
                                    onChange={(event) =>
                                        setField(
                                            "participants",
                                            event.target.value
                                        )
                                    }
                                    rows={5}
                                    placeholder="Nume si functie..."
                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />

                            </div>

                        </div>

                        {/* =====================================================
                            SUBIECT
                        ===================================================== */}

                        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                            <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5">

                                <h2 className="text-lg font-bold text-gray-900">
                                    Obiectul procesului-verbal
                                </h2>

                            </div>

                            <div className="p-6">

                                <textarea
                                    value={
                                        data.subject
                                    }
                                    onChange={(event) =>
                                        setField(
                                            "subject",
                                            event.target.value
                                        )
                                    }
                                    rows={4}
                                    placeholder="Obiectul procesului-verbal..."
                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />

                            </div>

                        </div>

                        {/* =====================================================
                            CONTINUT
                        ===================================================== */}

                        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                            <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5">

                                <h2 className="text-lg font-bold text-gray-900">
                                    Continut
                                </h2>

                            </div>

                            <div className="p-6">

                                <textarea
                                    value={data.content}
                                    onChange={(event) =>
                                        setField(
                                            "content",
                                            event.target.value
                                        )
                                    }
                                    rows={10}
                                    placeholder="Continutul complet al procesului-verbal..."
                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />

                            </div>

                        </div>

                        {/* =====================================================
                            CONSTATARI
                        ===================================================== */}

                        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                            <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5">

                                <h2 className="text-lg font-bold text-gray-900">
                                    Constatari
                                </h2>

                            </div>

                            <div className="p-6">

                                <textarea
                                    value={
                                        data.findings
                                    }
                                    onChange={(event) =>
                                        setField(
                                            "findings",
                                            event.target.value
                                        )
                                    }
                                    rows={7}
                                    placeholder="Constatari..."
                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />

                            </div>

                        </div>

                        {/* =====================================================
                            CONCLUZII
                        ===================================================== */}

                        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                            <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5">

                                <h2 className="text-lg font-bold text-gray-900">
                                    Concluzii
                                </h2>

                            </div>

                            <div className="p-6">

                                <textarea
                                    value={
                                        data.conclusions
                                    }
                                    onChange={(event) =>
                                        setField(
                                            "conclusions",
                                            event.target.value
                                        )
                                    }
                                    rows={7}
                                    placeholder="Concluzii..."
                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />

                            </div>

                        </div>

                        {/* =====================================================
                            OBSERVATII
                        ===================================================== */}

                        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                            <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5">

                                <h2 className="text-lg font-bold text-gray-900">
                                    Observatii
                                </h2>

                            </div>

                            <div className="p-6">

                                <textarea
                                    value={
                                        data.observations
                                    }
                                    onChange={(event) =>
                                        setField(
                                            "observations",
                                            event.target.value
                                        )
                                    }
                                    rows={6}
                                    placeholder="Observatii..."
                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />

                            </div>

                        </div>

                        {/* =====================================================
                            SEMNATURI
                        ===================================================== */}

                        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                            <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5">

                                <h2 className="text-lg font-bold text-gray-900">
                                    Semnaturi
                                </h2>

                            </div>

                            <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">

                                <input
                                    type="text"
                                    value={
                                        data.provider_signature_name
                                    }
                                    onChange={(event) =>
                                        setField(
                                            "provider_signature_name",
                                            event.target.value
                                        )
                                    }
                                    placeholder="Nume reprezentant ELECTRODEP"
                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />

                                <input
                                    type="text"
                                    value={
                                        data.provider_signature_position
                                    }
                                    onChange={(event) =>
                                        setField(
                                            "provider_signature_position",
                                            event.target.value
                                        )
                                    }
                                    placeholder="Functie reprezentant ELECTRODEP"
                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />

                                <input
                                    type="text"
                                    value={
                                        data.client_signature_name
                                    }
                                    onChange={(event) =>
                                        setField(
                                            "client_signature_name",
                                            event.target.value
                                        )
                                    }
                                    placeholder="Nume reprezentant beneficiar"
                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />

                                <input
                                    type="text"
                                    value={
                                        data.client_signature_position
                                    }
                                    onChange={(event) =>
                                        setField(
                                            "client_signature_position",
                                            event.target.value
                                        )
                                    }
                                    placeholder="Functie reprezentant beneficiar"
                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />

                            </div>

                        </div>

                        {/* =====================================================
                            BUTOANE
                        ===================================================== */}

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                            <Link
                                href={`/reports/${freeReport.id}`}
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
                                    : "Salveaza modificarile"}
                            </button>

                        </div>

                    </form>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}