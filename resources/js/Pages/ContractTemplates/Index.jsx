import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";

export default function Index({ templates }) {
    const items = templates?.data || [];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Sabloane contracte
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Creeaza si gestioneaza sabloanele pentru contracte.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href="/contracts"
                            className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                            Contracte
                        </Link>

                        <Link
                            href="/contract-templates/create"
                            className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                        >
                            Sablon nou
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Sabloane contracte" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">

                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Sabloane
                            </div>

                            <div className="mt-2 text-2xl font-bold text-gray-900">
                                {templates?.total || items.length}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Active
                            </div>

                            <div className="mt-2 text-2xl font-bold text-emerald-600">
                                {
                                    items.filter(
                                        (template) =>
                                            template.active !== false
                                    ).length
                                }
                            </div>
                        </div>

                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Tipuri
                            </div>

                            <div className="mt-2 text-2xl font-bold text-blue-600">
                                {
                                    new Set(
                                        items
                                            .map(
                                                (template) =>
                                                    template.type
                                            )
                                            .filter(Boolean)
                                    ).size
                                }
                            </div>
                        </div>

                    </div>

                    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                        <div className="border-b border-gray-100 bg-gray-50/70 px-6 py-5">

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                <div>
                                    <h1 className="text-lg font-bold text-gray-900">
                                        Lista sabloanelor
                                    </h1>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Fiecare sablon poate fi modificat independent.
                                    </p>
                                </div>

                                <Link
                                    href="/contract-templates/create"
                                    className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                                >
                                    + Sablon nou
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
                                    Nu exista sabloane
                                </h3>

                                <p className="mt-1 text-sm text-gray-500">
                                    Creeaza primul sablon de contract.
                                </p>

                                <div className="mt-5">
                                    <Link
                                        href="/contract-templates/create"
                                        className="inline-flex items-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                                    >
                                        Creeaza sablon
                                    </Link>
                                </div>

                            </div>
                        ) : (
                            <div className="overflow-x-auto">

                                <table className="min-w-full divide-y divide-gray-200">

                                    <thead className="bg-gray-50">

                                        <tr>

                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                Sablon
                                            </th>

                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                Tip
                                            </th>

                                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                Valoare implicita
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

                                        {items.map(
                                            (template) => (
                                                <tr
                                                    key={
                                                        template.id
                                                    }
                                                    className="transition hover:bg-gray-50"
                                                >

                                                    <td className="px-6 py-4">

                                                        <div className="font-semibold text-gray-900">
                                                            {
                                                                template.name
                                                            }
                                                        </div>

                                                        {template.description && (
                                                            <div className="mt-1 max-w-xl truncate text-sm text-gray-500">
                                                                {
                                                                    template.description
                                                                }
                                                            </div>
                                                        )}

                                                    </td>

                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        {
                                                            template.type ||
                                                            "-"
                                                        }
                                                    </td>

                                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">

                                                        {template.default_value !==
                                                        null &&
                                                        template.default_value !==
                                                        undefined &&
                                                        template.default_value !==
                                                        ""
                                                            ? `${new Intl.NumberFormat(
                                                                  "ro-RO",
                                                                  {
                                                                      minimumFractionDigits: 2,
                                                                      maximumFractionDigits: 2,
                                                                  }
                                                              ).format(
                                                                  Number(
                                                                      template.default_value
                                                                  )
                                                              )} RON`
                                                            : "-"}

                                                    </td>

                                                    <td className="px-6 py-4">

                                                        <span
                                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
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

                                                    </td>

                                                    <td className="px-6 py-4">

                                                        <div className="flex justify-end gap-2">

                                                            <Link
                                                                href={`/contract-templates/${template.id}`}
                                                                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                                            >
                                                                Vezi
                                                            </Link>

                                                            <Link
                                                                href={`/contract-templates/${template.id}/edit`}
                                                                className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                                                            >
                                                                Editeaza
                                                            </Link>

                                                        </div>

                                                    </td>

                                                </tr>
                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>
                        )}

                    </div>

                    {templates?.links &&
                        templates.links.length > 3 && (
                            <div className="mt-6 flex flex-wrap justify-center gap-2">

                                {templates.links.map(
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