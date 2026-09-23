import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";

export default function Index({ products, filters = {} }) {
    const productList = products?.data ?? [];

    const [search, setSearch] = useState(filters.search ?? "");
    const [filter, setFilter] = useState(filters.filter ?? "all");
    const importForm = useForm({ file: null });
    const { flash = {} } = usePage().props;

    useEffect(() => {
        setSearch(filters.search ?? "");
        setFilter(filters.filter ?? "all");
    }, [filters.search, filters.filter]);

    function applyFilters(
        newSearch = search,
        newFilter = filter
    ) {
        router.get(
            route("products.index"),
            {
                search: newSearch,
                filter: newFilter,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    }

    function handleSearchSubmit(event) {
        event.preventDefault();

        applyFilters(search, filter);
    }

    function clearFilters() {
        setSearch("");
        setFilter("all");

        router.get(
            route("products.index"),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    }

    function deleteProduct(product) {
        if (
            !confirm(
                `Sigur vrei să ștergi produsul "${product.name}"?`
            )
        ) {
            return;
        }

        router.delete(
            route("products.destroy", product.id)
        );
    }

    function importProducts(event) {
        event.preventDefault();

        if (!importForm.data.file) {
            return;
        }

        importForm.post(route("products.import"), {
            forceFormData: true,
            onSuccess: () => importForm.reset(),
        });
    }

    function formatMoney(value) {
        return Number(value || 0).toLocaleString(
            "ro-RO",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        );
    }

    function stockStatus(product) {
        const stock = Number(
            product.stock_quantity || 0
        );

        const minimum = Number(
            product.minimum_stock || 0
        );

        if (stock <= 0) {
            return {
                label: "Fără stoc",
                className:
                    "bg-red-100 text-red-700",
            };
        }

        if (stock <= minimum) {
            return {
                label: "Stoc redus",
                className:
                    "bg-yellow-100 text-yellow-700",
            };
        }

        return {
            label: "În stoc",
            className:
                "bg-green-100 text-green-700",
            };
    }

    const filterButtons = [
        {
            key: "all",
            label: "Toate",
        },
        {
            key: "in_stock",
            label: "În stoc",
        },
        {
            key: "low_stock",
            label: "Stoc redus",
        },
        {
            key: "out_of_stock",
            label: "Fără stoc",
        },
        {
            key: "inactive",
            label: "Inactive",
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Stoc" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    <div className="bg-white shadow-xl rounded-2xl overflow-hidden">

                        {/* HEADER */}

                        <div className="bg-slate-900 text-white px-8 py-7">

                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                                <div>

                                    <p className="text-sm text-slate-300">
                                        CRM • Gestiune
                                    </p>

                                    <h1 className="text-3xl font-bold mt-1">
                                        Stoc
                                    </h1>

                                    <p className="text-slate-300 mt-2">
                                        Produse și materiale disponibile
                                    </p>

                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <form onSubmit={importProducts}>
                                        <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700">
                                            {importForm.processing ? "Se importă..." : "📥 Importă din Excel"}
                                            <input
                                                type="file"
                                                accept=".xlsx,.xls,.csv,.txt"
                                                className="hidden"
                                                disabled={importForm.processing}
                                                onChange={(event) => {
                                                    importForm.setData("file", event.target.files?.[0] ?? null);
                                                    event.target.form?.requestSubmit();
                                                }}
                                            />
                                        </label>
                                    </form>

                                    <Link
                                        href={route("products.create")}
                                        className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold transition"
                                    >
                                        + Adaugă produs
                                    </Link>
                                </div>

                            </div>

                        </div>

                        {(flash.success || flash.error || importForm.errors.file) && (
                            <div className="mx-8 mt-6 space-y-2">
                                {flash.success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{flash.success}</div>}
                                {(flash.error || importForm.errors.file) && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{flash.error || importForm.errors.file}</div>}
                            </div>
                        )}

                        <p className="mx-8 mt-5 text-sm text-slate-500">
                            Pentru import, prima linie trebuie să conțină coloana <b>Denumire</b>. Poți adăuga opțional: Cod, EAN, Categorie, U/M, Stoc, Preț achiziție, Preț vânzare, TVA, Stoc minim, Activ și Observații.
                        </p>


                        {/* SEARCH + FILTERS */}

                        <div className="px-8 pt-8">

                            <form
                                onSubmit={
                                    handleSearchSubmit
                                }
                                className="flex flex-col lg:flex-row gap-3"
                            >

                                <div className="relative flex-1">

                                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                                        🔎
                                    </div>

                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(
                                                event.target
                                                    .value
                                            )
                                        }
                                        placeholder="Caută după nume, cod, EAN sau categorie..."
                                        className="w-full rounded-xl border-gray-300 pl-11 pr-4 py-3.5 text-gray-800 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                                <button
                                    type="submit"
                                    className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                                >
                                    Caută
                                </button>

                                {(search ||
                                    filter !==
                                        "all") && (
                                    <button
                                        type="button"
                                        onClick={
                                            clearFilters
                                        }
                                        className="px-5 py-3.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition"
                                    >
                                        Resetează
                                    </button>
                                )}

                            </form>


                            {/* FILTER BUTTONS */}

                            <div className="flex flex-wrap gap-2 mt-5">

                                {filterButtons.map(
                                    (button) => {

                                        const active =
                                            filter ===
                                            button.key;

                                        return (
                                            <button
                                                key={
                                                    button.key
                                                }
                                                type="button"
                                                onClick={() => {
                                                    setFilter(
                                                        button.key
                                                    );

                                                    applyFilters(
                                                        search,
                                                        button.key
                                                    );
                                                }}
                                                className={
                                                    "px-4 py-2 rounded-lg text-sm font-semibold border transition " +
                                                    (
                                                        active
                                                            ? "bg-slate-900 text-white border-slate-900"
                                                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                                    )
                                                }
                                            >
                                                {
                                                    button.label
                                                }
                                            </button>
                                        );
                                    }
                                )}

                            </div>

                        </div>


                        {/* CONTENT */}

                        <div className="p-8">

                            {productList.length === 0 ? (

                                <div className="text-center py-16">

                                    <div className="text-5xl mb-4">
                                        📦
                                    </div>

                                    <h2 className="text-xl font-bold text-gray-800">
                                        {search ||
                                        filter !==
                                            "all"
                                            ? "Nu am găsit produse"
                                            : "Nu există produse"}
                                    </h2>

                                    <p className="text-gray-500 mt-2">

                                        {search ||
                                        filter !==
                                            "all"
                                            ? "Încearcă o altă căutare sau resetează filtrele."
                                            : "Adaugă primul produs în stoc."}

                                    </p>

                                    {search ||
                                    filter !==
                                        "all" ? (

                                        <button
                                            type="button"
                                            onClick={
                                                clearFilters
                                            }
                                            className="inline-block mt-5 bg-gray-900 hover:bg-gray-800 text-white px-5 py-3 rounded-xl font-semibold"
                                        >
                                            Resetează filtrele
                                        </button>

                                    ) : (

                                        <Link
                                            href={route(
                                                "products.create"
                                            )}
                                            className="inline-block mt-5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold"
                                        >
                                            + Adaugă primul produs
                                        </Link>

                                    )}

                                </div>

                            ) : (

                                <div className="overflow-x-auto">

                                    <table className="w-full">

                                        <thead>

                                            <tr className="border-b bg-gray-50">

                                                <th className="text-left px-4 py-4 text-sm font-semibold text-gray-700">
                                                    Produs
                                                </th>

                                                <th className="text-left px-4 py-4 text-sm font-semibold text-gray-700">
                                                    Cod
                                                </th>

                                                <th className="text-left px-4 py-4 text-sm font-semibold text-gray-700">
                                                    EAN
                                                </th>

                                                <th className="text-left px-4 py-4 text-sm font-semibold text-gray-700">
                                                    Categorie
                                                </th>

                                                <th className="text-right px-4 py-4 text-sm font-semibold text-gray-700">
                                                    Stoc
                                                </th>

                                                <th className="text-right px-4 py-4 text-sm font-semibold text-gray-700">
                                                    Preț vânzare
                                                </th>

                                                <th className="text-center px-4 py-4 text-sm font-semibold text-gray-700">
                                                    Status
                                                </th>

                                                <th className="text-right px-4 py-4 text-sm font-semibold text-gray-700">
                                                    Acțiuni
                                                </th>

                                            </tr>

                                        </thead>

                                        <tbody>

                                            {productList.map(
                                                (product) => {

                                                    const status =
                                                        stockStatus(
                                                            product
                                                        );

                                                    return (
                                                        <tr
                                                            key={
                                                                product.id
                                                            }
                                                            className="border-b hover:bg-gray-50 transition"
                                                        >

                                                            <td className="px-4 py-4">

                                                                <div className="font-semibold text-gray-900">
                                                                    {
                                                                        product.name
                                                                    }
                                                                </div>

                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    UM:{" "}
                                                                    {
                                                                        product.unit
                                                                    }
                                                                </div>

                                                            </td>


                                                            <td className="px-4 py-4 text-gray-600">
                                                                {product.code ||
                                                                    "—"}
                                                            </td>


                                                            <td className="px-4 py-4 text-gray-600">
                                                                {product.ean ||
                                                                    "—"}
                                                            </td>


                                                            <td className="px-4 py-4 text-gray-600">
                                                                {product.category ||
                                                                    "—"}
                                                            </td>


                                                            <td className="px-4 py-4 text-right">

                                                                <div className="font-semibold">
                                                                    {formatMoney(
                                                                        product.stock_quantity
                                                                    )}{" "}
                                                                    {
                                                                        product.unit
                                                                    }
                                                                </div>

                                                                <div className="text-xs text-gray-500">
                                                                    Min:{" "}
                                                                    {formatMoney(
                                                                        product.minimum_stock
                                                                    )}
                                                                </div>

                                                            </td>


                                                            <td className="px-4 py-4 text-right font-semibold">

                                                                {formatMoney(
                                                                    product.sale_price
                                                                )}{" "}
                                                                lei

                                                            </td>


                                                            <td className="px-4 py-4 text-center">

                                                                <span
                                                                    className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${status.className}`}
                                                                >
                                                                    {
                                                                        status.label
                                                                    }
                                                                </span>

                                                            </td>


                                                            <td className="px-4 py-4">

                                                                <div className="flex justify-end gap-2">

                                                                    <Link
                                                                        href={route(
                                                                            "products.show",
                                                                            product.id
                                                                        )}
                                                                        className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium transition"
                                                                    >
                                                                        Vezi
                                                                    </Link>


                                                                    <Link
                                                                        href={route(
                                                                            "products.edit",
                                                                            product.id
                                                                        )}
                                                                        className="px-3 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-medium transition"
                                                                    >
                                                                        Editează
                                                                    </Link>


                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            deleteProduct(
                                                                                product
                                                                            )
                                                                        }
                                                                        className="px-3 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium transition"
                                                                    >
                                                                        Șterge
                                                                    </button>

                                                                </div>

                                                            </td>

                                                        </tr>
                                                    );
                                                }
                                            )}

                                        </tbody>

                                    </table>

                                </div>

                            )}


                            {/* PAGINARE */}

                            {products?.links &&
                                products.links.length >
                                    3 && (

                                    <div className="flex flex-wrap gap-2 mt-6">

                                        {products.links.map(
                                            (
                                                link,
                                                index
                                            ) => (

                                                <button
                                                    key={
                                                        index
                                                    }
                                                    type="button"
                                                    disabled={
                                                        !link.url
                                                    }
                                                    onClick={() => {
                                                        if (
                                                            link.url
                                                        ) {
                                                            router.get(
                                                                link.url,
                                                                {},
                                                                {
                                                                    preserveState:
                                                                        true,
                                                                    preserveScroll:
                                                                        true,
                                                                }
                                                            );
                                                        }
                                                    }}
                                                    className={`px-3 py-2 rounded-lg text-sm ${
                                                        link.active
                                                            ? "bg-blue-600 text-white"
                                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                    } ${
                                                        !link.url
                                                            ? "opacity-50 cursor-not-allowed"
                                                            : ""
                                                    }`}
                                                    dangerouslySetInnerHTML={{
                                                        __html: link.label,
                                                    }}
                                                />

                                            )
                                        )}

                                    </div>

                                )}

                        </div>

                    </div>

                </div>
            </div>

        </AuthenticatedLayout>
    );
}
