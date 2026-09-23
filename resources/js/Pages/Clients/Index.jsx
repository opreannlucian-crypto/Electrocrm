import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";

export default function Index({ clients = [] }) {
    function deleteClient(id) {
        if (confirm("Sigur dorești ștergerea acestui client?")) {
            router.delete(route("clients.destroy", id));
        }
    }

    return (
        <AuthenticatedLayout>
            <Head title="Clienți" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* HEADER */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">
                                Clienți
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                Gestionează clienții și istoricul acestora.
                            </p>
                        </div>

                        <Link
                            href={route("clients.create")}
                            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm transition"
                        >
                            <span className="text-lg">+</span>
                            Adaugă client
                        </Link>

                    </div>


                    {/* LISTĂ CLIENȚI */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">

                            <div className="flex items-center justify-between">

                                <div>
                                    <h2 className="font-bold text-slate-900">
                                        Lista clienților
                                    </h2>

                                    <p className="text-sm text-slate-500 mt-1">
                                        {clients.length}{" "}
                                        {clients.length === 1
                                            ? "client"
                                            : "clienți"}
                                    </p>
                                </div>

                            </div>

                        </div>


                        {clients.length === 0 ? (

                            <div className="p-12 text-center">

                                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-3xl">
                                    👥
                                </div>

                                <h3 className="mt-4 text-lg font-bold text-slate-900">
                                    Nu există clienți
                                </h3>

                                <p className="mt-1 text-sm text-slate-500">
                                    Adaugă primul client pentru a începe.
                                </p>

                                <div className="mt-5">

                                    <Link
                                        href={route("clients.create")}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition"
                                    >
                                        + Adaugă client
                                    </Link>

                                </div>

                            </div>

                        ) : (

                            <div className="overflow-x-auto">

                                <table className="w-full">

                                    <thead>

                                        <tr className="border-b border-slate-200 bg-slate-50">

                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
                                                Client
                                            </th>

                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
                                                Telefon
                                            </th>

                                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
                                                Oraș
                                            </th>

                                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wide">
                                                Acțiuni
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody className="divide-y divide-slate-100">

                                        {clients.map((client) => (

                                            <tr
                                                key={client.id}
                                                className="hover:bg-slate-50 transition"
                                            >

                                                {/* CLIENT */}
                                                <td className="px-6 py-4">

                                                    <div className="flex items-center gap-3">

                                                        <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                                                            {client.name
                                                                ? client.name
                                                                      .charAt(0)
                                                                      .toUpperCase()
                                                                : "?"}
                                                        </div>

                                                        <div>

                                                            <div className="font-semibold text-slate-900">
                                                                {client.name || "-"}
                                                            </div>

                                                            {client.cui && (
                                                                <div className="text-xs text-slate-500 mt-1">
                                                                    CUI: {client.cui}
                                                                </div>
                                                            )}

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* TELEFON */}
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {client.phone || "-"}
                                                </td>


                                                {/* ORAȘ */}
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {client.city || "-"}
                                                </td>


                                                {/* ACȚIUNI */}
                                                <td className="px-6 py-4">

                                                    <div className="flex flex-wrap items-center justify-end gap-2">

                                                        {/* VEZI CLIENT */}
                                                        <Link
                                                            href={route(
                                                                "clients.show",
                                                                client.id
                                                            )}
                                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition"
                                                        >
                                                            👁️
                                                            <span>
                                                                Vezi clientul
                                                            </span>
                                                        </Link>


                                                        {/* EDITARE */}
                                                        <Link
                                                            href={route(
                                                                "clients.edit",
                                                                client.id
                                                            )}
                                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-semibold transition"
                                                        >
                                                            ✏️
                                                            <span>
                                                                Editare
                                                            </span>
                                                        </Link>


                                                        {/* ȘTERGERE */}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                deleteClient(
                                                                    client.id
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition"
                                                        >
                                                            🗑️
                                                            <span>
                                                                Șterge
                                                            </span>
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}