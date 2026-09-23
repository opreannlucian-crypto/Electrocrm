import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ClientAutocomplete from "@/Components/ClientAutocomplete";
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";

export default function Edit({
    contract,
    clients = [],
    workOrders = [],
    quotes = [],
    licenses = [],
    templates = [],
}) {
    const [processing, setProcessing] = useState(false);

    const [data, setData] = useState({
        number:
            contract?.number ||
            "",

        title:
            contract?.title ||
            "CONTRACT",

        contract_date:
            contract?.contract_date
                ? String(
                      contract.contract_date
                  ).slice(0, 10)
                : new Date()
                      .toISOString()
                      .slice(0, 10),

        type:
            contract?.type ||
            "",

        status:
            contract?.status ||
            "draft",

        client_id:
            contract?.client_id ||
            "",

        client_name:
            contract?.client?.name || clients.find((client) => String(client.id) === String(contract?.client_id))?.name || "",

        work_order_id:
            contract?.work_order_id ||
            "",

        quote_id:
            contract?.quote_id ||
            "",

        license_id:
            contract?.license_id ||
            "",

        license_name:
            contract?.license_name ||
            contract?.license?.name ||
            "",

        license_description:
            contract?.license_description ||
            contract?.license?.description ||
            "",

        location:
            contract?.location ||
            "",

        contact_person:
            contract?.contact_person ||
            "",

        subject:
            contract?.subject ||
            "",

        value:
            contract?.value ??
            "",

        currency:
            contract?.currency ||
            "RON",

        duration:
            contract?.duration ||
            "",

        payment_terms:
            contract?.payment_terms ||
            "",

        content:
            contract?.content ||
            "",

        clauses:
            contract?.clauses ||
            "",

        observations:
            contract?.observations ||
            "",

        provider_signature_name:
            contract?.provider_signature_name ||
            "",

        provider_signature_position:
            contract?.provider_signature_position ||
            "",

        client_signature_name:
            contract?.client_signature_name ||
            "",

        client_signature_position:
            contract?.client_signature_position ||
            "",

        template_id:
            contract?.template_id ||
            "",
    });

    const setField = (field, value) => {
        setData((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const handleWorkOrderChange = (event) => {
        const value =
            event.target.value;

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

            work_order_id:
                value,

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
        const value =
            event.target.value;

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

            quote_id:
                value,

            client_id:
                current.client_id ||
                quote.client_id ||
                quote.client?.id ||
                "",

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
        const value =
            event.target.value;

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

            license_id:
                value,

            license_name:
                license?.name ||
                "",

            license_description:
                license?.description ||
                "",
        }));
    };

    const handleTemplateChange = (event) => {
        const value =
            event.target.value;

        setField(
            "template_id",
            value
        );
    };

    const submit = (event) => {
        event.preventDefault();

        setProcessing(true);

        router.put(
            `/contracts/${contract.id}`,
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
                        Editeaza contract
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Modifica orice element al contractului.
                    </p>
                </div>
            }
        >
            <Head
                title={`Editeaza ${
                    data.number || "contract"
                }`}
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
                                    Editeaza contract
                                </h1>

                                <p className="text-sm text-gray-500">
                                    {data.number ||
                                        "Contract"}
                                </p>

                            </div>

                        </div>

                        <Link
                            href={`/contracts/${contract.id}`}
                            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                            Inapoi
                        </Link>

                    </div>

                    <form
                        onSubmit={submit}
                        className="space-y-6"
                    >

                        {/* DATE CONTRACT */}

                        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                            <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5">
                                <h2 className="text-lg font-bold text-gray-900">
                                    Date contract
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-3">

                                <div className="md:col-span-2">

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Titlu contract *
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            data.title
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setField(
                                                "title",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Numar
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            data.number
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setField(
                                                "number",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Data contract
                                    </label>

                                    <input
                                        type="date"
                                        value={
                                            data.contract_date
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setField(
                                                "contract_date",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Tip
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            data.type
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setField(
                                                "type",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Status
                                    </label>

                                    <select
                                        value={
                                            data.status
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setField(
                                                "status",
                                                event
                                                    .target
                                                    .value
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
                                    Sablon
                                </h2>
                            </div>

                            <div className="p-6">

                                <select
                                    value={
                                        data.template_id
                                    }
                                    onChange={
                                        handleTemplateChange
                                    }
                                    className="w-full rounded-xl border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">
                                        Fara sablon
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
                                            </option>
                                        )
                                    )}

                                </select>

                                <p className="mt-2 text-xs text-gray-500">
                                    Schimbarea sablonului aici
                                    nu modifica automat contractul.
                                </p>

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

                                    <ClientAutocomplete clients={clients} clientId={data.client_id} value={data.client_name} onChange={({ client_id, client_name }) => setData((current) => ({ ...current, client_id, client_name }))} />

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

                        {/* CLIENT + LICENTA */}

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
                                        onChange={(
                                            event
                                        ) =>
                                            setField(
                                                "contact_person",
                                                event
                                                    .target
                                                    .value
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
                                        onChange={(
                                            event
                                        ) =>
                                            setField(
                                                "location",
                                                event
                                                    .target
                                                    .value
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
                                        value={
                                            data.value
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setField(
                                                "value",
                                                event
                                                    .target
                                                    .value
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
                                        value={
                                            data.currency
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setField(
                                                "currency",
                                                event
                                                    .target
                                                    .value
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
                                        onChange={(
                                            event
                                        ) =>
                                            setField(
                                                "duration",
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
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
                                    onChange={(
                                        event
                                    ) =>
                                        setField(
                                            "payment_terms",
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    rows={5}
                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />

                            </div>

                        </div>

                        {/* SUBIECT */}

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
                                    onChange={(
                                        event
                                    ) =>
                                        setField(
                                            "subject",
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    rows={5}
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
                            </div>

                            <div className="p-6">

                                <textarea
                                    value={
                                        data.content
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setField(
                                            "content",
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    rows={15}
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
                                    onChange={(
                                        event
                                    ) =>
                                        setField(
                                            "clauses",
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    rows={12}
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
                                    onChange={(
                                        event
                                    ) =>
                                        setField(
                                            "observations",
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    rows={6}
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

                                <input
                                    type="text"
                                    value={
                                        data.provider_signature_name
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setField(
                                            "provider_signature_name",
                                            event
                                                .target
                                                .value
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
                                    onChange={(
                                        event
                                    ) =>
                                        setField(
                                            "provider_signature_position",
                                            event
                                                .target
                                                .value
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
                                    onChange={(
                                        event
                                    ) =>
                                        setField(
                                            "client_signature_name",
                                            event
                                                .target
                                                .value
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
                                    onChange={(
                                        event
                                    ) =>
                                        setField(
                                            "client_signature_position",
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="Functie reprezentant beneficiar"
                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />

                            </div>

                        </div>

                        {/* ACTIUNI */}

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                            <Link
                                href={`/contracts/${contract.id}`}
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
