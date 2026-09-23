import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";

export default function Show({ movement }) {
    const product = movement?.product || null;
    const workOrder = movement?.work_order || null;
    const user = movement?.user || null;

    const getTypeLabel = (type) => {
        switch (type) {
            case "in":
                return "Intrare";

            case "out":
                return "Iesire";

            case "adjustment":
                return "Ajustare";

            default:
                return type || "-";
        }
    };

    const getTypeClass = (type) => {
        switch (type) {
            case "in":
                return "bg-green-100 text-green-700";

            case "out":
                return "bg-red-100 text-red-700";

            case "adjustment":
                return "bg-yellow-100 text-yellow-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case "in":
                return "↓";

            case "out":
                return "↑";

            case "adjustment":
                return "↔";

            default:
                return "•";
        }
    };

    const formatNumber = (value) => {
        if (value === null || value === undefined || value === "") {
            return "-";
        }

        return Number(value).toLocaleString("ro-RO", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const formatPrice = (value) => {
        if (value === null || value === undefined || value === "") {
            return "-";
        }

        return `${Number(value).toLocaleString("ro-RO", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })} lei`;
    };

    const formatDate = (value) => {
        if (!value) {
            return "-";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleString("ro-RO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const deleteMovement = () => {
        if (
            !window.confirm(
                `Sigur vrei sa stergi miscarea de stoc #${movement.id}? Aceasta actiune va recalcula stocul produsului.`
            )
        ) {
            return;
        }

        router.delete(
            route("stock-movements.destroy", movement.id),
            {
                onSuccess: () => {
                    router.visit(route("stock-movements.index"));
                },
            }
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-semibold leading-tight text-gray-800">
                                Miscare de stoc #{movement.id}
                            </h2>

                            <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${getTypeClass(
                                    movement.type
                                )}`}
                            >
                                <span className="text-sm">
                                    {getTypeIcon(movement.type)}
                                </span>

                                {getTypeLabel(movement.type)}
                            </span>
                        </div>

                        <p className="mt-1 text-sm text-gray-500">
                            Detaliile complete ale miscarii de stoc.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={route("stock-movements.index")}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                        >
                            Inapoi
                        </Link>

                        <button
                            type="button"
                            onClick={deleteMovement}
                            className="rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50"
                        >
                            Sterge
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Miscare stoc #${movement.id}`} />

            <div className="py-6">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

                    {/* REZUMAT */}

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Stoc inainte
                            </div>

                            <div className="mt-2 text-2xl font-bold text-gray-800">
                                {formatNumber(movement.stock_before)}
                            </div>

                            <div className="mt-1 text-sm text-gray-500">
                                {product?.unit || ""}
                            </div>
                        </div>

                        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
                            <div className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                                Cantitate miscare
                            </div>

                            <div className="mt-2 text-2xl font-bold text-blue-700">
                                {formatNumber(movement.quantity)}
                            </div>

                            <div className="mt-1 text-sm text-blue-600">
                                {getTypeLabel(movement.type)}
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Stoc dupa
                            </div>

                            <div className="mt-2 text-2xl font-bold text-gray-800">
                                {formatNumber(movement.stock_after)}
                            </div>

                            <div className="mt-1 text-sm text-gray-500">
                                {product?.unit || ""}
                            </div>
                        </div>
                    </div>

                    {/* PRODUS */}

                    <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 px-6 py-5">
                            <h3 className="text-base font-semibold text-gray-800">
                                Produs
                            </h3>
                        </div>

                        <div className="p-6">
                            {product ? (
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Denumire
                                        </div>

                                        <div className="mt-1 text-sm font-semibold text-gray-800">
                                            {product.name || "-"}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Cod produs
                                        </div>

                                        <div className="mt-1 text-sm text-gray-700">
                                            {product.code || "-"}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            EAN
                                        </div>

                                        <div className="mt-1 text-sm text-gray-700">
                                            {product.ean || "-"}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Unitate
                                        </div>

                                        <div className="mt-1 text-sm text-gray-700">
                                            {product.unit || "-"}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500">
                                    Produsul nu mai exista.
                                </div>
                            )}

                            {product && (
                                <div className="mt-5">
                                    <Link
                                        href={route(
                                            "products.show",
                                            product.id
                                        )}
                                        className="inline-flex rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                                    >
                                        Vezi produsul
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* DETALII MISCARE */}

                    <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 px-6 py-5">
                            <h3 className="text-base font-semibold text-gray-800">
                                Detalii miscare
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 gap-x-8 gap-y-5 p-6 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Tip
                                </div>

                                <div className="mt-1">
                                    <span
                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getTypeClass(
                                            movement.type
                                        )}`}
                                    >
                                        {getTypeLabel(movement.type)}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Cantitate
                                </div>

                                <div className="mt-1 text-sm font-semibold text-gray-800">
                                    {formatNumber(movement.quantity)}{" "}
                                    {product?.unit || ""}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Pret unitar
                                </div>

                                <div className="mt-1 text-sm text-gray-700">
                                    {formatPrice(movement.unit_price)}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Stoc inainte
                                </div>

                                <div className="mt-1 text-sm text-gray-700">
                                    {formatNumber(movement.stock_before)}{" "}
                                    {product?.unit || ""}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Stoc dupa
                                </div>

                                <div className="mt-1 text-sm font-semibold text-gray-800">
                                    {formatNumber(movement.stock_after)}{" "}
                                    {product?.unit || ""}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Data
                                </div>

                                <div className="mt-1 text-sm text-gray-700">
                                    {formatDate(movement.created_at)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* DOCUMENT */}

                    <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 px-6 py-5">
                            <h3 className="text-base font-semibold text-gray-800">
                                Document si referinta
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 gap-x-8 gap-y-5 p-6 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Numar document
                                </div>

                                <div className="mt-1 text-sm text-gray-700">
                                    {movement.document_number || "-"}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Tip referinta
                                </div>

                                <div className="mt-1 text-sm text-gray-700">
                                    {movement.reference_type || "-"}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    ID referinta
                                </div>

                                <div className="mt-1 text-sm text-gray-700">
                                    {movement.reference_id || "-"}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Motiv
                                </div>

                                <div className="mt-1 text-sm text-gray-700">
                                    {movement.reason || "-"}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    ID lucrare
                                </div>

                                <div className="mt-1 text-sm text-gray-700">
                                    {movement.work_order_id || "-"}
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    ID miscare
                                </div>

                                <div className="mt-1 text-sm text-gray-700">
                                    #{movement.id}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* LUCRARE */}

                    {workOrder && (
                        <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-200 px-6 py-5">
                                <h3 className="text-base font-semibold text-gray-800">
                                    Lucrare asociata
                                </h3>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Numar
                                        </div>

                                        <div className="mt-1 text-sm font-semibold text-gray-800">
                                            {workOrder.number ||
                                                `#${workOrder.id}`}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Tip
                                        </div>

                                        <div className="mt-1 text-sm text-gray-700">
                                            {workOrder.type || "-"}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Status
                                        </div>

                                        <div className="mt-1 text-sm text-gray-700">
                                            {workOrder.status || "-"}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Adresa
                                        </div>

                                        <div className="mt-1 text-sm text-gray-700">
                                            {workOrder.address || "-"}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5">
                                    <Link
                                        href={route(
                                            "work-orders.show",
                                            workOrder.id
                                        )}
                                        className="inline-flex rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                                    >
                                        Vezi lucrarea
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* UTILIZATOR SI OBSERVATII */}

                    <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">

                        {/* UTILIZATOR */}

                        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-200 px-6 py-5">
                                <h3 className="text-base font-semibold text-gray-800">
                                    Inregistrat de
                                </h3>
                            </div>

                            <div className="p-6">
                                {user ? (
                                    <div>
                                        <div className="text-sm font-semibold text-gray-800">
                                            {user.name || "-"}
                                        </div>

                                        {user.email && (
                                            <div className="mt-1 text-sm text-gray-500">
                                                {user.email}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-500">
                                        Utilizator necunoscut
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* OBSERVATII */}

                        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-200 px-6 py-5">
                                <h3 className="text-base font-semibold text-gray-800">
                                    Observatii
                                </h3>
                            </div>

                            <div className="p-6">
                                <div className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                                    {movement.notes || "Nu exista observatii."}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FOOTER */}

                    <div className="mt-6 flex items-center justify-between rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
                        <Link
                            href={route("stock-movements.index")}
                            className="text-sm font-semibold text-gray-600 transition hover:text-gray-900"
                        >
                            ← Inapoi la miscari de stoc
                        </Link>

                        <button
                            type="button"
                            onClick={deleteMovement}
                            className="text-sm font-semibold text-red-600 transition hover:text-red-800"
                        >
                            Sterge miscarea
                        </button>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}