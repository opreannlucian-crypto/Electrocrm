import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";

export default function Index({ movements = [] }) {
    const deleteMovement = (id) => {
        if (
            !confirm(
                "Esti sigur ca vrei sa stergi aceasta miscare de stoc?"
            )
        ) {
            return;
        }

        router.delete(route("stock-movements.destroy", id), {
            preserveScroll: true,
        });
    };

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        const value = new Date(date);

        if (Number.isNaN(value.getTime())) {
            return date;
        }

        return value.toLocaleString("ro-RO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatNumber = (value) => {
        const number = Number(value ?? 0);

        return number.toLocaleString("ro-RO", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const formatPrice = (value) => {
        if (value === null || value === undefined || value === "") {
            return "-";
        }

        return `${formatNumber(value)} lei`;
    };

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

    const getTypeClasses = (type) => {
        switch (type) {
            case "in":
                return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";

            case "out":
                return "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200";

            case "adjustment":
                return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";

            default:
                return "bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-200";
        }
    };

    const getProductName = (movement) => {
        return (
            movement.product?.name ||
            movement.product_name ||
            "-"
        );
    };

    const getProductCode = (movement) => {
        return movement.product?.code || movement.product_code || "";
    };

    const getWorkOrder = (movement) => {
        if (movement.work_order?.number) {
            return movement.work_order.number;
        }

        if (movement.workOrder?.number) {
            return movement.workOrder.number;
        }

        if (movement.work_order_id) {
            return `#${movement.work_order_id}`;
        }

        return "-";
    };

    const getUserName = (movement) => {
        if (movement.user?.name) {
            return movement.user.name;
        }

        if (movement.user_name) {
            return movement.user_name;
        }

        return "-";
    };

    const movementList = Array.isArray(movements)
        ? movements
        : movements?.data || [];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Miscari de stoc
                    </h2>

                    <p className="text-sm text-gray-500">
                        Istoricul tuturor operatiunilor de stoc
                    </p>
                </div>
            }
        >
            <Head title="Miscari de stoc" />

            <div className="py-8">
                <div className="mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        {/* HEADER */}
                        <div className="flex flex-col gap-4 border-b border-gray-200 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Istoric miscari
                                </h1>

                                <p className="mt-1 text-sm text-gray-500">
                                    {movementList.length}{" "}
                                    {movementList.length === 1
                                        ? "miscare inregistrata"
                                        : "miscari inregistrate"}
                                </p>
                            </div>

                            <Link
                                href={route(
                                    "stock-movements.create"
                                )}
                                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                + Miscare noua
                            </Link>
                        </div>

                        {/* TABLE */}
                        {movementList.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-[1500px] w-full text-left text-sm">
                                    <thead className="border-b border-gray-200 bg-gray-50">
                                        <tr>
                                            <th className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                                                Data
                                            </th>

                                            <th className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                                                Produs
                                            </th>

                                            <th className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                                                Tip
                                            </th>

                                            <th className="whitespace-nowrap px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                                                Cantitate
                                            </th>

                                            <th className="whitespace-nowrap px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                                                Stoc inainte
                                            </th>

                                            <th className="whitespace-nowrap px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                                                Stoc dupa
                                            </th>

                                            <th className="whitespace-nowrap px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                                                Pret
                                            </th>

                                            <th className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                                                Document
                                            </th>

                                            <th className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                                                Lucrare
                                            </th>

                                            <th className="whitespace-nowrap px-5 py-4 text-xs font-bold uppercase tracking-wide text-gray-500">
                                                Utilizator
                                            </th>

                                            <th className="whitespace-nowrap px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                                                Actiuni
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-gray-100">
                                        {movementList.map(
                                            (movement) => (
                                                <tr
                                                    key={movement.id}
                                                    className="transition hover:bg-gray-50"
                                                >
                                                    {/* DATA */}
                                                    <td className="whitespace-nowrap px-5 py-4 text-gray-700">
                                                        {formatDate(
                                                            movement.created_at
                                                        )}
                                                    </td>

                                                    {/* PRODUS */}
                                                    <td className="px-5 py-4">
                                                        <div className="min-w-[180px]">
                                                            <div className="font-semibold text-gray-900">
                                                                {getProductName(
                                                                    movement
                                                                )}
                                                            </div>

                                                            {getProductCode(
                                                                movement
                                                            ) && (
                                                                <div className="mt-0.5 text-xs text-gray-500">
                                                                    Cod:{" "}
                                                                    {
                                                                        getProductCode(
                                                                            movement
                                                                        )
                                                                    }
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* TIP */}
                                                    <td className="whitespace-nowrap px-5 py-4">
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${getTypeClasses(
                                                                movement.type
                                                            )}`}
                                                        >
                                                            {getTypeLabel(
                                                                movement.type
                                                            )}
                                                        </span>
                                                    </td>

                                                    {/* CANTITATE */}
                                                    <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-gray-900">
                                                        {formatNumber(
                                                            movement.quantity
                                                        )}{" "}
                                                        <span className="text-xs font-medium text-gray-500">
                                                            {movement.product
                                                                ?.unit ||
                                                                movement.unit ||
                                                                "buc"}
                                                        </span>
                                                    </td>

                                                    {/* STOC INAINTE */}
                                                    <td className="whitespace-nowrap px-5 py-4 text-right text-gray-600">
                                                        {formatNumber(
                                                            movement.stock_before
                                                        )}
                                                    </td>

                                                    {/* STOC DUPA */}
                                                    <td className="whitespace-nowrap px-5 py-4 text-right font-bold text-gray-900">
                                                        {formatNumber(
                                                            movement.stock_after
                                                        )}
                                                    </td>

                                                    {/* PRET */}
                                                    <td className="whitespace-nowrap px-5 py-4 text-right font-medium text-gray-700">
                                                        {formatPrice(
                                                            movement.unit_price
                                                        )}
                                                    </td>

                                                    {/* DOCUMENT */}
                                                    <td className="whitespace-nowrap px-5 py-4 text-gray-700">
                                                        {movement.document_number ||
                                                            "-"}
                                                    </td>

                                                    {/* LUCRARE */}
                                                    <td className="whitespace-nowrap px-5 py-4 text-gray-700">
                                                        {getWorkOrder(
                                                            movement
                                                        )}
                                                    </td>

                                                    {/* UTILIZATOR */}
                                                    <td className="whitespace-nowrap px-5 py-4 text-gray-700">
                                                        {getUserName(
                                                            movement
                                                        )}
                                                    </td>

                                                    {/* ACTIUNI */}
                                                    <td className="whitespace-nowrap px-5 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Link
                                                                href={route(
                                                                    "stock-movements.show",
                                                                    movement.id
                                                                )}
                                                                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 hover:text-indigo-600"
                                                            >
                                                                Vezi
                                                            </Link>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    deleteMovement(
                                                                        movement.id
                                                                    )
                                                                }
                                                                className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                                                            >
                                                                Sterge
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="px-6 py-16 text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl">
                                    📦
                                </div>

                                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                                    Nu exista miscari de stoc
                                </h3>

                                <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                                    Nu exista momentan nicio miscare
                                    inregistrata. Poti adauga prima miscare
                                    folosind butonul de mai jos.
                                </p>

                                <Link
                                    href={route(
                                        "stock-movements.create"
                                    )}
                                    className="mt-6 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                                >
                                    + Adauga prima miscare
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}