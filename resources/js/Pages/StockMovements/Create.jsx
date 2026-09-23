import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useMemo } from "react";

export default function Create({ products = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        product_id: "",
        type: "in",
        quantity: "",
        unit_price: "",
        reference_type: "",
        reference_id: "",
        document_number: "",
        reason: "",
        work_order_id: "",
        notes: "",
    });

    const selectedProduct = useMemo(() => {
        if (!data.product_id) {
            return null;
        }

        return (
            products.find(
                (product) => String(product.id) === String(data.product_id)
            ) || null
        );
    }, [data.product_id, products]);

    const submit = (event) => {
        event.preventDefault();

        post(route("stock-movements.store"));
    };

    const formatNumber = (value) => {
        if (value === null || value === undefined || value === "") {
            return "0.00";
        }

        return Number(value).toLocaleString("ro-RO", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const getTypeDescription = () => {
        switch (data.type) {
            case "in":
                return "Adauga cantitatea introdusa in stoc.";

            case "out":
                return "Scade cantitatea din stoc. Stocul nu poate deveni negativ.";

            case "adjustment":
                return "Seteaza stocul produsului la cantitatea introdusa.";

            default:
                return "";
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Miscare noua de stoc
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Inregistreaza o intrare, iesire sau ajustare de stoc.
                    </p>
                </div>
            }
        >
            <Head title="Miscare noua de stoc" />

            <div className="py-6">
                <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <form onSubmit={submit}>

                        {/* PRODUS SI TIP */}

                        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-200 px-6 py-5">
                                <h3 className="text-base font-semibold text-gray-800">
                                    Date miscare
                                </h3>

                                <p className="mt-1 text-sm text-gray-500">
                                    Selecteaza produsul si tipul miscarii.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">

                                {/* PRODUS */}

                                <div className="md:col-span-2">
                                    <label
                                        htmlFor="product_id"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        Produs *
                                    </label>

                                    <select
                                        id="product_id"
                                        value={data.product_id}
                                        onChange={(event) =>
                                            setData(
                                                "product_id",
                                                event.target.value
                                            )
                                        }
                                        className={`w-full rounded-lg border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                            errors.product_id
                                                ? "border-red-500"
                                                : ""
                                        }`}
                                    >
                                        <option value="">
                                            Selecteaza produsul
                                        </option>

                                        {products.map((product) => (
                                            <option
                                                key={product.id}
                                                value={product.id}
                                            >
                                                {product.name}
                                                {product.code
                                                    ? ` - ${product.code}`
                                                    : ""}
                                            </option>
                                        ))}
                                    </select>

                                    {errors.product_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.product_id}
                                        </p>
                                    )}
                                </div>

                                {/* INFORMATII PRODUS */}

                                {selectedProduct && (
                                    <div className="md:col-span-2 rounded-lg bg-gray-50 p-4">
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                            <div>
                                                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                                    Cod
                                                </div>

                                                <div className="mt-1 text-sm font-semibold text-gray-800">
                                                    {selectedProduct.code ||
                                                        "-"}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                                    EAN
                                                </div>

                                                <div className="mt-1 text-sm font-semibold text-gray-800">
                                                    {selectedProduct.ean || "-"}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                                    Stoc actual
                                                </div>

                                                <div className="mt-1 text-lg font-bold text-blue-600">
                                                    {formatNumber(
                                                        selectedProduct.stock_quantity
                                                    )}{" "}
                                                    {selectedProduct.unit || ""}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* TIP */}

                                <div>
                                    <label
                                        htmlFor="type"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        Tip miscare *
                                    </label>

                                    <select
                                        id="type"
                                        value={data.type}
                                        onChange={(event) =>
                                            setData(
                                                "type",
                                                event.target.value
                                            )
                                        }
                                        className={`w-full rounded-lg border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                            errors.type
                                                ? "border-red-500"
                                                : ""
                                        }`}
                                    >
                                        <option value="in">
                                            Intrare
                                        </option>

                                        <option value="out">
                                            Iesire
                                        </option>

                                        <option value="adjustment">
                                            Ajustare
                                        </option>
                                    </select>

                                    <p className="mt-1.5 text-xs text-gray-500">
                                        {getTypeDescription()}
                                    </p>

                                    {errors.type && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.type}
                                        </p>
                                    )}
                                </div>

                                {/* CANTITATE */}

                                <div>
                                    <label
                                        htmlFor="quantity"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        {data.type === "adjustment"
                                            ? "Noul stoc *"
                                            : "Cantitate *"}
                                    </label>

                                    <div className="relative">
                                        <input
                                            id="quantity"
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            value={data.quantity}
                                            onChange={(event) =>
                                                setData(
                                                    "quantity",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="0.00"
                                            className={`w-full rounded-lg border-gray-300 px-3 py-2.5 pr-16 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                                errors.quantity
                                                    ? "border-red-500"
                                                    : ""
                                            }`}
                                        />

                                        {selectedProduct?.unit && (
                                            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-gray-400">
                                                {selectedProduct.unit}
                                            </span>
                                        )}
                                    </div>

                                    {errors.quantity && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.quantity}
                                        </p>
                                    )}
                                </div>

                                {/* PRET */}

                                <div>
                                    <label
                                        htmlFor="unit_price"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        Pret unitar
                                    </label>

                                    <div className="relative">
                                        <input
                                            id="unit_price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={data.unit_price}
                                            onChange={(event) =>
                                                setData(
                                                    "unit_price",
                                                    event.target.value
                                                )
                                            }
                                            placeholder="0.00"
                                            className={`w-full rounded-lg border-gray-300 px-3 py-2.5 pr-12 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                                errors.unit_price
                                                    ? "border-red-500"
                                                    : ""
                                            }`}
                                        />

                                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-gray-400">
                                            lei
                                        </span>
                                    </div>

                                    {errors.unit_price && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.unit_price}
                                        </p>
                                    )}
                                </div>

                                {/* NUMAR DOCUMENT */}

                                <div>
                                    <label
                                        htmlFor="document_number"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        Numar document
                                    </label>

                                    <input
                                        id="document_number"
                                        type="text"
                                        value={data.document_number}
                                        onChange={(event) =>
                                            setData(
                                                "document_number",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Ex: NIR-0001"
                                        className={`w-full rounded-lg border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                            errors.document_number
                                                ? "border-red-500"
                                                : ""
                                        }`}
                                    />

                                    {errors.document_number && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.document_number}
                                        </p>
                                    )}
                                </div>

                                {/* MOTIV */}

                                <div>
                                    <label
                                        htmlFor="reason"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        Motiv
                                    </label>

                                    <input
                                        id="reason"
                                        type="text"
                                        value={data.reason}
                                        onChange={(event) =>
                                            setData(
                                                "reason",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Ex: Receptie marfa"
                                        className={`w-full rounded-lg border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                            errors.reason
                                                ? "border-red-500"
                                                : ""
                                        }`}
                                    />

                                    {errors.reason && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.reason}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* REFERINTA */}

                        <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-200 px-6 py-5">
                                <h3 className="text-base font-semibold text-gray-800">
                                    Referinta
                                </h3>

                                <p className="mt-1 text-sm text-gray-500">
                                    Optional, pentru legarea miscarii de un
                                    document sau o lucrare.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">

                                {/* TIP REFERINTA */}

                                <div>
                                    <label
                                        htmlFor="reference_type"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        Tip referinta
                                    </label>

                                    <input
                                        id="reference_type"
                                        type="text"
                                        value={data.reference_type}
                                        onChange={(event) =>
                                            setData(
                                                "reference_type",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Ex: factura, nir, aviz"
                                        className={`w-full rounded-lg border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                            errors.reference_type
                                                ? "border-red-500"
                                                : ""
                                        }`}
                                    />

                                    {errors.reference_type && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.reference_type}
                                        </p>
                                    )}
                                </div>

                                {/* ID REFERINTA */}

                                <div>
                                    <label
                                        htmlFor="reference_id"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        ID referinta
                                    </label>

                                    <input
                                        id="reference_id"
                                        type="number"
                                        min="1"
                                        value={data.reference_id}
                                        onChange={(event) =>
                                            setData(
                                                "reference_id",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Optional"
                                        className={`w-full rounded-lg border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                            errors.reference_id
                                                ? "border-red-500"
                                                : ""
                                        }`}
                                    />

                                    {errors.reference_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.reference_id}
                                        </p>
                                    )}
                                </div>

                                {/* WORK ORDER */}

                                <div>
                                    <label
                                        htmlFor="work_order_id"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        ID lucrare
                                    </label>

                                    <input
                                        id="work_order_id"
                                        type="number"
                                        min="1"
                                        value={data.work_order_id}
                                        onChange={(event) =>
                                            setData(
                                                "work_order_id",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Optional"
                                        className={`w-full rounded-lg border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                            errors.work_order_id
                                                ? "border-red-500"
                                                : ""
                                        }`}
                                    />

                                    {errors.work_order_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.work_order_id}
                                        </p>
                                    )}
                                </div>

                                {/* OBSERVATII */}

                                <div className="md:col-span-2">
                                    <label
                                        htmlFor="notes"
                                        className="mb-1.5 block text-sm font-medium text-gray-700"
                                    >
                                        Observatii
                                    </label>

                                    <textarea
                                        id="notes"
                                        rows="4"
                                        value={data.notes}
                                        onChange={(event) =>
                                            setData(
                                                "notes",
                                                event.target.value
                                            )
                                        }
                                        placeholder="Observatii despre miscarea de stoc..."
                                        className={`w-full rounded-lg border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                            errors.notes
                                                ? "border-red-500"
                                                : ""
                                        }`}
                                    />

                                    {errors.notes && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.notes}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* PREVIZUALIZARE */}

                        {selectedProduct && data.quantity && (
                            <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
                                <h3 className="text-sm font-semibold text-blue-900">
                                    Previzualizare stoc
                                </h3>

                                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                                    <span className="font-medium text-gray-700">
                                        Stoc actual:
                                    </span>

                                    <span className="font-bold text-gray-900">
                                        {formatNumber(
                                            selectedProduct.stock_quantity
                                        )}{" "}
                                        {selectedProduct.unit || ""}
                                    </span>

                                    <span className="text-gray-400">
                                        →
                                    </span>

                                    <span className="font-bold text-blue-700">
                                        {formatNumber(
                                            data.type === "in"
                                                ? Number(
                                                      selectedProduct.stock_quantity
                                                  ) +
                                                      Number(data.quantity)
                                                : data.type === "out"
                                                  ? Number(
                                                        selectedProduct.stock_quantity
                                                    ) -
                                                    Number(data.quantity)
                                                  : Number(data.quantity)
                                        )}{" "}
                                        {selectedProduct.unit || ""}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* ACTIUNI */}

                        <div className="mt-6 flex items-center justify-end gap-3">
                            <Link
                                href={route("stock-movements.index")}
                                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                            >
                                Anuleaza
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing
                                    ? "Se salveaza..."
                                    : "Salveaza miscarea"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}