import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";

export default function Show({ template }) {
    const [deleting, setDeleting] =
        useState(false);

    if (!template) {
        return (
            <AuthenticatedLayout
                header={
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Sablon contract
                    </h2>
                }
            >
                <Head title="Sablon contract" />

                <div className="py-12">

                    <div className="mx-auto max-w-7xl px-6 lg:px-8">

                        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">

                            <div className="text-red-600">
                                Sablonul nu a fost gasit.
                            </div>

                            <div className="mt-4">

                                <Link
                                    href="/contract-templates"
                                    className="inline-flex items-center rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700"
                                >
                                    Inapoi la sabloane
                                </Link>

                            </div>

                        </div>

                    </div>

                </div>
            </AuthenticatedLayout>
        );
    }

    const formatValue = () => {
        if (
            template.default_value ===
                null ||
            template.default_value ===
                undefined ||
            template.default_value ===
                ""
        ) {
            return "-";
        }

        const value =
            Number(
                template.default_value
            );

        if (
            Number.isNaN(value)
        ) {
            return "-";
        }

        return (
            new Intl.NumberFormat(
                "ro-RO",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }
            ).format(value) +
            " RON"
        );
    };

    const handleDelete = () => {
        if (deleting) {
            return;
        }

        const confirmed =
            window.confirm(
                "Sigur vrei sa stergi acest sablon?"
            );

        if (!confirmed) {
            return;
        }

        setDeleting(true);

        router.delete(
            `/contract-templates/${template.id}`,
            {
                onFinish: () => {
                    setDeleting(false);
                },
            }
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Sablon contract
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            {
                                template.name ||
                                "-"
                            }
                        </p>

                    </div>

                    <div className="flex flex-wrap gap-2">

                        <Link
                            href={`/contracts/create-from-template/${template.id}`}
                            className="inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                        >
                            Creeaza contract
                        </Link>

                        <Link
                            href={`/contract-templates/${template.id}/edit`}
                            className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                        >
                            Editeaza
                        </Link>

                        <Link
                            href="/contract-templates"
                            className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            Inapoi
                        </Link>

                    </div>

                </div>
            }
        >
            <Head
                title={`Sablon ${
                    template.name ||
                    ""
                }`}
            />

            <div className="py-8">

                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

                    <div className="space-y-6">

                        {/* HEADER */}

                        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                            <div className="border-t-4 border-blue-600 p-6">

                                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                                    <div>

                                        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Sablon contract
                                        </div>

                                        <h1 className="mt-1 text-3xl font-bold text-gray-900">
                                            {
                                                template.name
                                            }
                                        </h1>

                                        {template.title && (
                                            <div className="mt-2 text-sm font-semibold text-gray-500">
                                                {
                                                    template.title
                                                }
                                            </div>
                                        )}

                                    </div>

                                    <span
                                        className={`inline-flex self-start rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${
                                            template.active !==
                                            false
                                                ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
                                                : "bg-gray-100 text-gray-600 ring-gray-200"
                                        }`}
                                    >
                                        {template.active !==
                                        false
                                            ? "Activ"
                                            : "Inactiv"}
                                    </span>

                                </div>

                            </div>

                        </div>

                        {/* DATE GENERALE */}

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">

                                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
                                    Date generale
                                </h3>

                                <div className="mt-5 space-y-3 text-sm">

                                    <div>
                                        <span className="font-semibold text-gray-700">
                                            Tip:
                                        </span>{" "}
                                        <span className="text-gray-600">
                                            {
                                                template.type ||
                                                "-"
                                            }
                                        </span>
                                    </div>

                                    <div>
                                        <span className="font-semibold text-gray-700">
                                            Ordine:
                                        </span>{" "}
                                        <span className="text-gray-600">
                                            {
                                                template.sort_order ??
                                                0
                                            }
                                        </span>
                                    </div>

                                    <div>
                                        <span className="font-semibold text-gray-700">
                                            Valoare implicita:
                                        </span>{" "}
                                        <span className="font-bold text-gray-900">
                                            {formatValue()}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="font-semibold text-gray-700">
                                            Durata:
                                        </span>{" "}
                                        <span className="text-gray-600">
                                            {
                                                template.default_duration ||
                                                "-"
                                            }
                                        </span>
                                    </div>

                                </div>

                            </div>

                            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">

                                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
                                    Descriere
                                </h3>

                                <div className="mt-5 whitespace-pre-line text-sm leading-7 text-gray-700">
                                    {
                                        template.description ||
                                        "-"
                                    }
                                </div>

                            </div>

                        </div>

                        {/* CONTINUT */}

                        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">

                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
                                    Continut sablon
                                </h3>

                                <span className="text-xs text-gray-400">
                                    Variabilele pot fi completate automat in contract.
                                </span>

                            </div>

                            <div className="mt-5 rounded-2xl bg-gray-50 p-5">

                                <div className="whitespace-pre-line font-mono text-sm leading-7 text-gray-700">
                                    {
                                        template.content ||
                                        "Sablonul nu are continut."
                                    }
                                </div>

                            </div>

                        </div>

                        {/* CONDITII */}

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">

                                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
                                    Conditii implicite
                                </h3>

                                <div className="mt-5 whitespace-pre-line text-sm leading-7 text-gray-700">
                                    {
                                        template.default_payment_terms ||
                                        "-"
                                    }
                                </div>

                            </div>

                            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">

                                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
                                    Observatii implicite
                                </h3>

                                <div className="mt-5 whitespace-pre-line text-sm leading-7 text-gray-700">
                                    {
                                        template.default_notes ||
                                        "-"
                                    }
                                </div>

                            </div>

                        </div>

                        {/* SEMNATURI */}

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">

                                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
                                    ELECTRODEP
                                </h3>

                                <div className="mt-5 space-y-3 text-sm">

                                    <div>
                                        <span className="font-semibold text-gray-700">
                                            Nume:
                                        </span>{" "}
                                        <span className="text-gray-600">
                                            {
                                                template.provider_signature_name ||
                                                "-"
                                            }
                                        </span>
                                    </div>

                                    <div>
                                        <span className="font-semibold text-gray-700">
                                            Functie:
                                        </span>{" "}
                                        <span className="text-gray-600">
                                            {
                                                template.provider_signature_position ||
                                                "-"
                                            }
                                        </span>
                                    </div>

                                </div>

                            </div>

                            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">

                                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
                                    Beneficiar
                                </h3>

                                <div className="mt-5 space-y-3 text-sm">

                                    <div>
                                        <span className="font-semibold text-gray-700">
                                            Nume:
                                        </span>{" "}
                                        <span className="text-gray-600">
                                            {
                                                template.client_signature_name ||
                                                "-"
                                            }
                                        </span>
                                    </div>

                                    <div>
                                        <span className="font-semibold text-gray-700">
                                            Functie:
                                        </span>{" "}
                                        <span className="text-gray-600">
                                            {
                                                template.client_signature_position ||
                                                "-"
                                            }
                                        </span>
                                    </div>

                                </div>

                            </div>

                        </div>

                        {/* ACTIUNI */}

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                            <button
                                type="button"
                                onClick={
                                    handleDelete
                                }
                                disabled={
                                    deleting
                                }
                                className="inline-flex items-center justify-center rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {deleting
                                    ? "Se sterge..."
                                    : "Sterge sablonul"}
                            </button>

                            <Link
                                href={`/contract-templates/${template.id}/edit`}
                                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Editeaza
                            </Link>

                            <Link
                                href={`/contracts/create-from-template/${template.id}`}
                                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                            >
                                Creeaza contract din sablon
                            </Link>

                        </div>

                    </div>

                </div>

            </div>
        </AuthenticatedLayout>
    );
}