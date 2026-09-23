import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";

export default function Create() {
    const [processing, setProcessing] =
        useState(false);

    const [data, setData] = useState({
        name: "",
        type: "",
        title: "",
        description: "",

        content: "",

        default_value: "",
        default_duration: "",
        default_payment_terms: "",
        default_notes: "",

        provider_signature_name: "",
        provider_signature_position: "",

        client_signature_name: "",
        client_signature_position: "",

        active: true,
        sort_order: 0,
    });

    const setField = (
        field,
        value
    ) => {
        setData((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const submit = (event) => {
        event.preventDefault();

        setProcessing(true);

        router.post(
            "/contract-templates",
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
                        Sablon nou
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Creeaza un sablon complet editabil pentru contracte.
                    </p>
                </div>
            }
        >
            <Head title="Sablon nou" />

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
                                    Sablon nou
                                </h1>

                                <p className="text-sm text-gray-500">
                                    Tot continutul sablonului este editabil.
                                </p>

                            </div>

                        </div>

                        <Link
                            href="/contract-templates"
                            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                            Inapoi
                        </Link>

                    </div>

                    <form
                        onSubmit={submit}
                        className="space-y-6"
                    >

                        {/* DATE SABLON */}

                        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                            <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5">

                                <h2 className="text-lg font-bold text-gray-900">
                                    Date sablon
                                </h2>

                            </div>

                            <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Nume sablon *
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            data.name
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setField(
                                                "name",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Contract prestari servicii"
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Tip contract
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
                                                event.target.value
                                            )
                                        }
                                        placeholder="Prestari servicii"
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Titlu contract
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
                                                event.target.value
                                            )
                                        }
                                        placeholder="CONTRACT DE PRESTARI SERVICII"
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Ordine afisare
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        value={
                                            data.sort_order
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setField(
                                                "sort_order",
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                                <div className="md:col-span-2">

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Descriere
                                    </label>

                                    <textarea
                                        value={
                                            data.description
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setField(
                                                "description",
                                                event.target.value
                                            )
                                        }
                                        rows={4}
                                        placeholder="Descrierea sablonului..."
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                            </div>

                        </div>

                        {/* CONTINUT */}

                        <div className="overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-sm">

                            <div className="border-b border-blue-100 bg-blue-50/60 px-6 py-5">

                                <h2 className="text-lg font-bold text-gray-900">
                                    Continut sablon
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Poti folosi variabile care vor fi completate automat in contract.
                                </p>

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
                                            event.target.value
                                        )
                                    }
                                    rows={18}
                                    placeholder={
                                        "CONTRACT DE PRESTARI SERVICII\n\n" +
                                        "Intre {{client_name}} si ELECTRODEP SRL...\n\n" +
                                        "Obiectul contractului...\n\n" +
                                        "Conditiile contractuale..."
                                    }
                                    className="w-full rounded-xl border-gray-300 font-mono text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />

                                <div className="mt-4 rounded-xl bg-gray-50 p-4">

                                    <div className="text-xs font-bold uppercase tracking-wide text-gray-700">
                                        Variabile disponibile
                                    </div>

                                    <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-gray-600 sm:grid-cols-2 lg:grid-cols-3">

                                        <div>
                                            {"{{client_name}}"}
                                        </div>

                                        <div>
                                            {"{{client_cui}}"}
                                        </div>

                                        <div>
                                            {"{{client_address}}"}
                                        </div>

                                        <div>
                                            {"{{contract_number}}"}
                                        </div>

                                        <div>
                                            {"{{contract_date}}"}
                                        </div>

                                        <div>
                                            {"{{contract_value}}"}
                                        </div>

                                        <div>
                                            {"{{contract_duration}}"}
                                        </div>

                                        <div>
                                            {"{{work_order_number}}"}
                                        </div>

                                        <div>
                                            {"{{quote_number}}"}
                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                        {/* VALORI IMPLICITE */}

                        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                            <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5">

                                <h2 className="text-lg font-bold text-gray-900">
                                    Valori implicite
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Aceste valori sunt preluate automat cand se creeaza un contract din acest sablon.
                                </p>

                            </div>

                            <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Valoare implicita
                                    </label>

                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={
                                            data.default_value
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setField(
                                                "default_value",
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Durata implicita
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            data.default_duration
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setField(
                                                "default_duration",
                                                event.target.value
                                            )
                                        }
                                        placeholder="12 luni"
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                                <div className="md:col-span-2">

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Conditii de plata implicite
                                    </label>

                                    <textarea
                                        value={
                                            data.default_payment_terms
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setField(
                                                "default_payment_terms",
                                                event.target.value
                                            )
                                        }
                                        rows={5}
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                                <div className="md:col-span-2">

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Observatii implicite
                                    </label>

                                    <textarea
                                        value={
                                            data.default_notes
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setField(
                                                "default_notes",
                                                event.target.value
                                            )
                                        }
                                        rows={5}
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                            </div>

                        </div>

                        {/* SEMNATURI */}

                        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                            <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5">

                                <h2 className="text-lg font-bold text-gray-900">
                                    Semnaturi implicite
                                </h2>

                            </div>

                            <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Reprezentant ELECTRODEP
                                    </label>

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
                                                event.target.value
                                            )
                                        }
                                        placeholder="Nume si prenume"
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Functie ELECTRODEP
                                    </label>

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
                                                event.target.value
                                            )
                                        }
                                        placeholder="Director / Inginer"
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Reprezentant beneficiar
                                    </label>

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
                                                event.target.value
                                            )
                                        }
                                        placeholder="Nume si prenume"
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                                <div>

                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Functie beneficiar
                                    </label>

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
                                                event.target.value
                                            )
                                        }
                                        placeholder="Director / Administrator"
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                            </div>

                        </div>

                        {/* STATUS */}

                        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                            <div className="flex items-center justify-between gap-4 p-6">

                                <div>

                                    <div className="font-semibold text-gray-900">
                                        Sablon activ
                                    </div>

                                    <div className="mt-1 text-sm text-gray-500">
                                        Un sablon inactiv nu va putea fi selectat
                                        la crearea unui contract.
                                    </div>

                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setField(
                                            "active",
                                            !data.active
                                        )
                                    }
                                    className={`relative h-7 w-12 rounded-full transition ${
                                        data.active
                                            ? "bg-blue-600"
                                            : "bg-gray-300"
                                    }`}
                                >
                                    <span
                                        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
                                            data.active
                                                ? "left-6"
                                                : "left-1"
                                        }`}
                                    />
                                </button>

                            </div>

                        </div>

                        {/* ACTIUNI */}

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                            <Link
                                href="/contract-templates"
                                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                            >
                                Renunta
                            </Link>

                            <button
                                type="submit"
                                disabled={
                                    processing
                                }
                                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-7 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing
                                    ? "Se salveaza..."
                                    : "Salveaza sablonul"}
                            </button>

                        </div>

                    </form>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}