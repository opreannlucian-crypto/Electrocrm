import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";

export default function Show({ product }) {
    const stock = Number(product.stock_quantity ?? 0);
    const minimumStock = Number(product.minimum_stock ?? 0);
    const purchasePrice = Number(product.purchase_price ?? 0);
    const salePrice = Number(product.sale_price ?? 0);
    const vatRate = Number(product.vat_rate ?? 0);

    const formatMoney = (value) =>
        Number(value).toLocaleString("ro-RO", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

    let stockStatus = {
        label: "Disponibil",
        className: "bg-green-100 text-green-700",
    };

    if (stock <= 0) {
        stockStatus = {
            label: "Fără stoc",
            className: "bg-red-100 text-red-700",
        };
    } else if (stock <= minimumStock) {
        stockStatus = {
            label: "Stoc redus",
            className: "bg-orange-100 text-orange-700",
        };
    }

    return (
        <AuthenticatedLayout>
            <Head title={product.name} />

            <div className="py-8">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">

                    <div className="bg-white shadow-xl rounded-2xl overflow-hidden">

                        {/* HEADER */}

                        <div className="bg-slate-900 text-white px-8 py-7">

                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                                <div>

                                    <p className="text-sm text-slate-300">
                                        CRM • Gestiune • Produs
                                    </p>

                                    <h1 className="text-3xl font-bold mt-1">
                                        {product.name}
                                    </h1>

                                    <div className="flex flex-wrap gap-3 mt-3">

                                        {product.code && (
                                            <span className="text-sm bg-white/10 px-3 py-1 rounded-lg">
                                                Cod: {product.code}
                                            </span>
                                        )}

                                        {product.ean && (
                                            <span className="text-sm bg-white/10 px-3 py-1 rounded-lg">
                                                EAN: {product.ean}
                                            </span>
                                        )}

                                    </div>

                                </div>

                                <div className="flex gap-3">

                                    <Link
                                        href={route(
                                            "products.edit",
                                            product.id
                                        )}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold"
                                    >
                                        ✏️ Editează
                                    </Link>

                                    <Link
                                        href={route(
                                            "products.index"
                                        )}
                                        className="bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-xl"
                                    >
                                        ← Stoc
                                    </Link>

                                </div>

                            </div>

                        </div>


                        <div className="p-8">

                            {/* STATUS */}

                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

                                <div>

                                    <h2 className="text-xl font-bold text-gray-900">
                                        Situație produs
                                    </h2>

                                    <p className="text-gray-500 mt-1">
                                        Informații actuale despre produs și stoc
                                    </p>

                                </div>

                                <div className="flex gap-3">

                                    <span
                                        className={`px-4 py-2 rounded-full text-sm font-bold ${stockStatus.className}`}
                                    >
                                        {stockStatus.label}
                                    </span>

                                    <span
                                        className={`px-4 py-2 rounded-full text-sm font-bold ${
                                            product.active
                                                ? "bg-blue-100 text-blue-700"
                                                : "bg-gray-100 text-gray-600"
                                        }`}
                                    >
                                        {product.active
                                            ? "Activ"
                                            : "Inactiv"}
                                    </span>

                                </div>

                            </div>


                            {/* STOCK CARDS */}

                            <div className="grid md:grid-cols-3 gap-5 mb-10">

                                <div className="rounded-2xl border bg-gray-50 p-6">

                                    <p className="text-sm text-gray-500">
                                        Stoc actual
                                    </p>

                                    <p className="text-3xl font-bold text-gray-900 mt-2">
                                        {stock}
                                        <span className="text-lg ml-2 text-gray-500">
                                            {product.unit}
                                        </span>
                                    </p>

                                </div>


                                <div className="rounded-2xl border bg-gray-50 p-6">

                                    <p className="text-sm text-gray-500">
                                        Stoc minim
                                    </p>

                                    <p className="text-3xl font-bold text-gray-900 mt-2">
                                        {minimumStock}
                                        <span className="text-lg ml-2 text-gray-500">
                                            {product.unit}
                                        </span>
                                    </p>

                                </div>


                                <div className="rounded-2xl border bg-gray-50 p-6">

                                    <p className="text-sm text-gray-500">
                                        Unitate de măsură
                                    </p>

                                    <p className="text-3xl font-bold text-gray-900 mt-2 uppercase">
                                        {product.unit}
                                    </p>

                                </div>

                            </div>


                            {/* PRODUCT INFORMATION */}

                            <div className="border-t pt-8">

                                <h2 className="text-xl font-bold text-gray-900">
                                    Informații produs
                                </h2>

                                <div className="grid md:grid-cols-2 gap-x-10 gap-y-6 mt-6">

                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Denumire
                                        </p>

                                        <p className="font-semibold text-gray-900 mt-1">
                                            {product.name}
                                        </p>
                                    </div>


                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Categorie
                                        </p>

                                        <p className="font-semibold text-gray-900 mt-1">
                                            {product.category || "—"}
                                        </p>
                                    </div>


                                    <div>
                                        <p className="text-sm text-gray-500">
                                            Cod produs
                                        </p>

                                        <p className="font-semibold text-gray-900 mt-1">
                                            {product.code || "—"}
                                        </p>
                                    </div>


                                    <div>
                                        <p className="text-sm text-gray-500">
                                            EAN
                                        </p>

                                        <p className="font-semibold text-gray-900 mt-1">
                                            {product.ean || "—"}
                                        </p>
                                    </div>

                                </div>

                            </div>


                            {/* PRICES */}

                            <div className="border-t mt-10 pt-8">

                                <h2 className="text-xl font-bold text-gray-900">
                                    Prețuri
                                </h2>

                                <div className="grid md:grid-cols-3 gap-5 mt-6">

                                    <div className="rounded-2xl border p-6">

                                        <p className="text-sm text-gray-500">
                                            Preț achiziție
                                        </p>

                                        <p className="text-2xl font-bold text-gray-900 mt-2">
                                            {formatMoney(purchasePrice)} lei
                                        </p>

                                    </div>


                                    <div className="rounded-2xl border p-6">

                                        <p className="text-sm text-gray-500">
                                            Preț vânzare
                                        </p>

                                        <p className="text-2xl font-bold text-blue-600 mt-2">
                                            {formatMoney(salePrice)} lei
                                        </p>

                                    </div>


                                    <div className="rounded-2xl border p-6">

                                        <p className="text-sm text-gray-500">
                                            TVA
                                        </p>

                                        <p className="text-2xl font-bold text-gray-900 mt-2">
                                            {formatMoney(vatRate)}%
                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* NOTES */}

                            <div className="border-t mt-10 pt-8">

                                <h2 className="text-xl font-bold text-gray-900">
                                    Observații
                                </h2>

                                <div className="mt-5 bg-gray-50 rounded-2xl border p-6">

                                    {product.notes ? (
                                        <p className="text-gray-700 whitespace-pre-line">
                                            {product.notes}
                                        </p>
                                    ) : (
                                        <p className="text-gray-400">
                                            Nu există observații pentru acest produs.
                                        </p>
                                    )}

                                </div>

                            </div>


                            {/* ACTIONS */}

                            <div className="border-t mt-10 pt-8 flex flex-wrap gap-3">

                                <Link
                                    href={route(
                                        "products.edit",
                                        product.id
                                    )}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-xl font-semibold"
                                >
                                    ✏️ Editează produsul
                                </Link>

                                <Link
                                    href={route(
                                        "products.index"
                                    )}
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-7 py-3 rounded-xl"
                                >
                                    ⬅ Înapoi la stoc
                                </Link>

                            </div>

                        </div>

                    </div>

                </div>
            </div>

        </AuthenticatedLayout>
    );
}