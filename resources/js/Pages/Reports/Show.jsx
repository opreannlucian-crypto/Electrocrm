import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";

export default function Show({ freeReport }) {
    const report = freeReport;

    if (!report) {
        return (
            <AuthenticatedLayout
                header={
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Proces-verbal
                    </h2>
                }
            >
                <Head title="Proces-verbal" />

                <div className="py-12">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                            <div className="text-red-600">
                                Procesul-verbal nu a fost gasit.
                            </div>

                            <div className="mt-4">
                                <Link
                                    href="/reports"
                                    className="inline-flex items-center rounded-md bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
                                >
                                    Inapoi la procese-verbale
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    const documentDate = report.document_date
        ? new Date(report.document_date).toLocaleDateString("ro-RO")
        : "-";

    const pdfUrl = `/reports/${report.id}/pdf`;
    const editUrl = `/reports/${report.id}/edit`;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Proces-verbal
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            {report.number || "-"}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={() => { const name = window.prompt("Numele șablonului:", report.title || "Proces-verbal"); if (name) router.post(route("reports.save-template", report.id), { name }); }} className="inline-flex items-center rounded-md border border-indigo-300 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">Salvează ca șablon</button>
                        <a
                            href={pdfUrl}
                            className="inline-flex items-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
                        >
                            Salveaza PDF
                        </a>

                        <a href={route("reports.word", report.id)} className="inline-flex items-center rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800">Export Word</a>

                        <Link
                            href={editUrl}
                            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                        >
                            Editeaza
                        </Link>

                        <Link
                            href="/reports"
                            className="inline-flex items-center rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300"
                        >
                            Inapoi
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Proces-verbal ${report.number || ""}`} />

            <div className="py-8">
                <div className="mx-auto max-w-6xl px-6 lg:px-8">
                    <div className="space-y-6">

                        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
                            <div className="border-t-4 border-blue-600 p-6">
                                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Proces-verbal
                                        </div>

                                        <h1 className="mt-1 text-2xl font-bold text-gray-900">
                                            {report.title || "Proces-verbal"}
                                        </h1>

                                        <div className="mt-2 text-sm text-gray-500">
                                            {report.number || "-"}
                                        </div>
                                    </div>

                                    <div className="rounded-lg bg-gray-50 px-5 py-4 text-right ring-1 ring-gray-200">
                                        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Data
                                        </div>

                                        <div className="mt-1 text-lg font-bold text-gray-900">
                                            {documentDate}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
                                    Beneficiar
                                </h3>

                                <div className="mt-4 space-y-2 text-sm">
                                    <div>
                                        <span className="font-semibold text-gray-700">
                                            Nume:
                                        </span>{" "}
                                        <span className="text-gray-600">
                                            {report.client_name || "-"}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="font-semibold text-gray-700">
                                            CUI:
                                        </span>{" "}
                                        <span className="text-gray-600">
                                            {report.client_cui || "-"}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="font-semibold text-gray-700">
                                            Adresa:
                                        </span>{" "}
                                        <span className="text-gray-600">
                                            {report.client_address || "-"}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="font-semibold text-gray-700">
                                            Telefon:
                                        </span>{" "}
                                        <span className="text-gray-600">
                                            {report.client_phone || "-"}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="font-semibold text-gray-700">
                                            Persoana de contact:
                                        </span>{" "}
                                        <span className="text-gray-600">
                                            {report.contact_person || "-"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
                                    Document
                                </h3>

                                <div className="mt-4 space-y-2 text-sm">
                                    <div>
                                        <span className="font-semibold text-gray-700">
                                            Locatie:
                                        </span>{" "}
                                        <span className="text-gray-600">
                                            {report.location || "-"}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="font-semibold text-gray-700">
                                            Lucrare:
                                        </span>{" "}
                                        <span className="text-gray-600">
                                            {report.work_order?.number || "-"}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="font-semibold text-gray-700">
                                            Oferta / Deviz:
                                        </span>{" "}
                                        <span className="text-gray-600">
                                            {report.quote?.number || "-"}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="font-semibold text-gray-700">
                                            Licenta:
                                        </span>{" "}
                                        <span className="text-gray-600">
                                            {report.license_name || "-"}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="font-semibold text-gray-700">
                                            Cod licenta:
                                        </span>{" "}
                                        <span className="text-gray-600">
                                            {report.license?.code || "-"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {report.participants && (
                            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
                                    Participanti
                                </h3>

                                <div className="mt-4 whitespace-pre-line text-sm leading-6 text-gray-700">
                                    {report.participants}
                                </div>
                            </div>
                        )}

                        {report.subject && (
                            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
                                    Obiectul procesului-verbal
                                </h3>

                                <div className="mt-4 whitespace-pre-line text-sm leading-6 text-gray-700">
                                    {report.subject}
                                </div>
                            </div>
                        )}

                        {report.content && (
                            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
                                    Continut
                                </h3>

                                <div className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-700">
                                    {report.content}
                                </div>
                            </div>
                        )}

                        {report.findings && (
                            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
                                    Constatari
                                </h3>

                                <div className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-700">
                                    {report.findings}
                                </div>
                            </div>
                        )}

                        {report.conclusions && (
                            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
                                    Concluzii
                                </h3>

                                <div className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-700">
                                    {report.conclusions}
                                </div>
                            </div>
                        )}

                        {report.observations && (
                            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
                                    Observatii
                                </h3>

                                <div className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-700">
                                    {report.observations}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
                                    Reprezentant ELECTRODEP
                                </h3>

                                <div className="mt-5 space-y-2 text-sm">
                                    <div>
                                        <span className="font-semibold text-gray-700">
                                            Nume:
                                        </span>{" "}
                                        <span className="text-gray-600">
                                            {report.provider_signature_name || "-"}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="font-semibold text-gray-700">
                                            Functie:
                                        </span>{" "}
                                        <span className="text-gray-600">
                                            {report.provider_signature_position || "-"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
                                    Reprezentant beneficiar
                                </h3>

                                <div className="mt-5 space-y-2 text-sm">
                                    <div>
                                        <span className="font-semibold text-gray-700">
                                            Nume:
                                        </span>{" "}
                                        <span className="text-gray-600">
                                            {report.client_signature_name || "-"}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="font-semibold text-gray-700">
                                            Functie:
                                        </span>{" "}
                                        <span className="text-gray-600">
                                            {report.client_signature_position || "-"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="flex justify-end">
                            <a
                                href={pdfUrl}
                                className="inline-flex items-center rounded-md bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
                            >
                                Salveaza PDF
                            </a>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
