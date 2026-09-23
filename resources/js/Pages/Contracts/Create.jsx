import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";

export default function Create({
    clients = [],
    workOrders = [],
    quotes = [],
    licenses = [],
    templates = [],
    template = null,
}) {
    const [processing, setProcessing] = useState(false);

    const [data, setData] = useState({
        number: "",
        title:
            template?.title ||
            template?.name ||
            "CONTRACT",

        contract_date:
            new Date()
                .toISOString()
                .slice(0, 10),

        type:
            template?.type ||
            "",

        status: "draft",

        client_id: "",

        work_order_id: "",
        quote_id: "",

        license_id: "",
        license_name: "",
        license_description: "",

        location: "",
        contact_person: "",

        subject: "",

        value:
            template?.default_value ||
            "",

        currency: "RON",

        duration:
            template?.default_duration ||
            "",

        payment_terms:
            template?.default_payment_terms ||
            "",

        content:
            template?.content ||
            "",

        clauses: "",

        observations:
            template?.default_notes ||
            "",

        provider_signature_name:
            template?.provider_signature_name ||
            "",

        provider_signature_position:
            template?.provider_signature_position ||
            "",

        client_signature_name:
            template?.client_signature_name ||
            "",

        client_signature_position:
            template?.client_signature_position ||
            "",

        template_id:
            template?.id ||
            "",
    });

    const setField = (field, value) => {
        setData((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const handleTemplateChange = (event) => {
        const value = event.target.value;

        if (!value) {
            setData((current) => ({
                ...current,
                template_id: "",
            }));

            return;
        }

        const selectedTemplate =
            templates.find(
                (item) =>
                    String(item.id) ===
                    String(value)
            );

        if (!selectedTemplate) {
            return;
        }

        setData((current) => ({
            ...current,

            template_id:
                selectedTemplate.id,

            title:
                selectedTemplate.title ||
                selectedTemplate.name ||
                current.title,

            type:
                selectedTemplate.type ||
                current.type,

            value:
                selectedTemplate.default_value ??
                current.value,

            duration:
                selectedTemplate.default_duration ||
                current.duration,

            payment_terms:
                selectedTemplate.default_payment_terms ||
                current.payment_terms,

            content:
                selectedTemplate.content ||
                current.content,

            observations:
                selectedTemplate.default_notes ||
                current.observations,

            provider_signature_name:
                selectedTemplate.provider_signature_name ||
                current.provider_signature_name,

            provider_signature_position:
                selectedTemplate.provider_signature_position ||
                current.provider_signature_position,

            client_signature_name:
                selectedTemplate.client_signature_name ||
                current.client_signature_name,

            client_signature_position:
                selectedTemplate.client_signature_position ||
                current.client_signature_position,
        }));
    };

    const handleClientChange = (event) => {
        setField(
            "client_id",
            event.target.value
        );
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

        const workOrder =
            workOrders.find(
                (item) =>
                    String(item.id) ===
                    String(value)
            );

        if (!workOrder) {
            return;
        }

        setData((current) => ({
            ...current,

            work_order_id: value,

            client_id:
                current.client_id ||
                workOrder.client_id ||
                workOrder.client?.id ||
                "",

            location:
                current.location ||
                workOrder.address ||
                "",

            contact_person:
                current.contact_person ||
                workOrder.contact_person ||
                "",

            license_id:
                current.license_id ||
                workOrder.license_id ||
                workOrder.license?.id ||
                "",

            license_name:
                current.license_name ||
                workOrder.license?.name ||
                "",

            license_description:
                current.license_description ||
                workOrder.license?.description ||
                "",

            subject:
                current.subject ||
                workOrder.type ||
                "",
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

        const quote =
            quotes.find(
                (item) =>
                    String(item.id) ===
                    String(value)
            );

        if (!quote) {
            return;
        }

        setData((current) => ({
            ...current,

            quote_id: value,

            client_id:
                current.client_id ||
                quote.client_id ||
                quote.client?.id ||
                "",

            title:
                current.title === "CONTRACT"
                    ? quote.title || current.title
                    : current.title,

            license_id:
                current.license_id ||
                quote.license_id ||
                quote.license?.id ||
                "",

            license_name:
                current.license_name ||
                quote.license?.name ||
                "",

            license_description:
                current.license_description ||
                quote.license?.description ||
                "",
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

        const license =
            licenses.find(
                (item) =>
                    String(item.id) ===
                    String(value)
            );

        setData((current) => ({
            ...current,

            license_id: value,

            license_name:
                license?.name || "",

            license_description:
                license?.description || "",
        }));
    };

    const submit = (event) => {
        event.preventDefault();

        setProcessing(true);

        router.post(
            "/contracts",
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
                        Contract nou
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Creeaza un contract liber sau pornind dintr-un sablon.
                    </p>
                </div>
            }
        >
            <Head title="Contract nou" />

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
                                    Contract nou
                                </h1>

                                <p className="text-sm text-gray-500">
                                    Toate campurile pot fi modificate.
                                </p>
                            </div>

                        </div>

                        <Link
                            href="/contracts"
                            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                            Inapoi la contracte
                        </Link>

                    </div>

                    <form
                        onSubmit={submit}
                        className="space-y-6"
                    >

                        {/* DATE DOCUMENT */}

                        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                            <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5">
                                <h2 className="text-lg font-bold text-gray-900">
                                    Date contract
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Informatii generale despre contract.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-3">

                                <div className="md:col-span-2">

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Titlu contract *
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
                                        Numar contract
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
                                        placeholder="CTR-001"
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Data contract
                                    </label>

                                    <input
                                        type="date"
                                        value={data.contract_date}
                                        onChange={(event) =>
                                            setField(
                                                "contract_date",
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Tip contract
                                    </label>

                                    <input
                                        type="text"
                                        value={data.type}
                                        onChange={(event) =>
                                            setField(
                                                "type",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Prestari servicii"
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Status
                                    </label>

                                    <select
                                        value={data.status}
                                        onChange={(event) =>
                                            setField(
                                                "status",
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="draft">
                                            Ciorna
                                        </option>

                                        <option value="active">
                                            Activ
                                        </option>

                                        <option value="expired">
                                            Expirat
                                        </option>

                                        <option value="cancelled">
                                            Anulat
                                        </option>

                                    </select>

                                </div>

                            </div>

                        </div>

                        {/* SABLON */}

                        <div className="overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-sm">

                            <div className="border-b border-blue-100 bg-blue-50/60 px-6 py-5">

                                <h2 className="text-lg font-bold text-gray-900">
                                    Sablon contract
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Sablonul doar precompleteaza contractul.
                                    Dupa aceea poti modifica tot continutul.
                                </p>

                            </div>

                            <div className="p-6">

                                <select
                                    value={data.template_id}
                                    onChange={
                                        handleTemplateChange
                                    }
                                    className="w-full rounded-xl border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">
                                        Contract liber - fara sablon
                                    </option>

                                    {templates.map(
                                        (item) => (
                                            <option
                                                key={
                                                    item.id
                                                }
                                                value={
                                                    item.id
                                                }
                                            >
                                                {
                                                    item.name
                                                }

                                                {item.type
                                                    ? ` - ${item.type}`
                                                    : ""}
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>

                        </div>

                        {/* ASOCIERI */}

                        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                            <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5">

                                <h2 className="text-lg font-bold text-gray-900">
                                    Asocieri
                                </h2>

                            </div>

                            <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-3">

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Client
                                    </label>

                                    <select
                                        value={data.client_id}
                                        onChange={
                                            handleClientChange
                                        }
                                        className="w-full rounded-xl border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">
                                            Fara client
                                        </option>

                                        {clients.map(
                                            (client) => (
                                                <option
                                                    key={
                                                        client.id
                                                    }
                                                    value={
                                                        client.id
                                                    }
                                                >
                                                    {
                                                        client.name
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>

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

                            </div>

                        </div>

                        {/* LICENTA + CLIENT */}

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                                <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5">
                                    <h2 className="text-lg font-bold text-gray-900">
                                        Date beneficiar
                                    </h2>
                                </div>

                                <div className="space-y-5 p-6">

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
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                    <input
                                        type="text"
                                        value={
                                            data.location
                                        }
                                        onChange={(event) =>
                                            setField(
                                                "location",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Locatie"
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                            </div>

                            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                                <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5">
                                    <h2 className="text-lg font-bold text-gray-900">
                                        Licenta / Autorizatie
                                    </h2>
                                </div>

                                <div className="p-6">

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

                                    {data.license_name && (
                                        <div className="mt-4 rounded-xl bg-gray-50 p-4">

                                            <div className="text-sm font-bold text-gray-900">
                                                {
                                                    data.license_name
                                                }
                                            </div>

                                            {data.license_description && (
                                                <div className="mt-2 whitespace-pre-line text-xs leading-5 text-gray-600">
                                                    {
                                                        data.license_description
                                                    }
                                                </div>
                                            )}

                                        </div>
                                    )}

                                </div>

                            </div>

                        </div>

                        {/* CONDITII */}

                        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                            <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5">
                                <h2 className="text-lg font-bold text-gray-900">
                                    Conditii contractuale
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-3">

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Valoare
                                    </label>

                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.value}
                                        onChange={(event) =>
                                            setField(
                                                "value",
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Moneda
                                    </label>

                                    <select
                                        value={data.currency}
                                        onChange={(event) =>
                                            setField(
                                                "currency",
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="RON">
                                            RON
                                        </option>

                                        <option value="EUR">
                                            EUR
                                        </option>

                                        <option value="USD">
                                            USD
                                        </option>

                                    </select>

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Durata
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            data.duration
                                        }
                                        onChange={(event) =>
                                            setField(
                                                "duration",
                                                event.target.value
                                            )
                                        }
                                        placeholder="12 luni"
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                            </div>

                            <div className="px-6 pb-6">

                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Conditii de plata
                                </label>

                                <textarea
                                    value={
                                        data.payment_terms
                                    }
                                    onChange={(event) =>
                                        setField(
                                            "payment_terms",
                                            event.target.value
                                        )
                                    }
                                    rows={5}
                                    placeholder="Conditiile de plata..."
                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />

                            </div>

                        </div>

                        {/* OBIECT */}

                        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                            <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5">
                                <h2 className="text-lg font-bold text-gray-900">
                                    Obiectul contractului
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
                                    rows={5}
                                    placeholder="Descrie obiectul contractului..."
                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />

                            </div>

                        </div>

                        {/* CONTINUT */}

                        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                            <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5">
                                <h2 className="text-lg font-bold text-gray-900">
                                    Continut contract
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Continutul este complet editabil,
                                    inclusiv daca a fost preluat dintr-un sablon.
                                </p>
                            </div>

                            <div className="p-6">

                                <textarea
                                    value={
                                        data.content
                                    }
                                    onChange={(event) =>
                                        setField(
                                            "content",
                                            event.target.value
                                        )
                                    }
                                    rows={15}
                                    placeholder="Scrie continutul contractului..."
                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />

                            </div>

                        </div>

                        {/* CLAUZE */}

                        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                            <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5">
                                <h2 className="text-lg font-bold text-gray-900">
                                    Clauze
                                </h2>
                            </div>

                            <div className="p-6">

                                <textarea
                                    value={
                                        data.clauses
                                    }
                                    onChange={(event) =>
                                        setField(
                                            "clauses",
                                            event.target.value
                                        )
                                    }
                                    rows={12}
                                    placeholder="Clauze contractuale..."
                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />

                            </div>

                        </div>

                        {/* OBSERVATII */}

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
                                    placeholder="Observatii suplimentare..."
                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />

                            </div>

                        </div>

                        {/* SEMNATURI */}

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
                                        value={
                                            data.provider_signature_name
                                        }
                                        onChange={(event) =>
                                            setField(
                                                "provider_signature_name",
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Functie reprezentant ELECTRODEP
                                    </label>

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
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Nume reprezentant beneficiar
                                    </label>

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
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Functie reprezentant beneficiar
                                    </label>

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
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                            </div>

                        </div>

                        {/* ACTIUNI */}

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                            <Link
                                href="/contracts"
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
                                    : "Salveaza contractul"}
                            </button>

                        </div>

                    </form>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}