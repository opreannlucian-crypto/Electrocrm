import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useEffect, useMemo } from "react";

export default function CreateLeaveRequest({
    employee,
}) {
    const today = new Date()
        .toISOString()
        .substring(0, 10);

    const form = useForm({
        document_date: today,
        period_start: "",
        period_end: "",
        days: "",
        description: "",
    });

    const {
        data,
        setData,
        post,
        processing,
        errors,
    } = form;

    const calculatedDays = useMemo(() => {
        if (
            !data.period_start ||
            !data.period_end
        ) {
            return 0;
        }

        const start = new Date(
            `${data.period_start}T00:00:00`
        );

        const end = new Date(
            `${data.period_end}T00:00:00`
        );

        if (
            Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime())
        ) {
            return 0;
        }

        if (end < start) {
            return 0;
        }

        const difference =
            end.getTime() -
            start.getTime();

        return (
            Math.floor(
                difference /
                    (1000 * 60 * 60 * 24)
            ) + 1
        );
    }, [
        data.period_start,
        data.period_end,
    ]);

    useEffect(() => {
        if (calculatedDays > 0) {
            setData(
                "days",
                calculatedDays
            );
        } else {
            setData("days", "");
        }
    }, [calculatedDays]);

    function formatDate(date) {
        if (!date) {
            return "-";
        }

        const value = String(date)
            .substring(0, 10);

        const match = value.match(
            /^(\d{4})-(\d{2})-(\d{2})$/
        );

        if (!match) {
            return String(date);
        }

        const [, year, month, day] =
            match;

        return `${day}.${month}.${year}`;
    }

    function submit(event) {
        event.preventDefault();

        post(
            route(
                "employees.documents.leave-request.store",
                employee.id
            )
        );
    }

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            Cerere de concediu
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            {employee?.name ||
                                "-"}
                        </p>
                    </div>

                    <Link
                        href={route(
                            "employees.show",
                            employee.id
                        )}
                        className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                    >
                        Inapoi la angajat
                    </Link>
                </div>
            }
        >
            <Head title="Cerere de concediu" />

            <div className="py-8">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">

                    {/* =====================================================
                        HEADER
                    ====================================================== */}

                    <div className="mb-6 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-7 text-white sm:px-8">

                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                                <div className="flex items-center gap-4">

                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl backdrop-blur-sm">
                                        📅
                                    </div>

                                    <div>
                                        <div className="text-sm font-medium text-blue-100">
                                            Document nou
                                        </div>

                                        <h1 className="mt-1 text-2xl font-bold">
                                            Cerere de concediu
                                        </h1>

                                        <p className="mt-1 text-sm text-blue-100">
                                            Cerere de concediu de odihna
                                        </p>
                                    </div>

                                </div>

                                <div className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">

                                    <div className="text-xs font-semibold uppercase tracking-wide text-blue-100">
                                        Angajat
                                    </div>

                                    <div className="mt-1 text-base font-bold">
                                        {employee?.name ||
                                            "-"}
                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* =====================================================
                        DATE ANGAJAT
                    ====================================================== */}

                    <div className="mb-6 rounded-3xl border border-gray-200 bg-white shadow-sm">

                        <div className="border-b border-gray-100 px-6 py-5 sm:px-8">

                            <h2 className="text-lg font-bold text-gray-900">
                                Date angajat
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Datele sunt preluate automat din fisa angajatului.
                            </p>

                        </div>

                        <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2 sm:p-8">

                            <div className="rounded-2xl bg-gray-50 p-5">

                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Nume complet
                                </div>

                                <div className="mt-2 text-base font-bold text-gray-900">
                                    {employee?.name ||
                                        "-"}
                                </div>

                            </div>

                            <div className="rounded-2xl bg-gray-50 p-5">

                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    CNP
                                </div>

                                <div className="mt-2 text-base font-bold text-gray-900">
                                    {employee?.cnp ||
                                        "-"}
                                </div>

                            </div>

                            <div className="rounded-2xl bg-gray-50 p-5">

                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Functie
                                </div>

                                <div className="mt-2 text-base font-bold text-gray-900">
                                    {employee?.position ||
                                        "-"}
                                </div>

                            </div>

                            <div className="rounded-2xl bg-gray-50 p-5">

                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Departament
                                </div>

                                <div className="mt-2 text-base font-bold text-gray-900">
                                    {employee?.department ||
                                        "-"}
                                </div>

                            </div>

                        </div>

                    </div>


                    {/* =====================================================
                        FORMULAR
                    ====================================================== */}

                    <form
                        onSubmit={submit}
                        className="space-y-6"
                    >

                        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">

                            <div className="border-b border-gray-100 px-6 py-5 sm:px-8">

                                <h2 className="text-lg font-bold text-gray-900">
                                    Date cerere
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Completeaza perioada pentru care se solicita concediul.
                                </p>

                            </div>

                            <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 sm:p-8">

                                {/* DATA CERERII */}

                                <div>
                                    <label
                                        htmlFor="document_date"
                                        className="block text-sm font-semibold text-gray-700"
                                    >
                                        Data cererii
                                    </label>

                                    <input
                                        id="document_date"
                                        type="date"
                                        value={
                                            data.document_date
                                        }
                                        onChange={(event) =>
                                            setData(
                                                "document_date",
                                                event.target
                                                    .value
                                            )
                                        }
                                        className="mt-2 block w-full rounded-xl border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                    {errors.document_date && (
                                        <p className="mt-2 text-sm font-medium text-red-600">
                                            {
                                                errors.document_date
                                            }
                                        </p>
                                    )}
                                </div>


                                {/* NUMAR ZILE */}

                                <div>
                                    <label
                                        htmlFor="days"
                                        className="block text-sm font-semibold text-gray-700"
                                    >
                                        Numar zile
                                    </label>

                                    <input
                                        id="days"
                                        type="number"
                                        min="1"
                                        max="366"
                                        value={
                                            data.days
                                        }
                                        readOnly
                                        className="mt-2 block w-full rounded-xl border-gray-300 bg-gray-50 px-4 py-3 font-bold text-gray-900 shadow-sm"
                                    />

                                    <p className="mt-2 text-xs text-gray-500">
                                        Numarul de zile se calculeaza automat.
                                    </p>

                                    {errors.days && (
                                        <p className="mt-2 text-sm font-medium text-red-600">
                                            {
                                                errors.days
                                            }
                                        </p>
                                    )}
                                </div>


                                {/* DE LA */}

                                <div>
                                    <label
                                        htmlFor="period_start"
                                        className="block text-sm font-semibold text-gray-700"
                                    >
                                        Concediu de la
                                    </label>

                                    <input
                                        id="period_start"
                                        type="date"
                                        value={
                                            data.period_start
                                        }
                                        onChange={(event) =>
                                            setData(
                                                "period_start",
                                                event.target
                                                    .value
                                            )
                                        }
                                        className="mt-2 block w-full rounded-xl border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                    {errors.period_start && (
                                        <p className="mt-2 text-sm font-medium text-red-600">
                                            {
                                                errors.period_start
                                            }
                                        </p>
                                    )}
                                </div>


                                {/* PANA LA */}

                                <div>
                                    <label
                                        htmlFor="period_end"
                                        className="block text-sm font-semibold text-gray-700"
                                    >
                                        Concediu pana la
                                    </label>

                                    <input
                                        id="period_end"
                                        type="date"
                                        min={
                                            data.period_start ||
                                            undefined
                                        }
                                        value={
                                            data.period_end
                                        }
                                        onChange={(event) =>
                                            setData(
                                                "period_end",
                                                event.target
                                                    .value
                                            )
                                        }
                                        className="mt-2 block w-full rounded-xl border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                    {errors.period_end && (
                                        <p className="mt-2 text-sm font-medium text-red-600">
                                            {
                                                errors.period_end
                                            }
                                        </p>
                                    )}
                                </div>

                            </div>

                        </div>


                        {/* =====================================================
                            REZUMAT
                        ====================================================== */}

                        <div className="rounded-3xl border border-blue-100 bg-blue-50 shadow-sm">

                            <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">

                                <div>
                                    <div className="text-sm font-semibold text-blue-700">
                                        Perioada concediului
                                    </div>

                                    <div className="mt-1 text-lg font-bold text-blue-950">
                                        {data.period_start
                                            ? formatDate(
                                                data.period_start
                                            )
                                            : "-"}
                                        {" "}
                                        →
                                        {" "}
                                        {data.period_end
                                            ? formatDate(
                                                data.period_end
                                            )
                                            : "-"}
                                    </div>
                                </div>

                                <div className="rounded-2xl bg-white px-5 py-4 text-center shadow-sm">

                                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        Total
                                    </div>

                                    <div className="mt-1 text-2xl font-black text-blue-700">
                                        {calculatedDays ||
                                            0}
                                    </div>

                                    <div className="text-xs font-medium text-gray-500">
                                        {calculatedDays ===
                                        1
                                            ? "zi"
                                            : "zile"}
                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* =====================================================
                            OBSERVATII
                        ====================================================== */}

                        <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">

                            <div className="border-b border-gray-100 px-6 py-5 sm:px-8">

                                <h2 className="text-lg font-bold text-gray-900">
                                    Observatii
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Optional. Aceste informatii vor aparea in document.
                                </p>

                            </div>

                            <div className="p-6 sm:p-8">

                                <textarea
                                    value={
                                        data.description
                                    }
                                    onChange={(event) =>
                                        setData(
                                            "description",
                                            event.target
                                                .value
                                        )
                                    }
                                    rows="5"
                                    placeholder="Observatii suplimentare..."
                                    className="block w-full rounded-xl border-gray-300 px-4 py-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />

                                {errors.description && (
                                    <p className="mt-2 text-sm font-medium text-red-600">
                                        {
                                            errors.description
                                        }
                                    </p>
                                )}

                            </div>

                        </div>


                        {/* =====================================================
                            ACTIUNI
                        ====================================================== */}

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

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
                                disabled={
                                    processing
                                }
                                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {processing
                                    ? "Se genereaza..."
                                    : "Genereaza cererea PDF"}
                            </button>

                        </div>

                    </form>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}