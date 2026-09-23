import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";

export default function Edit({ template }) {
    const [processing, setProcessing] =
        useState(false);

    const [data, setData] = useState({
        name:
            template?.name ||
            "",

        type:
            template?.type ||
            "",

        title:
            template?.title ||
            "",

        description:
            template?.description ||
            "",

        content:
            template?.content ||
            "",

        default_value:
            template?.default_value ??
            "",

        default_duration:
            template?.default_duration ||
            "",

        default_payment_terms:
            template?.default_payment_terms ||
            "",

        default_notes:
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

        active:
            template?.active !== false,

        sort_order:
            template?.sort_order ??
            0,
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

        router.put(
            `/contract-templates/${template.id}`,
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
                        Editeaza sablon
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Modifica sablonul fara a modifica contractele deja create din el.
                    </p>
                </div>
            }
        >
            <Head
                title={`Editeaza ${
                    data.name || "sablon"
                }`}
            />

            <div className="py-8">

                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div>

                            <h1 className="text-2xl font-bold text-gray-900">
                                Editeaza sablon
                            </h1>

                            <p className="mt-1 text-sm text-gray-500">
                                {
                                    data.name ||
                                    "Sablon"
                                }
                            </p>

                        </div>

                        <div className="flex gap-2">

                            <Link
                                href={`/contract-templates/${template.id}`}
                                className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Inapoi
                            </Link>

                        </div>

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
                                        required
                                        className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                                            event.target.value
                                        )
                                    }
                                    placeholder="Functie ELECTRODEP"
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
                                    onChange={(
                                        event
                                    ) =>
                                        setField(
                                            "client_signature_position",
                                            event.target.value
                                        )
                                    }
                                    placeholder="Functie beneficiar"
                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />

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
                                        Sablonul inactiv nu va putea fi folosit la contracte noi.
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
                                href={`/contract-templates/${template.id}`}
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
                                    : "Salveaza modificarile"}
                            </button>

                        </div>

                    </form>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}