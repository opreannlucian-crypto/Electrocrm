import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Edit({ product }) {
    const { data, setData, put, processing, errors } = useForm({
        name: product.name ?? "",
        code: product.code ?? "",
        ean: product.ean ?? "",
        category: product.category ?? "",
        unit: product.unit ?? "buc",
        stock_quantity: product.stock_quantity ?? 0,
        purchase_price: product.purchase_price ?? 0,
        sale_price: product.sale_price ?? 0,
        vat_rate: product.vat_rate ?? 21,
        minimum_stock: product.minimum_stock ?? 0,
        active: product.active ?? true,
        notes: product.notes ?? "",
    });

    function submit(event) {
        event.preventDefault();

        put(
            route(
                "products.update",
                product.id
            )
        );
    }

    return (
        <AuthenticatedLayout>
            <Head title={`Editează ${product.name}`} />

            <div className="py-8">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">

                    <div className="bg-white shadow-xl rounded-2xl overflow-hidden">

                        <div className="bg-slate-900 text-white px-8 py-7">

                            <p className="text-sm text-slate-300">
                                CRM • Gestiune
                            </p>

                            <h1 className="text-3xl font-bold mt-1">
                                Editează produs
                            </h1>

                            <p className="text-slate-300 mt-2">
                                Modifică informațiile produsului
                            </p>

                        </div>

                        <form onSubmit={submit}>

                            <div className="p-8">

                                <div className="mb-8">

                                    <h2 className="text-lg font-bold text-gray-900">
                                        Identificare produs
                                    </h2>

                                </div>

                                <div className="grid md:grid-cols-2 gap-6">

                                    <div className="md:col-span-2">

                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Denumire produs *
                                        </label>

                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData(
                                                    "name",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full rounded-xl border-gray-300 shadow-sm"
                                        />

                                        {errors.name && (
                                            <p className="text-red-600 text-sm mt-1">
                                                {errors.name}
                                            </p>
                                        )}

                                    </div>

                                    <div>

                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Cod produs
                                        </label>

                                        <input
                                            type="text"
                                            value={data.code}
                                            onChange={(e) =>
                                                setData(
                                                    "code",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full rounded-xl border-gray-300 shadow-sm"
                                        />

                                        {errors.code && (
                                            <p className="text-red-600 text-sm mt-1">
                                                {errors.code}
                                            </p>
                                        )}

                                    </div>

                                    <div>

                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            EAN
                                        </label>

                                        <input
                                            type="text"
                                            value={data.ean}
                                            onChange={(e) =>
                                                setData(
                                                    "ean",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full rounded-xl border-gray-300 shadow-sm"
                                        />

                                        {errors.ean && (
                                            <p className="text-red-600 text-sm mt-1">
                                                {errors.ean}
                                            </p>
                                        )}

                                    </div>

                                    <div>

                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Categorie
                                        </label>

                                        <input
                                            type="text"
                                            value={data.category}
                                            onChange={(e) =>
                                                setData(
                                                    "category",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full rounded-xl border-gray-300 shadow-sm"
                                        />

                                    </div>

                                    <div>

                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Unitate de măsură *
                                        </label>

                                        <select
                                            value={data.unit}
                                            onChange={(e) =>
                                                setData(
                                                    "unit",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full rounded-xl border-gray-300 shadow-sm"
                                        >

                                            <option value="buc">
                                                Bucată (buc)
                                            </option>

                                            <option value="m">
                                                Metru (m)
                                            </option>

                                            <option value="kg">
                                                Kilogram (kg)
                                            </option>

                                            <option value="l">
                                                Litru (l)
                                            </option>

                                            <option value="set">
                                                Set
                                            </option>

                                            <option value="ora">
                                                Oră
                                            </option>

                                            <option value="mp">
                                                Metru pătrat (mp)
                                            </option>

                                            <option value="ml">
                                                Metru liniar (ml)
                                            </option>

                                        </select>

                                    </div>

                                </div>


                                <div className="border-t mt-10 pt-8">

                                    <h2 className="text-lg font-bold text-gray-900">
                                        Gestionare stoc
                                    </h2>

                                    <div className="grid md:grid-cols-2 gap-6 mt-6">

                                        <div>

                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Cantitate în stoc *
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    data.stock_quantity
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        "stock_quantity",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full rounded-xl border-gray-300 shadow-sm"
                                            />

                                        </div>

                                        <div>

                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Stoc minim *
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    data.minimum_stock
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        "minimum_stock",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full rounded-xl border-gray-300 shadow-sm"
                                            />

                                        </div>

                                    </div>

                                </div>


                                <div className="border-t mt-10 pt-8">

                                    <h2 className="text-lg font-bold text-gray-900">
                                        Prețuri
                                    </h2>

                                    <div className="grid md:grid-cols-3 gap-6 mt-6">

                                        <div>

                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Preț achiziție *
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    data.purchase_price
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        "purchase_price",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full rounded-xl border-gray-300 shadow-sm"
                                            />

                                        </div>

                                        <div>

                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Preț vânzare *
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={
                                                    data.sale_price
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        "sale_price",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full rounded-xl border-gray-300 shadow-sm"
                                            />

                                        </div>

                                        <div>

                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                TVA *
                                            </label>

                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.01"
                                                value={
                                                    data.vat_rate
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        "vat_rate",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full rounded-xl border-gray-300 shadow-sm"
                                            />

                                        </div>

                                    </div>

                                </div>


                                <div className="border-t mt-10 pt-8">

                                    <h2 className="text-lg font-bold text-gray-900">
                                        Status
                                    </h2>

                                    <label className="flex items-center gap-3 mt-5 cursor-pointer">

                                        <input
                                            type="checkbox"
                                            checked={data.active}
                                            onChange={(e) =>
                                                setData(
                                                    "active",
                                                    e.target.checked
                                                )
                                            }
                                            className="rounded border-gray-300 text-blue-600"
                                        />

                                        <span className="text-sm font-medium text-gray-700">
                                            Produs activ și disponibil pentru ofertare
                                        </span>

                                    </label>

                                </div>


                                <div className="border-t mt-10 pt-8">

                                    <h2 className="text-lg font-bold text-gray-900 mb-4">
                                        Observații
                                    </h2>

                                    <textarea
                                        rows="4"
                                        value={data.notes}
                                        onChange={(e) =>
                                            setData(
                                                "notes",
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border-gray-300 shadow-sm"
                                    />

                                </div>


                                <div className="flex flex-wrap gap-3 mt-10">

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-7 py-3 rounded-xl font-semibold"
                                    >
                                        {processing
                                            ? "Se salvează..."
                                            : "💾 Salvează modificările"}
                                    </button>

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

                        </form>

                    </div>

                </div>
            </div>

        </AuthenticatedLayout>
    );
}