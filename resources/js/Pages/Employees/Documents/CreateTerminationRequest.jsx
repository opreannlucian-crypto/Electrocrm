import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function CreateTerminationRequest({ employee }) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
    } = useForm({
        request_type: "demisie",
        document_date: new Date()
            .toISOString()
            .substring(0, 10),
        termination_date: "",
        notice_days: "",
        reason: "",
        description: "",
    });

    function submit(event) {
        event.preventDefault();

        post(
            route(
                "employees.documents.termination-request.store",
                employee.id
            ),
            {
                preserveScroll: true,
            }
        );
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Cerere demisie / incetare
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            {employee?.name || "-"}
                        </p>
                    </div>

                    <Link
                        href={route(
                            "employees.show",
                            employee.id
                        )}
                        className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                    >
                        Inapoi
                    </Link>
                </div>
            }
        >
            <Head title="Cerere demisie / incetare" />

            <div className="py-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                        <div className="border-b border-gray-100 bg-gradient-to-r from-red-600 to-orange-600 px-6 py-7 text-white sm:px-8">
                            <div>
                                <h1 className="text-2xl font-bold">
                                    Cerere demisie / incetare
                                </h1>

                                <p className="mt-1 text-sm text-red-100">
                                    Genereaza documentul PDF pentru angajat
                                </p>
                            </div>
                        </div>

                        <form
                            onSubmit={submit}
                            className="p-6 sm:p-8"
                        >
                            <div className="mb-8 rounded-2xl border border-gray-100 bg-gray-50 p-5">
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Angajat
                                </div>

                                <div className="mt-2 text-lg font-bold text-gray-900">
                                    {employee?.name || "-"}
                                </div>

                                <div className="mt-1 text-sm text-gray-500">
                                    {employee?.position ||
                                        "Fara functie"}

                                    {employee?.department
                                        ? ` - ${employee.department}`
                                        : ""}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Tip document *
                                    </label>

                                    <select
                                        value={data.request_type}
                                        onChange={(event) =>
                                            setData(
                                                "request_type",
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border-gray-300 bg-white text-sm shadow-sm focus:border-red-500 focus:ring-red-500"
                                    >
                                        <option value="demisie">
                                            Demisie
                                        </option>

                                        <option value="incetare">
                                            Incetare contract de munca
                                        </option>
                                    </select>

                                    {errors.request_type && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {errors.request_type}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Data cererii *
                                    </label>

                                    <input
                                        type="date"
                                        value={data.document_date}
                                        onChange={(event) =>
                                            setData(
                                                "document_date",
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border-gray-300 bg-white text-sm shadow-sm focus:border-red-500 focus:ring-red-500"
                                    />

                                    {errors.document_date && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {errors.document_date}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Data incetarii *
                                    </label>

                                    <input
                                        type="date"
                                        value={data.termination_date}
                                        onChange={(event) =>
                                            setData(
                                                "termination_date",
                                                event.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border-gray-300 bg-white text-sm shadow-sm focus:border-red-500 focus:ring-red-500"
                                    />

                                    {errors.termination_date && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {errors.termination_date}
                                        </p>
                                    )}
                                </div>

                                {data.request_type === "demisie" && (
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                                            Termen de preaviz (zile)
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            max="365"
                                            value={data.notice_days}
                                            onChange={(event) =>
                                                setData(
                                                    "notice_days",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Ex: 20"
                                            className="w-full rounded-xl border-gray-300 bg-white text-sm shadow-sm focus:border-red-500 focus:ring-red-500"
                                        />

                                        {errors.notice_days && (
                                            <p className="mt-1 text-xs text-red-600">
                                                {errors.notice_days}
                                            </p>
                                        )}

                                        <p className="mt-2 text-xs text-gray-500">
                                            Lasa gol daca nu doresti sa specifici preavizul.
                                        </p>
                                    </div>
                                )}

                                <div
                                    className={
                                        data.request_type === "demisie"
                                            ? ""
                                            : "md:col-span-2"
                                    }
                                >
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Motiv
                                    </label>

                                    <input
                                        type="text"
                                        value={data.reason}
                                        onChange={(event) =>
                                            setData(
                                                "reason",
                                                event.target.value
                                            )
                                        }
                                        placeholder={
                                            data.request_type === "demisie"
                                                ? "Ex: motive personale"
                                                : "Ex: acordul partilor"
                                        }
                                        className="w-full rounded-xl border-gray-300 bg-white text-sm shadow-sm focus:border-red-500 focus:ring-red-500"
                                    />

                                    {errors.reason && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {errors.reason}
                                        </p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Observatii
                                    </label>

                                    <textarea
                                        rows="5"
                                        value={data.description}
                                        onChange={(event) =>
                                            setData(
                                                "description",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Observatii suplimentare..."
                                        className="w-full rounded-xl border-gray-300 bg-white text-sm shadow-sm focus:border-red-500 focus:ring-red-500"
                                    />

                                    {errors.description && (
                                        <p className="mt-1 text-xs text-red-600">
                                            {errors.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                                <div>
                                    <div className="text-sm font-bold text-gray-900">
                                        Document PDF
                                    </div>

                                    <p className="mt-1 text-sm leading-6 text-gray-600">
                                        Dupa trimitere, cererea va fi generata automat in format PDF si salvata in documentele angajatului.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                                <Link
                                    href={route(
                                        "employees.show",
                                        employee.id
                                    )}
                                    className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                                >
                                    Anuleaza
                                </Link>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center justify-center rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {processing
                                        ? "Se genereaza..."
                                        : "Genereaza cererea PDF"}
                                </button>

                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}