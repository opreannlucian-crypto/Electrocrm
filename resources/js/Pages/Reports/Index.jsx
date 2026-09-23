import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";

export default function Index({
    freeReports = {
        data: [],
        links: [],
        meta: {},
    },
}) {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Procese-verbale
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Creeaza, gestioneaza si acceseaza toate procesele-verbale din ElectroCRM.
                    </p>
                </div>
            }
        >
            <Head title="Procese-verbale" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    {/* ============================================================
                        TITLU
                    ============================================================ */}

                    <div className="mb-8">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
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
                                            Procese-verbale
                                        </h1>

                                        <p className="text-sm text-gray-500">
                                            Alege tipul de document pe care vrei sa il creezi.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Link
                                href={route("dashboard")}
                                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="mr-2 h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15 19l-7-7 7-7"
                                    />
                                </svg>

                                Dashboard
                            </Link>
                        </div>
                    </div>

                    {/* ============================================================
                        TIPURI PROCES-VERBAL
                    ============================================================ */}

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                        {/* ========================================================
                            PROCES-VERBAL LIBER
                        ======================================================== */}

                        <Link
                            href={route("reports.create")}
                            className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-7 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl"
                        >
                            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-50 transition group-hover:scale-125" />

                            <div className="relative">

                                <div className="mb-6 flex items-center justify-between">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-7 w-7"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 20h9"
                                            />

                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"
                                            />
                                        </svg>
                                    </div>

                                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                        Nou
                                    </span>
                                </div>

                                <h2 className="text-xl font-bold text-gray-900">
                                    Proces-verbal liber
                                </h2>

                                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
                                    Creeaza un proces-verbal complet editabil,
                                    independent de o lucrare existenta.
                                </p>

                                <div className="mt-6 flex items-center text-sm font-semibold text-blue-600">
                                    Creeaza proces-verbal

                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </Link>

                        {/* ========================================================
                            PROCES-VERBAL DIN LUCRARE
                        ======================================================== */}

                        <div className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-7 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl">
                            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-50 transition group-hover:scale-125" />

                            <div className="relative">

                                <div className="mb-6 flex items-center justify-between">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-7 w-7"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M9 12h6m-6 4h4"
                                            />

                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M5 20h14a2 2 0 002-2V8.828a2 2 0 00-.586-1.414l-4.828-4.828A2 2 0 0014.172 2H5a2 2 0 00-2 2v14a2 2 0 002 2z"
                                            />

                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M14 3v6h6"
                                            />
                                        </svg>
                                    </div>

                                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                        Lucrare
                                    </span>
                                </div>

                                <h2 className="text-xl font-bold text-gray-900">
                                    Proces-verbal din lucrare
                                </h2>

                                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500">
                                    Foloseste procesul-verbal deja existent
                                    in cadrul unei lucrari si pastreaza toate
                                    datele acesteia.
                                </p>

                                <Link
                                    href={route("work_orders.index")}
                                    className="mt-6 inline-flex items-center text-sm font-semibold text-emerald-600"
                                >
                                    Alege lucrarea

                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* ============================================================
                        PROCESE-VERBALE LIBERE EXISTENTE
                    ============================================================ */}

                    <div className="mt-10 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                        <div className="border-b border-gray-100 px-6 py-5">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">
                                        Procese-verbale libere
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        Documentele create independent de lucrari.
                                    </p>
                                </div>

                                <Link
                                    href={route("reports.create")}
                                    className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                                >
                                    + Proces-verbal nou
                                </Link>
                            </div>
                        </div>

                        {freeReports?.data?.length > 0 ? (
                            <div className="divide-y divide-gray-100">
                                {freeReports.data.map((report) => (
                                    <div
                                        key={report.id}
                                        className="flex flex-col gap-4 px-6 py-5 transition hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-semibold text-gray-900">
                                                    {report.title}
                                                </h3>

                                                {report.number && (
                                                    <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                                                        {report.number}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                                                {report.client_name && (
                                                    <span>
                                                        {report.client_name}
                                                    </span>
                                                )}

                                                {report.document_date && (
                                                    <span>
                                                        {report.document_date}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={route(
                                                    "reports.show",
                                                    report.id
                                                )}
                                                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                                            >
                                                Vezi
                                            </Link>

                                            <Link
                                                href={route(
                                                    "reports.edit",
                                                    report.id
                                                )}
                                                className="rounded-xl bg-gray-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
                                            >
                                                Editeaza
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="px-6 py-12 text-center">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-7 w-7"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 12h6m-6 4h4"
                                        />

                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M5 20h14a2 2 0 002-2V8.828a2 2 0 00-.586-1.414l-4.828-4.828A2 2 0 0014.172 2H5a2 2 0 00-2 2v14a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>

                                <h3 className="mt-4 text-base font-semibold text-gray-900">
                                    Nu exista procese-verbale libere
                                </h3>

                                <p className="mt-1 text-sm text-gray-500">
                                    Creeaza primul proces-verbal liber.
                                </p>

                                <Link
                                    href={route("reports.create")}
                                    className="mt-5 inline-flex items-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                                >
                                    Creeaza primul proces-verbal
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}