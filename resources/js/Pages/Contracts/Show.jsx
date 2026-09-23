import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";

export default function Show({ contract }) {
    const [deleting, setDeleting] =
        useState(false);

    if (!contract) {
        return (
            <AuthenticatedLayout
                header={
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Contract
                    </h2>
                }
            >
                <Head title="Contract" />

                <div className="py-12">

                    <div className="mx-auto max-w-7xl px-6 lg:px-8">

                        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">

                            <div className="text-red-600">
                                Contractul nu a fost gasit.
                            </div>

                            <div className="mt-4">

                                <Link
                                    href="/contracts"
                                    className="inline-flex items-center rounded-xl bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700"
                                >
                                    Inapoi la contracte
                                </Link>

                            </div>

                        </div>

                    </div>

                </div>
            </AuthenticatedLayout>
        );
    }

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        const parsed =
            new Date(date);

        if (
            Number.isNaN(
                parsed.getTime()
            )
        ) {
            return "-";
        }

        return parsed.toLocaleDateString(
            "ro-RO"
        );
    };

    const formatValue = () => {
        if (
            contract.value === null ||
            contract.value === undefined ||
            contract.value === ""
        ) {
            return "-";
        }

        const value =
            Number(
                contract.value
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
            " " +
            (
                contract.currency ||
                "RON"
            )
        );
    };

    const statusLabel = () => {
        switch (
            contract.status
        ) {
            case "active":
                return "Activ";

            case "expired":
                return "Expirat";

            case "cancelled":
                return "Anulat";

            default:
                return "Ciorna";
        }
    };

    const statusClass = () => {
        switch (
            contract.status
        ) {
            case "active":
                return "bg-emerald-100 text-emerald-700 ring-emerald-200";

            case "expired":
                return "bg-amber-100 text-amber-700 ring-amber-200";

            case "cancelled":
                return "bg-red-100 text-red-700 ring-red-200";

            default:
                return "bg-gray-100 text-gray-700 ring-gray-200";
        }
    };

    const handleDelete = () => {
        if (
            deleting
        ) {
            return;
        }

        const confirmed =
            window.confirm(
                "Sigur vrei sa stergi acest contract?"
            );

        if (!confirmed) {
            return;
        }

        setDeleting(true);

        router.delete(
            `/contracts/${contract.id}`,
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
                            Contract
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            {contract.number || "-"}
                        </p>

                    </div>

                    <div className="flex flex-wrap gap-2">

                        <a
                            href={`/contracts/${contract.id}/pdf`}
                            className="inline-flex items-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
                        >
                            Salveaza PDF
                        </a>

                        <a href={route("contracts.word", contract.id)} className="inline-flex items-center rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800">Export Word</a>

                        <Link
                            href={`/contracts/${contract.id}/edit`}
                            className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                        >
                            Editeaza
                        </Link>

                        <Link
                            href="/contracts"
                            className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            Inapoi
                        </Link>

                    </div>

                </div>
            }
        >
            <Head
                title={`Contract ${
                    contract.number ||
                    ""
                }`}
            />

            <div className="py-8">

                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

                    <div className="space-y-6">

                        {/* HEADER */}

                        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                            <div className="border-t-4 border-blue-600 p-6">

                                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

                                    <div>

                                        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Contract
                                        </div>

                                        <h1 className="mt-1 text-3xl font-bold text-gray-900">
                                            {
                                                contract.title ||
                                                "Contract"
                                            }
                                        </h1>

                                        <div className="mt-2 text-sm text-gray-500">
                                            {
                                                contract.number ||
                                                "-"
                                            }
                                        </div>

                                    </div>

                                    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">

                                        <span
                                            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${statusClass()}`}
                                        >
                                            {statusLabel()}
                                        </span>

                                        <div className="rounded-xl bg-gray-50 px-5 py-4 text-left ring-1 ring-gray-200 sm:text-right">

                                            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                Data
                                            </div>

                                            <div className="mt-1 text-lg font-bold text-gray-900">
                                                {formatDate(
                                                    contract.contract_date
                                                )}
                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                        {/* CLIENT + CONTRACT */}

                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">

                                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
                                    Beneficiar / Client
                                </h3>

                                <div className="mt-5 space-y-3 text-sm">

                                    <div>
                                        <span className="font-semibold text-gray-700">
                                            Nume:
                                        </span>{" "}
                                        <span className="text-gray-600">
                                            {
                                                contract.client?.name ||
                                                "-"
                                            }
                                        </span>
                                    </div>

                                    <div>
                                        <span className="font-semibold text-gray-700">
                                            CUI:
                                        </span>{" "}
                                        <span className="text-gray-600">
                                            {
                                                contract.client?.cui ||
                                                "-"
                                            }
                                        </span>
                                    </div>

                                    <div>
                                        <span className="font-semibold text-gray-700">
                                            Adresa:
                                        </span>{" "}
                                        <span className="text-gray-600">
                                            {
                                                contract.client?.address ||
                                                "-"
                                            }
                                        </span>
                                    </div>

                                    <div>
                                        <span className="font-semibold text-gray-700">
                                            Telefon:
                                        </span>{" "}
                                        <span className="text-gray-600">
                                            {
                                                contract.client?.phone ||
                                                "-"
                                            }
                                        </span>
                                    </div>

                                    <div>
                                        <span className="font-semibold text-gray-700">
                                            Contact:
                                        </span>{" "}
                                        <span className="text-gray-600">
                                            {
                                                contract.contact_person ||
                                                "-"
                                            }
                                        </span>
                                    </div>

                                </div>

                            </div>

                            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">

                                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
                                    Date contract
                                </h3>

                                <div className="mt-5 space-y-3 text-sm">

                                    <div>
                                        <span className="font-semibold text-gray-700">
                                            Tip:
                                        </span>{" "}
                                        <span className="text-gray-600">
                                            {
                                                contract.type ||
                                                "-"
                                            }
                                        </span>
                                    </div>

                                    <div>
                                        <span className="font-semibold text-gray-700">
                                            Valoare:
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
                                                contract.duration ||
                                                "-"
                                            }
                                        </span>
                                    </div>

                                    <div>
                                        <span className="font-semibold text-gray-700">
                                            Locatie:
                                        </span>{" "}
                                        <span className="text-gray-600">
                                            {
                                                contract.location ||
                                                "-"
                                            }
                                        </span>
                                    </div>

                                    <div>
                                        <span className="font-semibold text-gray-700">
                                            Sablon:
                                        </span>{" "}
                                        <span className="text-gray-600">
                                            {
                                                contract.template?.name ||
                                                "Contract liber"
                                            }
                                        </span>
                                    </div>

                                </div>

                            </div>

                        </div>

                        {/* ASOCIERI */}

                        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">

                            <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
                                Asocieri
                            </h3>

                            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">

                                <div className="rounded-xl bg-gray-50 p-4">

                                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Lucrare
                                    </div>

                                    <div className="mt-1 text-sm font-semibold text-gray-900">
                                        {
                                            contract.workOrder?.number ||
                                            "-"
                                        }
                                    </div>

                                </div>

                                <div className="rounded-xl bg-gray-50 p-4">

                                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Oferta / Deviz
                                    </div>

                                    <div className="mt-1 text-sm font-semibold text-gray-900">
                                        {
                                            contract.quote?.number ||
                                            "-"
                                        }
                                    </div>

                                </div>

                                <div className="rounded-xl bg-gray-50 p-4">

                                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Licenta / Autorizatie
                                    </div>

                                    <div className="mt-1 text-sm font-semibold text-gray-900">
                                        {
                                            contract.license_name ||
                                            "-"
                                        }
                                    </div>

                                    {contract.license_description && (
                                        <div className="mt-2 whitespace-pre-line text-xs leading-5 text-gray-600">
                                            {
                                                contract.license_description
                                            }
                                        </div>
                                    )}

                                </div>

                            </div>

                        </div>

                        {/* OBIECT */}

                        {contract.subject && (
                            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">

                                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
                                    Obiectul contractului
                                </h3>

                                <div className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-700">
                                    {
                                        contract.subject
                                    }
                                </div>

                            </div>
                        )}

                        {/* CONDITII PLATA */}

                        {contract.payment_terms && (
                            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">

                                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
                                    Conditii de plata
                                </h3>

                                <div className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-700">
                                    {
                                        contract.payment_terms
                                    }
                                </div>

                            </div>
                        )}

                        {/* CONTINUT */}

                        {contract.content && (
                            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">

                                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
                                    Continut contract
                                </h3>

                                <div className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-700">
                                    {
                                        contract.content
                                    }
                                </div>

                            </div>
                        )}

                        {/* CLAUZE */}

                        {contract.clauses && (
                            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">

                                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
                                    Clauze
                                </h3>

                                <div className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-700">
                                    {
                                        contract.clauses
                                    }
                                </div>

                            </div>
                        )}

                        {/* OBSERVATII */}

                        {contract.observations && (
                            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">

                                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
                                    Observatii
                                </h3>

                                <div className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-700">
                                    {
                                        contract.observations
                                    }
                                </div>

                            </div>
                        )}

                        {/* SEMNATURI */}

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">

                                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
                                    Reprezentant ELECTRODEP
                                </h3>

                                <div className="mt-5 space-y-3 text-sm">

                                    <div>
                                        <span className="font-semibold text-gray-700">
                                            Nume:
                                        </span>{" "}
                                        <span className="text-gray-600">
                                            {
                                                contract.provider_signature_name ||
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
                                                contract.provider_signature_position ||
                                                "-"
                                            }
                                        </span>
                                    </div>

                                </div>

                            </div>

                            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">

                                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
                                    Reprezentant beneficiar
                                </h3>

                                <div className="mt-5 space-y-3 text-sm">

                                    <div>
                                        <span className="font-semibold text-gray-700">
                                            Nume:
                                        </span>{" "}
                                        <span className="text-gray-600">
                                            {
                                                contract.client_signature_name ||
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
                                                contract.client_signature_position ||
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
                                    : "Sterge contractul"}
                            </button>

                            <Link
                                href={`/contracts/${contract.id}/edit`}
                                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                            >
                                Editeaza contractul
                            </Link>

                        </div>

                    </div>

                </div>

            </div>
        </AuthenticatedLayout>
    );
}
