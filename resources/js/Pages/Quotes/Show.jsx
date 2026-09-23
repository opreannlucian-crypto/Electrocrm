import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";

export default function Show({ quote }) {
    const isOffer = quote?.type === "oferta";
    const isDeviz = quote?.type === "deviz";

    const statusLabels = {
        draft: "Ciornă",
        sent: "Trimisă",
        accepted: "Acceptată",
        rejected: "Respinsă",
        finalizat: "Finalizat",
    };

    const statusStyles = {
        draft: "bg-slate-100 text-slate-700 border-slate-200",
        sent: "bg-blue-100 text-blue-700 border-blue-200",
        accepted: "bg-emerald-100 text-emerald-700 border-emerald-200",
        rejected: "bg-red-100 text-red-700 border-red-200",
        finalizat: "bg-emerald-100 text-emerald-700 border-emerald-200",
    };

    const statusLabel =
        statusLabels[quote?.status] || quote?.status || "-";

    const statusClass =
        statusStyles[quote?.status] ||
        "bg-slate-100 text-slate-700 border-slate-200";

    const items = quote?.items || [];

    const materialItems = items.filter(
        (item) => item.type === "material"
    );

    const laborItems = items.filter(
        (item) => item.type === "manopera"
    );

    function formatMoney(value) {
        return Number(value || 0).toLocaleString("ro-RO", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }

    function formatDate(value) {
        if (!value) {
            return "-";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleDateString("ro-RO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }

    function itemSubtotal(item) {
        const quantity = Number(item?.quantity || 0);
        const unitPrice = Number(item?.unit_price || 0);
        const discount = Number(item?.discount || 0);

        const subtotal = quantity * unitPrice;

        return subtotal - (subtotal * discount) / 100;
    }

    const materialsTotal = materialItems.reduce(
        (total, item) => total + itemSubtotal(item),
        0
    );

    const laborTotal = laborItems.reduce(
        (total, item) => total + itemSubtotal(item),
        0
    );

    const subtotal = materialsTotal + laborTotal;

    const generalDiscount =
        (subtotal * Number(quote?.discount || 0)) / 100;

    const taxable = subtotal - generalDiscount;

    const vat =
        (taxable * Number(quote?.vat_rate || 0)) / 100;

    const total = taxable + vat;

    function sendQuote() {
        router.post(
            route("quotes.send", quote.id),
            {},
            {
                preserveScroll: true,
            }
        );
    }

    function acceptQuote() {
        router.post(
            route("quotes.accept", quote.id),
            {},
            {
                preserveScroll: true,
            }
        );
    }

    function rejectQuote() {
        if (
            !window.confirm(
                "Sigur dorești să respingi această ofertă?"
            )
        ) {
            return;
        }

        router.post(
            route("quotes.reject", quote.id),
            {},
            {
                preserveScroll: true,
            }
        );
    }

    function finalizeDeviz() {
    if (
        !confirm(
            "Sigur dorești să finalizezi acest deviz?\n\nDupă finalizare, statusul devizului va fi «Finalizat»."
        )
    ) {
        return;
    }

    router.post(
        route(
            "quotes.finalize",
            quote.id
        ),
        {},
        {
            preserveScroll: true,
        }
    );
}

  
    function reopenQuote() {
        if (
            !window.confirm(
                isDeviz
                    ? "Sigur dorești să redeschizi acest deviz?"
                    : "Sigur dorești să redeschizi această ofertă?"
            )
        ) {
            return;
        }

        router.post(
            route("quotes.reopen", quote.id),
            {},
            {
                preserveScroll: true,
            }
        );
    }

    function createDeviz() {
        window.location.href = route(
            "quotes.create-deviz",
            {
                source_quote_id: quote.id,
            }
        );
    }

    function createWorkOrder() {
        if (!isOffer) {
            return;
        }

        if (quote.status !== "accepted") {
            return;
        }

        router.post(
            route(
                "quotes.create-work-order",
                quote.id
            ),
            {},
            {
                preserveScroll: true,
            }
        );
    }

    function deleteQuote() {
        const label = isDeviz
            ? "devizul"
            : "oferta";

        if (
            !window.confirm(
                `Sigur dorești să ștergi ${label}?`
            )
        ) {
            return;
        }

        router.delete(
            route("quotes.destroy", quote.id)
        );
    }

    return (
        <AuthenticatedLayout>
            <Head
                title={`${isDeviz ? "Deviz" : "Ofertă"} ${
                    quote?.number || ""
                }`}
            />

            <div className="min-h-screen bg-slate-50 py-8">
                <div className="max-w-[1450px] mx-auto px-4 sm:px-6 lg:px-8">

                    {/* HEADER */}

                    <div className="bg-slate-900 rounded-3xl shadow-xl overflow-hidden">
                        <div
                            className={`h-1.5 ${
                                isDeviz
                                    ? "bg-emerald-500"
                                    : "bg-blue-600"
                            }`}
                        />

                        <div className="px-6 sm:px-8 py-7">
                            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">

                                <div className="flex items-start gap-4">
                                    <div
                                        className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${
                                            isDeviz
                                                ? "bg-emerald-500/15 border border-emerald-400/20"
                                                : "bg-blue-500/15 border border-blue-400/20"
                                        }`}
                                    >
                                        {isDeviz ? "🧾" : "📄"}
                                    </div>

                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className="text-xs uppercase tracking-[0.2em] font-bold text-blue-300">
                                                ELECTRODEP
                                            </span>

                                            <span className="text-slate-600">
                                                /
                                            </span>

                                            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                                                {isDeviz
                                                    ? "Deviz"
                                                    : "Ofertă"}
                                            </span>
                                        </div>

                                        <h1 className="text-3xl sm:text-4xl font-bold text-white break-words">
                                            {quote?.number || "-"}
                                        </h1>

                                        <p className="text-slate-400 mt-2 text-sm sm:text-base">
                                            {quote?.title ||
                                                "Fără titlu"}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-2 mt-4">
                                            <span
                                                className={`inline-flex items-center px-3 py-1.5 rounded-full border text-sm font-bold ${statusClass}`}
                                            >
                                                {statusLabel}
                                            </span>

                                            {quote?.work_order_id && (
                                                <Link
                                                    href={route(
                                                        "work_orders.show",
                                                        quote.work_order_id
                                                    )}
                                                    className="inline-flex items-center px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 text-sm font-bold hover:bg-purple-200 transition"
                                                >
                                                    🔧 Lucrare asociată
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">

                                    <Link
                                        href={route(
                                            "quotes.edit",
                                            quote.id
                                        )}
                                        className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-white font-bold transition"
                                    >
                                        ✏️ Editează
                                    </Link>

                                    <a
                                        href={route(
                                            "quotes.pdf",
                                            quote.id
                                        )}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold transition"
                                    >
                                        📄 PDF
                                    </a>

                                    <Link
                                        href={route("invoices.create", { quote: quote.id })}
                                        className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition"
                                    >
                                        🧾 Creează factură
                                    </Link>

                                    <Link
                                        href={route(
                                            "quotes.index"
                                        )}
                                        className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold transition"
                                    >
                                        ← Înapoi
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ACTION FLOW */}

                    <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-200">
                            <h2 className="text-lg font-bold text-slate-900">
                                Flux document
                            </h2>

                            <p className="text-sm text-slate-500 mt-1">
                                Fluxul comercial și de execuție al documentului.
                            </p>
                        </div>

                        <div className="p-6">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-3">

                                {/* OFERTA */}

                                <div
                                    className={`flex-1 rounded-2xl border p-5 ${
                                        isOffer
                                            ? "border-blue-300 bg-blue-50"
                                            : "border-slate-200 bg-slate-50"
                                    }`}
                                >
                                    <div className="text-xs uppercase tracking-wider font-bold text-slate-400">
                                        Pasul 1
                                    </div>

                                    <div className="font-bold text-slate-900 mt-1">
                                        Ofertă
                                    </div>

                                    <div className="text-sm text-slate-500 mt-1">
                                        Document comercial pentru client.
                                    </div>

                                    {isOffer && (
                                        <div className="flex flex-wrap gap-2 mt-4">

                                            {quote.status !== "sent" &&
                                                quote.status !==
                                                    "accepted" &&
                                                quote.status !==
                                                    "rejected" && (
                                                    <button
                                                        type="button"
                                                        onClick={
                                                            sendQuote
                                                        }
                                                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition"
                                                    >
                                                        📤 Trimite oferta
                                                    </button>
                                                )}

                                            {quote.status === "sent" && (
                                                <button
                                                    type="button"
                                                    onClick={
                                                        acceptQuote
                                                    }
                                                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition"
                                                >
                                                    ✅ Acceptă oferta
                                                </button>
                                            )}

                                            {quote.status ===
                                                "sent" && (
                                                <button
                                                    type="button"
                                                    onClick={
                                                        rejectQuote
                                                    }
                                                    className="px-4 py-2.5 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-600 text-sm font-bold transition"
                                                >
                                                    ✕ Respinge
                                                </button>
                                            )}

                                            {quote.status ===
                                                "accepted" && (
                                                <button
                                                    type="button"
                                                    onClick={
                                                        createWorkOrder
                                                    }
                                                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition"
                                                >
                                                    🔧 Creează lucrare
                                                </button>
                                            )}

                                            {(quote.status ===
                                                "accepted" ||
                                                quote.status ===
                                                    "rejected") && (
                                                <button
                                                    type="button"
                                                    onClick={
                                                        reopenQuote
                                                    }
                                                    className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold transition"
                                                >
                                                    ↩️ Redeschide
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="hidden lg:block text-slate-300 text-2xl">
                                    →
                                </div>

                                {/* DEVIZ */}

                                <div
                                    className={`flex-1 rounded-2xl border p-5 ${
                                        isDeviz
                                            ? "border-emerald-300 bg-emerald-50"
                                            : "border-slate-200 bg-slate-50"
                                    }`}
                                >
                                    <div className="text-xs uppercase tracking-wider font-bold text-slate-400">
                                        După lucrare
                                    </div>

                                    <div className="font-bold text-slate-900 mt-1">
                                        Deviz
                                    </div>

                                    <div className="text-sm text-slate-500 mt-1">
                                        Devizul se creează după lucrare, din datele finale din teren.
                                    </div>

                                    {isDeviz && (
                                        <div className="flex flex-wrap gap-2 mt-4">

                                            {quote.status !==
                                                "finalizat" && (
                                                <button
                                                    type="button"
                                                    onClick={
                                                        finalizeDeviz
                                                    }
                                                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition"
                                                >
                                                    ✅ Finalizează deviz
                                                </button>
                                            )}

                                            {quote.status ===
                                                "finalizat" &&
                                                !quote.work_order_id && (
                                                    <button
                                                        type="button"
                                                        onClick={
                                                            reopenQuote
                                                        }
                                                        className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold transition"
                                                    >
                                                        ↩️ Redeschide deviz
                                                    </button>
                                                )}
                                        </div>
                                    )}
                                </div>

                                <div className="hidden lg:block text-slate-300 text-2xl">
                                    →
                                </div>

                                {/* LUCRARE */}

                                <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                    <div className="text-xs uppercase tracking-wider font-bold text-slate-400">
                                        Pasul 3
                                    </div>

                                    <div className="font-bold text-slate-900 mt-1">
                                        Lucrare
                                    </div>

                                    <div className="text-sm text-slate-500 mt-1">
                                        Aici se face consumul efectiv de stoc.
                                    </div>

                                    {quote?.work_order_id ? (
                                        <Link
                                            href={route(
                                                "work_orders.show",
                                                quote.work_order_id
                                            )}
                                            className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold transition"
                                        >
                                            🔧 Vezi lucrarea
                                        </Link>
                                    ) : (
                                        <div className="mt-4 inline-flex px-4 py-2.5 rounded-xl bg-slate-200 text-slate-500 text-sm font-bold">
                                            În așteptare
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                                <strong>Important:</strong>{" "}
                                finalizarea devizului nu scade stocul.
                                Stocul se scade automat când devizul finalizat este transformat în lucrare.
                            </div>
                        </div>
                    </div>

                    {/* QUICK INFO */}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                            <div className="text-xs uppercase tracking-wide font-bold text-slate-400">
                                Tip document
                            </div>

                            <div className="text-lg font-bold text-slate-900 mt-1">
                                {isDeviz
                                    ? "Deviz"
                                    : "Ofertă"}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                            <div className="text-xs uppercase tracking-wide font-bold text-slate-400">
                                Client
                            </div>

                            <div className="text-lg font-bold text-slate-900 mt-1 truncate">
                                {quote?.client?.name || "-"}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                            <div className="text-xs uppercase tracking-wide font-bold text-slate-400">
                                Data
                            </div>

                            <div className="text-lg font-bold text-slate-900 mt-1">
                                {formatDate(quote?.date)}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                            <div className="text-xs uppercase tracking-wide font-bold text-slate-400">
                                Total
                            </div>

                            <div className="text-lg font-bold text-blue-600 mt-1">
                                {formatMoney(total)} lei
                            </div>
                        </div>
                    </div>

                    {/* DOCUMENT DETAILS */}

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">

                        <div className="xl:col-span-2 space-y-6">

                            {/* CLIENT */}

                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-5 border-b border-slate-200">
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Client
                                    </h2>
                                </div>

                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                        <div>
                                            <div className="text-xs uppercase tracking-wide font-bold text-slate-400">
                                                Denumire
                                            </div>

                                            <div className="font-bold text-slate-900 mt-1">
                                                {quote?.client?.name ||
                                                    "-"}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-xs uppercase tracking-wide font-bold text-slate-400">
                                                CUI
                                            </div>

                                            <div className="font-semibold text-slate-900 mt-1">
                                                {quote?.client?.cui ||
                                                    "-"}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-xs uppercase tracking-wide font-bold text-slate-400">
                                                Telefon
                                            </div>

                                            {quote?.client?.phone ? (
                                                <a
                                                    href={`tel:${quote.client.phone}`}
                                                    className="font-bold text-blue-600 hover:underline mt-1 inline-block"
                                                >
                                                    {quote.client.phone}
                                                </a>
                                            ) : (
                                                <div className="font-semibold text-slate-900 mt-1">
                                                    -
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <div className="text-xs uppercase tracking-wide font-bold text-slate-400">
                                                Email
                                            </div>

                                            <div className="font-semibold text-slate-900 mt-1 break-all">
                                                {quote?.client?.email ||
                                                    "-"}
                                            </div>
                                        </div>

                                        <div className="md:col-span-2">
                                            <div className="text-xs uppercase tracking-wide font-bold text-slate-400">
                                                Adresă
                                            </div>

                                            <div className="font-semibold text-slate-900 mt-1">
                                                {quote?.client?.address ||
                                                    "-"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* MATERIALS */}

                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-5 border-b border-slate-200">
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <h2 className="text-lg font-bold text-slate-900">
                                                Materiale
                                            </h2>

                                            <p className="text-sm text-slate-500 mt-1">
                                                Materialele care vor fi consumate la transformarea devizului în lucrare.
                                            </p>
                                        </div>

                                        <span className="px-3 py-1.5 rounded-full bg-orange-100 text-orange-700 text-sm font-bold">
                                            {materialItems.length}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6">

                                    {materialItems.length === 0 ? (
                                        <div className="py-8 text-center text-slate-500">
                                            Nu există materiale.
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-slate-200">
                                                        <th className="text-left py-3 pr-4 text-xs uppercase tracking-wide text-slate-400">
                                                            Produs
                                                        </th>

                                                        <th className="text-center py-3 px-4 text-xs uppercase tracking-wide text-slate-400">
                                                            UM
                                                        </th>

                                                        <th className="text-right py-3 px-4 text-xs uppercase tracking-wide text-slate-400">
                                                            Cant.
                                                        </th>

                                                        <th className="text-right py-3 px-4 text-xs uppercase tracking-wide text-slate-400">
                                                            Preț
                                                        </th>

                                                        <th className="text-right py-3 pl-4 text-xs uppercase tracking-wide text-slate-400">
                                                            Total
                                                        </th>
                                                    </tr>
                                                </thead>

                                                <tbody className="divide-y divide-slate-100">
                                                    {materialItems.map(
                                                        (item) => (
                                                            <tr
                                                                key={
                                                                    item.id
                                                                }
                                                            >
                                                                <td className="py-4 pr-4">
                                                                    <div className="font-bold text-slate-900">
                                                                        {
                                                                            item.name
                                                                        }
                                                                    </div>

                                                                    {item?.product?.code && (
                                                                        <div className="text-xs text-slate-500 mt-1">
                                                                            Cod:{" "}
                                                                            {
                                                                                item
                                                                                    .product
                                                                                    .code
                                                                            }
                                                                        </div>
                                                                    )}
                                                                </td>

                                                                <td className="text-center py-4 px-4 text-slate-600">
                                                                    {
                                                                        item.unit
                                                                    }
                                                                </td>

                                                                <td className="text-right py-4 px-4 font-semibold text-slate-900">
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </td>

                                                                <td className="text-right py-4 px-4 text-slate-600">
                                                                    {formatMoney(
                                                                        item.unit_price
                                                                    )}{" "}
                                                                    lei
                                                                </td>

                                                                <td className="text-right py-4 pl-4 font-bold text-slate-900">
                                                                    {formatMoney(
                                                                        itemSubtotal(
                                                                            item
                                                                        )
                                                                    )}{" "}
                                                                    lei
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* LABOR */}

                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-5 border-b border-slate-200">
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Manoperă
                                    </h2>

                                    <p className="text-sm text-slate-500 mt-1">
                                        Lucrările și manopera din document.
                                    </p>
                                </div>

                                <div className="p-6">

                                    {laborItems.length === 0 ? (
                                        <div className="py-8 text-center text-slate-500">
                                            Nu există manoperă.
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {laborItems.map(
                                                (item) => (
                                                    <div
                                                        key={
                                                            item.id
                                                        }
                                                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-slate-200"
                                                    >
                                                        <div>
                                                            <div className="font-bold text-slate-900">
                                                                {
                                                                    item.name
                                                                }
                                                            </div>

                                                            <div className="text-sm text-slate-500 mt-1">
                                                                {
                                                                    item.quantity
                                                                }{" "}
                                                                {
                                                                    item.unit
                                                                }{" "}
                                                                ×{" "}
                                                                {formatMoney(
                                                                    item.unit_price
                                                                )}{" "}
                                                                lei
                                                            </div>
                                                        </div>

                                                        <div className="font-bold text-slate-900">
                                                            {formatMoney(
                                                                itemSubtotal(
                                                                    item
                                                                )
                                                            )}{" "}
                                                            lei
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* NOTES */}

                            {quote?.notes && (
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="px-6 py-5 border-b border-slate-200">
                                        <h2 className="text-lg font-bold text-slate-900">
                                            Observații
                                        </h2>
                                    </div>

                                    <div className="p-6">
                                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 whitespace-pre-line text-slate-700">
                                            {quote.notes}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT */}

                        <div className="space-y-6">

                            {/* TOTALURI */}

                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-5 border-b border-slate-200">
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Total document
                                    </h2>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-500">
                                            Materiale
                                        </span>

                                        <span className="font-bold text-slate-900">
                                            {formatMoney(
                                                materialsTotal
                                            )}{" "}
                                            lei
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-500">
                                            Manoperă
                                        </span>

                                        <span className="font-bold text-slate-900">
                                            {formatMoney(
                                                laborTotal
                                            )}{" "}
                                            lei
                                        </span>
                                    </div>

                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-500">
                                            Subtotal
                                        </span>

                                        <span className="font-bold text-slate-900">
                                            {formatMoney(
                                                subtotal
                                            )}{" "}
                                            lei
                                        </span>
                                    </div>

                                    {Number(
                                        quote?.discount || 0
                                    ) > 0 && (
                                        <div className="flex justify-between gap-4">
                                            <span className="text-slate-500">
                                                Discount (
                                                {
                                                    quote.discount
                                                }
                                                %)
                                            </span>

                                            <span className="font-bold text-red-600">
                                                -
                                                {formatMoney(
                                                    generalDiscount
                                                )}{" "}
                                                lei
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-500">
                                            TVA (
                                            {quote?.vat_rate ??
                                                0}
                                            %)
                                        </span>

                                        <span className="font-bold text-slate-900">
                                            {formatMoney(vat)}{" "}
                                            lei
                                        </span>
                                    </div>

                                    <div className="pt-4 border-t-2 border-slate-900 flex justify-between gap-4">
                                        <span className="font-bold text-slate-900">
                                            TOTAL
                                        </span>

                                        <span className="text-xl font-bold text-blue-600">
                                            {formatMoney(total)}{" "}
                                            lei
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* DOCUMENT ACTIONS */}

                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-5 border-b border-slate-200">
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Acțiuni
                                    </h2>
                                </div>

                                <div className="p-5 space-y-2">

                                    {isOffer &&
                                        quote.status ===
                                            "accepted" && (
                                            <button
                                                type="button"
                                                onClick={
                                                    createWorkOrder
                                                }
                                                className="w-full flex items-center justify-between p-4 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 transition"
                                            >
                                                <span className="flex items-center gap-3">
                                                    <span className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                                                        🔧
                                                    </span>

                                                    <span className="text-left">
                                                        <span className="block font-bold text-slate-900">
                                                            Creează lucrare
                                                        </span>

                                                        <span className="block text-xs text-slate-500">
                                                            Creează lucrarea din oferta acceptată
                                                        </span>
                                                    </span>
                                                </span>

                                                <span className="text-blue-600 font-bold">
                                                    →
                                                </span>
                                            </button>
                                        )}

                                    {isDeviz &&
                                        quote.status !==
                                            "finalizat" && (
                                            <button
                                                type="button"
                                                onClick={
                                                    finalizeDeviz
                                                }
                                                className="w-full flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition"
                                            >
                                                <span className="flex items-center gap-3">
                                                    <span className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                                                        ✅
                                                    </span>

                                                    <span className="text-left">
                                                        <span className="block font-bold text-slate-900">
                                                            Finalizează deviz
                                                        </span>

                                                        <span className="block text-xs text-slate-500">
                                                            Confirmă documentul pentru execuție
                                                        </span>
                                                    </span>
                                                </span>

                                                <span className="text-emerald-600 font-bold">
                                                    →
                                                </span>
                                            </button>
                                        )}

                                    <a
                                        href={route(
                                            "quotes.pdf",
                                            quote.id
                                        )}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
                                    >
                                        <span className="flex items-center gap-3">
                                            <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                                📄
                                            </span>

                                            <span className="text-left">
                                                <span className="block font-bold text-slate-900">
                                                    Deschide PDF
                                                </span>

                                                <span className="block text-xs text-slate-500">
                                                    Vizualizează documentul
                                                </span>
                                            </span>
                                        </span>

                                        <span className="text-slate-400">
                                            →
                                        </span>
                                    </a>

                                    <Link
                                        href={route(
                                            "quotes.edit",
                                            quote.id
                                        )}
                                        className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
                                    >
                                        <span className="flex items-center gap-3">
                                            <span className="w-10 h-10 rounded-xl bg-yellow-100 text-yellow-700 flex items-center justify-center">
                                                ✏️
                                            </span>

                                            <span className="text-left">
                                                <span className="block font-bold text-slate-900">
                                                    Editează
                                                </span>

                                                <span className="block text-xs text-slate-500">
                                                    Modifică documentul
                                                </span>
                                            </span>
                                        </span>

                                        <span className="text-slate-400">
                                            →
                                        </span>
                                    </Link>

                                    {quote?.work_order_id && (
                                        <Link
                                            href={route(
                                                "work_orders.show",
                                                quote.work_order_id
                                            )}
                                            className="w-full flex items-center justify-between p-4 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 transition"
                                        >
                                            <span className="flex items-center gap-3">
                                                <span className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                                                    🔧
                                                </span>

                                                <span className="text-left">
                                                    <span className="block font-bold text-slate-900">
                                                        Vezi lucrarea
                                                    </span>

                                                    <span className="block text-xs text-slate-500">
                                                        Deschide lucrarea asociată
                                                    </span>
                                                </span>
                                            </span>

                                            <span className="text-purple-600 font-bold">
                                                →
                                            </span>
                                        </Link>
                                    )}

                                    {((isOffer &&
                                        (quote.status ===
                                            "accepted" ||
                                            quote.status ===
                                                "rejected")) ||
                                        (isDeviz &&
                                            quote.status ===
                                                "finalizat" &&
                                            !quote.work_order_id)) && (
                                        <button
                                            type="button"
                                            onClick={
                                                reopenQuote
                                            }
                                            className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
                                        >
                                            <span className="flex items-center gap-3">
                                                <span className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                                    ↩️
                                                </span>

                                                <span className="text-left">
                                                    <span className="block font-bold text-slate-900">
                                                        Redeschide
                                                    </span>

                                                    <span className="block text-xs text-slate-500">
                                                        Revino la starea de editare
                                                    </span>
                                                </span>
                                            </span>

                                            <span className="text-slate-400">
                                                →
                                            </span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* SYSTEM */}

                            <div className="bg-slate-900 rounded-2xl shadow-sm overflow-hidden">
                                <div className="p-6">
                                    <div className="text-xs uppercase tracking-wider font-bold text-slate-500">
                                        Informații sistem
                                    </div>

                                    <div className="mt-4 space-y-3 text-sm">
                                        <div className="flex justify-between gap-4">
                                            <span className="text-slate-400">
                                                Număr
                                            </span>

                                            <span className="text-white font-semibold text-right">
                                                {quote?.number ||
                                                    "-"}
                                            </span>
                                        </div>

                                        <div className="flex justify-between gap-4">
                                            <span className="text-slate-400">
                                                Creat
                                            </span>

                                            <span className="text-white font-semibold">
                                                {formatDate(
                                                    quote?.created_at
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex justify-between gap-4">
                                            <span className="text-slate-400">
                                                Actualizat
                                            </span>

                                            <span className="text-white font-semibold">
                                                {formatDate(
                                                    quote?.updated_at
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* DELETE */}

                            <button
                                type="button"
                                onClick={deleteQuote}
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-600 font-bold transition"
                            >
                                🗑️ Șterge documentul
                            </button>
                        </div>
                    </div>

                    {/* FOOTER */}

                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link
                            href={route(
                                "quotes.index"
                            )}
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-bold transition"
                        >
                            ← Lista oferte / devize
                        </Link>

                        <a
                            href={route(
                                "quotes.pdf",
                                quote.id
                            )}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition"
                        >
                            📄 PDF
                        </a>

                        {isOffer &&
                            quote.status ===
                                "accepted" && (
                                <button
                                    type="button"
                                    onClick={
                                        createWorkOrder
                                    }
                                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition"
                                >
                                    🔧 Creează lucrare
                                </button>
                            )}

                        {quote?.work_order_id && (
                            <Link
                                href={route(
                                    "work_orders.show",
                                    quote.work_order_id
                                )}
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition"
                            >
                                🔧 Vezi lucrarea
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
