import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";

export default function Index({ employees }) {
    const [search, setSearch] = useState("");

    const deleteEmployee = (id) => {
        if (
            confirm(
                "Sigur doriti sa stergeti acest angajat?"
            )
        ) {
            router.delete(
                route(
                    "employees.destroy",
                    id
                )
            );
        }
    };

    const filteredEmployees =
        employees.data.filter(
            (employee) => {
                const text =
                    search.toLowerCase();

                return (
                    employee.name
                        ?.toLowerCase()
                        .includes(text) ||
                    employee.phone
                        ?.toLowerCase()
                        .includes(text) ||
                    employee.email
                        ?.toLowerCase()
                        .includes(text) ||
                    employee.position
                        ?.toLowerCase()
                        .includes(text) ||
                    employee.department
                        ?.toLowerCase()
                        .includes(text)
                );
            }
        );

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            Angajati
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Lista si fisele angajatilor
                        </p>
                    </div>

                    <Link
                        href={route(
                            "employees.create"
                        )}
                        className="inline-flex items-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                    >
                        + Adauga angajat
                    </Link>
                </div>
            }
        >
            <Head title="Angajati" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

                        {/* HEADER */}

                        <div className="border-b border-gray-200 px-6 py-5 sm:px-8">

                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                        Lista angajatilor
                                    </h3>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Apasa pe numele unui angajat pentru a deschide fisa completa.
                                    </p>
                                </div>

                                <div className="w-full lg:max-w-md">

                                    <input
                                        type="text"
                                        placeholder="Cauta dupa nume, telefon, email, functie..."
                                        className="w-full rounded-xl border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>

                            </div>

                        </div>


                        {/* TABEL */}

                        <div className="overflow-x-auto">

                            <table className="w-full">

                                <thead>

                                    <tr className="border-b border-gray-200 bg-gray-50">

                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Angajat
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Functie
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Departament
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Telefon
                                        </th>

                                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Status
                                        </th>

                                        <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Actiuni
                                        </th>

                                    </tr>

                                </thead>


                                <tbody className="divide-y divide-gray-100">

                                    {filteredEmployees.length ===
                                    0 ? (

                                        <tr>

                                            <td
                                                colSpan="6"
                                                className="px-6 py-14 text-center"
                                            >

                                                <div className="text-4xl">
                                                    👷
                                                </div>

                                                <div className="mt-3 text-lg font-semibold text-gray-800">
                                                    Nu exista angajati
                                                </div>

                                                <div className="mt-1 text-sm text-gray-500">
                                                    Nu a fost gasit niciun angajat pentru cautarea efectuata.
                                                </div>

                                            </td>

                                        </tr>

                                    ) : (

                                        filteredEmployees.map(
                                            (employee) => (
                                                <tr
                                                    key={
                                                        employee.id
                                                    }
                                                    className="transition hover:bg-gray-50"
                                                >

                                                    {/* ANGAJAT */}

                                                    <td className="px-6 py-4">

                                                        <Link
                                                            href={route(
                                                                "employees.show",
                                                                employee.id
                                                            )}
                                                            className="group inline-flex items-center gap-3"
                                                        >

                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-lg">
                                                                👤
                                                            </div>

                                                            <div>

                                                                <div className="font-bold text-gray-900 group-hover:text-blue-600">
                                                                    {
                                                                        employee.name
                                                                    }
                                                                </div>

                                                                {employee.email && (
                                                                    <div className="mt-0.5 text-sm text-gray-500">
                                                                        {
                                                                            employee.email
                                                                        }
                                                                    </div>
                                                                )}

                                                            </div>

                                                        </Link>

                                                    </td>


                                                    {/* FUNCTIE */}

                                                    <td className="px-6 py-4">

                                                        <span className="text-sm font-medium text-gray-700">
                                                            {
                                                                employee.position ||
                                                                "-"
                                                            }
                                                        </span>

                                                    </td>


                                                    {/* DEPARTAMENT */}

                                                    <td className="px-6 py-4">

                                                        <span className="text-sm text-gray-700">
                                                            {
                                                                employee.department ||
                                                                "-"
                                                            }
                                                        </span>

                                                    </td>


                                                    {/* TELEFON */}

                                                    <td className="px-6 py-4">

                                                        <span className="text-sm text-gray-700">
                                                            {
                                                                employee.phone ||
                                                                "-"
                                                            }
                                                        </span>

                                                    </td>


                                                    {/* STATUS */}

                                                    <td className="px-6 py-4">

                                                        <span
                                                            className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                                                                employee.status ===
                                                                "Activ"
                                                                    ? "bg-green-100 text-green-700"
                                                                    : employee.status ===
                                                                        "Concediu"
                                                                      ? "bg-yellow-100 text-yellow-700"
                                                                      : "bg-red-100 text-red-700"
                                                            }`}
                                                        >
                                                            {
                                                                employee.status ||
                                                                "Activ"
                                                            }
                                                        </span>

                                                    </td>


                                                    {/* ACTIUNI */}

                                                    <td className="px-6 py-4">

                                                        <div className="flex items-center justify-center gap-3">

                                                            <Link
                                                                href={route(
                                                                    "employees.show",
                                                                    employee.id
                                                                )}
                                                                className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                                                            >
                                                                Fisa
                                                            </Link>


                                                            <Link
                                                                href={route(
                                                                    "employees.edit",
                                                                    employee.id
                                                                )}
                                                                className="text-sm font-semibold text-gray-600 hover:text-blue-600"
                                                            >
                                                                Editare
                                                            </Link>


                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    deleteEmployee(
                                                                        employee.id
                                                                    )
                                                                }
                                                                className="text-sm font-semibold text-red-600 hover:text-red-700"
                                                            >
                                                                Sterge
                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>
                                            )
                                        )

                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}