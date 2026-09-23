import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";

export default function Index({ contracts }) {
    const items = contracts?.data || [];

    const statusLabel = (status) => {
        switch (status) {
            case "active":
                return "Activ";

            case "expired":
                return "Expirat";

            case "cancelled":
                return "Anulat";

            case "draft":
            default:
                return "Ciorna";
        }
    };

    const statusClass = (status) => {
        switch (status) {
            case "active":
                return "bg-emerald-100 text-emerald-700 ring-emerald-200";

            case "expired":
                return "bg-amber-100 text-amber-700 ring-amber-200";

            case "cancelled":
                return "bg-red-100 text-red-700 ring-red-200";

            case "draft":
            default:
                return "bg-gray-100 text-gray-700 ring-gray-200";
        }
    };

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) {
            return "-";
        }

        return parsed.toLocaleDateString("ro-RO");
    };

    const formatValue = (value, currency = "RON") => {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "-";
        }

        const number = Number(value);

        if (Number.isNaN(number)) {
            return "-";
        }

        return (
            new Intl.NumberFormat("ro-RO", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(number) +
            " " +
            (currency || "RON")
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Contracte
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Gestioneaza contractele si sabloanele ElectroCRM.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href="/contract-templates"
                            className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                        >
                            Sabloane
                        </Link>

                        <Link
                            href="/contracts/create"
                            className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                        >
                            Contract nou
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Contracte" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">

                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Contracte
                            </div>

                            <div className="mt-2 text-2xl font-bold text-gray-900">
                                {contracts?.total || items.length}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Contracte active
                            </div>

                            <div className="mt-2 text-2xl font-bold text-emerald-600">
                                {
                                    items.filter(
                                        (contract) =>
                                            contract.status === "active"
                                    ).length
                                }
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Ciorne
                            </div>

                            <div className="mt-2 text-2xl font-bold text-gray-700">
                                {
                                    items.filter(
                                        (contract) =>
                                            !contract.status ||
                                            contract.status === "draft"
                                    ).length
                                }
                            </div>
                        </div>

                    </div>

                    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                        <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5">

                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                                <div>
                                    <h1 className="text-lg font-bold text-gray-900">
                                        Lista contractelor
                                    </h1>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Contractele create manual sau din sabloane.
                                    </p>
                                </div>

                                <Link
                                    href="/contracts/create"
                                    className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                                >
                                    + Contract nou
                                </Link>

                            </div>

                        </div>

                        {items.length === 0 ? (
                            <div className="p-10 text-center">

                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-8 w-8"
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

                                <h3 className="mt-4 text-lg font-bold text-gray-900">
                                    Nu exista contracte
                                </h3>

                                <p className="mt-1 text-sm text-gray-500">
                                    Creeaza primul contract pentru a incepe.
                                </p>

                                <div className="mt-5">
                                    <Link
                                        href="/contracts/create"
                                        className="inline-flex items-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                                    >
                                        Creeaza contract
                                    </Link>
                                </div>

                            </div>
                        ) : (
                            <div className="overflow-x-auto">

                                <table className="min-w-full divide-y divide-gray-200">

                                    <thead className="bg-gray-50">

                                        <tr>

                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                Contract
                                            </th>

                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                Client
                                            </th>

                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                Data
                                            </th>

                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                Valoare
                                            </th>

                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                Status
                                            </th>

                                            <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                Actiuni
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody className="divide-y divide-gray-100 bg-white">

                                        {items.map((contract) => (
                                            <tr
                                                key={contract.id}
                                                className="transition hover:bg-gray-50"
                                            >

                                                <td className="px-6 py-4">

                                                    <div className="font-semibold text-gray-900">
                                                        {contract.number || "-"}
                                                    </div>

                                                    <div className="mt-1 text-sm text-gray-500">
                                                        {contract.title || "Contract"}
                                                    </div>

                                                    {contract.template && (
                                                        <div className="mt-2 text-xs text-blue-600">
                                                            Sablon:{" "}
                                                            {
                                                                contract.template.name
                                                            }
                                                        </div>
                                                    )}

                                                </td>

                                                <td className="px-6 py-4">

                                                    <div className="text-sm font-semibold text-gray-900">
                                                        {
                                                            contract.client?.name ||
                                                            "-"
                                                        }
                                                    </div>

                                                    {contract.client?.cui && (
                                                        <div className="mt-1 text-xs text-gray-500">
                                                            CUI{" "}
                                                            {
                                                                contract.client.cui
                                                            }
                                                        </div>
                                                    )}

                                                </td>

                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {formatDate(
                                                        contract.contract_date
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                                    {formatValue(
                                                        contract.value,
                                                        contract.currency
                                                    )}
                                                </td>

                                                <td className="px-6 py-4">

                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClass(
                                                            contract.status
                                                        )}`}
                                                    >
                                                        {statusLabel(
                                                            contract.status
                                                        )}
                                                    </span>

                                                </td>

                                                <td className="px-6 py-4">

                                                    <div className="flex justify-end gap-2">

                                                        <Link
                                                            href={`/contracts/${contract.id}`}
                                                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                                        >
                                                            Vezi
                                                        </Link>

                                                        <Link
                                                            href={`/contracts/${contract.id}/edit`}
                                                            className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                                                        >
                                                            Editeaza
                                                        </Link>

                                                    </div>

                                                </td>

                                            </tr>
                                        ))}

                                    </tbody>

                                </table>

                            </div>
                        )}

                    </div>

                    {contracts?.links &&
                        contracts.links.length > 3 && (
                            <div className="mt-6 flex flex-wrap justify-center gap-2">

                                {contracts.links.map(
                                    (link, index) => (
                                        <Link
                                            key={index}
                                            href={
                                                link.url || "#"
                                            }
                                            className={`rounded-lg px-3 py-2 text-sm ${
                                                link.active
                                                    ? "bg-blue-600 text-white"
                                                    : link.url
                                                      ? "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
                                                      : "cursor-default bg-gray-100 text-gray-400"
                                            }`}
                                        >
                                            <span
                                                dangerouslySetInnerHTML={{
                                                    __html:
                                                        link.label,
                                                }}
                                            />
                                        </Link>
                                    )
                                )}

                            </div>
                        )}

                </div>
            </div>
        </AuthenticatedLayout>
    );
}