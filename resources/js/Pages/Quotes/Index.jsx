import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";

export default function Index({ quotes }) {
    const quoteData = quotes?.data || [];

    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    function statusLabel(status) {
        const labels = {
            draft: "Ciornă",
            sent: "Trimisă",
            accepted: "Acceptată",
            rejected: "Respinsă",
            finalizat: "Finalizat",
        };

        return labels[status] || status || "-";
    }

    function statusStyle(status) {
        const styles = {
            draft: "bg-gray-100 text-gray-700",
            sent: "bg-blue-100 text-blue-700",
            accepted: "bg-green-100 text-green-700",
            rejected: "bg-red-100 text-red-700",
            finalizat: "bg-green-100 text-green-700",
        };

        return styles[status] || "bg-gray-100 text-gray-700";
    }

    function calculateTotal(quote) {
        const items = Array.isArray(quote?.items)
            ? quote.items
            : [];

        let subtotal = 0;

        items.forEach((item) => {
            const quantity = Number(item.quantity || 0);
            const unitPrice = Number(item.unit_price || 0);
            const discount = Number(item.discount || 0);

            const value = quantity * unitPrice;

            subtotal += value - (value * discount) / 100;
        });

        const quoteDiscount = Number(quote.discount || 0);

        const afterDiscount =
            subtotal - (subtotal * quoteDiscount) / 100;

        const vatRate = Number(quote.vat_rate || 0);

        const vat = (afterDiscount * vatRate) / 100;

        return afterDiscount + vat;
    }

    function formatMoney(value) {
        return (
            new Intl.NumberFormat("ro-RO", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(Number(value || 0)) + " lei"
        );
    }

    function formatDate(date) {
        if (!date) {
            return "-";
        }

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) {
            return date;
        }

        return parsed.toLocaleDateString("ro-RO");
    }

    /*
    |--------------------------------------------------------------------------
    | Ștergere
    |--------------------------------------------------------------------------
    */

    function deleteQuote(quote) {
        const documentType =
            quote.type === "deviz"
                ? "devizul"
                : "oferta";

        const confirmed = window.confirm(
            `Sigur vrei să ștergi ${documentType} ${quote.number}?\n\n` +
                "Această acțiune nu poate fi anulată."
        );

        if (!confirmed) {
            return;
        }

        router.delete(
            route("quotes.destroy", quote.id),
            {
                preserveScroll: true,
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Trimite oferta
    |--------------------------------------------------------------------------
    */

    function sendQuote(quote) {
        if (quote.type !== "oferta") {
            return;
        }

        const confirmed = window.confirm(
            `Marchezi oferta ${quote.number} ca trimisă clientului?`
        );

        if (!confirmed) {
            return;
        }

        router.post(
            route("quotes.send", quote.id),
            {},
            {
                preserveScroll: true,
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Acceptă oferta
    |--------------------------------------------------------------------------
    */

    function acceptQuote(quote) {
        if (quote.type !== "oferta") {
            return;
        }

        const confirmed = window.confirm(
            `Confirmi acceptarea ofertei ${quote.number}?`
        );

        if (!confirmed) {
            return;
        }

        router.post(
            route("quotes.accept", quote.id),
            {},
            {
                preserveScroll: true,
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Respinge oferta
    |--------------------------------------------------------------------------
    */

    function rejectQuote(quote) {
        if (quote.type !== "oferta") {
            return;
        }

        const confirmed = window.confirm(
            `Sigur vrei să respingi oferta ${quote.number}?`
        );

        if (!confirmed) {
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

    /*
    |--------------------------------------------------------------------------
    | Finalizează devizul
    |--------------------------------------------------------------------------
    */

    function finalizeQuote(quote) {
        if (quote.type !== "deviz") {
            return;
        }

        const confirmed = window.confirm(
            `Sigur vrei să finalizezi devizul ${quote.number}?`
        );

        if (!confirmed) {
            return;
        }

        router.post(
            route("quotes.finalize", quote.id),
            {},
            {
                preserveScroll: true,
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Redeschide
    |--------------------------------------------------------------------------
    */

    function reopenQuote(quote) {
        const documentType =
            quote.type === "deviz"
                ? "devizul"
                : "oferta";

        const confirmed = window.confirm(
            `Sigur vrei să redeschizi ${documentType} ${quote.number}?`
        );

        if (!confirmed) {
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

    /*
    |--------------------------------------------------------------------------
    | Creează lucrare din ofertă
    |--------------------------------------------------------------------------
    */

    function createWorkOrder(quote) {
        if (
            quote.type !== "oferta" ||
            quote.status !== "accepted"
        ) {
            return;
        }

        const confirmed = window.confirm(
            `Vrei să creezi lucrarea din oferta ${quote.number}?`
        );

        if (!confirmed) {
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

    /*
    |--------------------------------------------------------------------------
    | Printează
    |--------------------------------------------------------------------------
    */

    function printQuote(quote) {
        const url = route(
            "quotes.pdf",
            quote.id
        );

        window.open(
            url,
            "_blank",
            "noopener,noreferrer"
        );
    }

    function saveAsTemplate(quote) {
        const name = window.prompt("Numele șablonului", quote.title || quote.number);
        if (!name?.trim()) return;
        router.post(route("quotes.save-template", quote.id), { name: name.trim() }, { preserveScroll: true });
    }

    /*
    |--------------------------------------------------------------------------
    | Acțiunea selectată
    |--------------------------------------------------------------------------
    */

    function handleAction(quote, action) {
        if (!action) {
            return;
        }

        switch (action) {
            case "view":
                window.location.href = route(
                    "quotes.show",
                    quote.id
                );
                break;

            case "edit":
                window.location.href = route(
                    "quotes.edit",
                    quote.id
                );
                break;

            case "print":
                printQuote(quote);
                break;

            case "template":
                saveAsTemplate(quote);
                break;

            case "send":
                sendQuote(quote);
                break;

            case "accept":
                acceptQuote(quote);
                break;

            case "reject":
                rejectQuote(quote);
                break;

            case "finalize":
                finalizeQuote(quote);
                break;

            case "reopen":
                reopenQuote(quote);
                break;

            case "work_order":
                createWorkOrder(quote);
                break;

            case "delete":
                deleteQuote(quote);
                break;

            default:
                break;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Filtrare
    |--------------------------------------------------------------------------
    */

    function filteredQuotes() {
        let result = [...quoteData];

        const searchValue =
            search.trim().toLowerCase();

        if (searchValue) {
            result = result.filter((quote) => {
                const number = String(
                    quote.number || ""
                ).toLowerCase();

                const client = String(
                    quote.client?.name || ""
                ).toLowerCase();

                const workOrder = String(
                    quote.work_order?.number || ""
                ).toLowerCase();

                const title = String(
                    quote.title || ""
                ).toLowerCase();

                return (
                    number.includes(searchValue) ||
                    client.includes(searchValue) ||
                    workOrder.includes(searchValue) ||
                    title.includes(searchValue)
                );
            });
        }

        if (filter === "all") {
            return result;
        }

        if (filter === "oferta") {
            return result.filter(
                (quote) =>
                    quote.type === "oferta"
            );
        }

        if (filter === "deviz") {
            return result.filter(
                (quote) =>
                    quote.type === "deviz"
            );
        }

        if (filter === "finalizat") {
            return result.filter(
                (quote) =>
                    quote.status === "finalizat"
            );
        }

        if (filter === "draft") {
            return result.filter(
                (quote) =>
                    quote.status === "draft"
            );
        }

        return result;
    }

    const displayedQuotes =
        filteredQuotes();

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <AuthenticatedLayout>
            <Head title="Oferte și devize" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* HEADER */}

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Oferte și devize
                            </h1>

                            <p className="text-gray-500 mt-1">
                                Gestionează ofertele și devizele clienților
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">

                            <Link href={route("quote-templates.index")} className="inline-flex items-center justify-center gap-2 border border-violet-600 bg-white px-5 py-3 font-semibold text-violet-700 rounded-xl shadow-sm transition">📋 Șabloane</Link>

                            <Link
                                href={route(
                                    "quotes.create"
                                )}
                                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-xl shadow-sm transition"
                            >
                                <span className="text-lg">
                                    +
                                </span>

                                Ofertă nouă
                            </Link>

                            <Link
                                href={route(
                                    "quotes.create-deviz"
                                )}
                                className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-3 rounded-xl shadow-sm transition"
                            >
                                <span className="text-lg">
                                    +
                                </span>

                                Deviz nou
                            </Link>

                        </div>
                    </div>

                    {/* FILTRE */}

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">

                        <div className="flex flex-col lg:flex-row gap-4">

                            <div className="flex-1">

                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Caută
                                </label>

                                <div className="relative">

                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        🔎
                                    </span>

                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Număr, client, lucrare sau titlu..."
                                        className="w-full rounded-xl border-gray-300 pl-11 pr-4 py-3 focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>
                            </div>

                            <div className="lg:w-auto">

                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Filtru
                                </label>

                                <div className="flex flex-wrap gap-2">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFilter("all")
                                        }
                                        className={
                                            "px-4 py-3 rounded-xl text-sm font-semibold transition " +
                                            (
                                                filter === "all"
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            )
                                        }
                                    >
                                        📄 Toate
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFilter("oferta")
                                        }
                                        className={
                                            "px-4 py-3 rounded-xl text-sm font-semibold transition " +
                                            (
                                                filter === "oferta"
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            )
                                        }
                                    >
                                        🧾 Oferte
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFilter("deviz")
                                        }
                                        className={
                                            "px-4 py-3 rounded-xl text-sm font-semibold transition " +
                                            (
                                                filter === "deviz"
                                                    ? "bg-orange-500 text-white"
                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            )
                                        }
                                    >
                                        🛠️ Devize
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFilter("finalizat")
                                        }
                                        className={
                                            "px-4 py-3 rounded-xl text-sm font-semibold transition " +
                                            (
                                                filter === "finalizat"
                                                    ? "bg-green-600 text-white"
                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            )
                                        }
                                    >
                                        ✅ Finalizate
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setFilter("draft")
                                        }
                                        className={
                                            "px-4 py-3 rounded-xl text-sm font-semibold transition " +
                                            (
                                                filter === "draft"
                                                    ? "bg-gray-700 text-white"
                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            )
                                        }
                                    >
                                        📝 Ciorne
                                    </button>

                                </div>
                            </div>
                        </div>
                    </div>

                    {/* LISTA */}

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                        {displayedQuotes.length === 0 ? (

                            <div className="py-20 px-6 text-center">

                                <div className="text-5xl mb-4">
                                    📄
                                </div>

                                <h2 className="text-xl font-semibold text-gray-800">
                                    {quoteData.length === 0
                                        ? "Nu există încă documente"
                                        : "Nu au fost găsite rezultate"}
                                </h2>

                                <p className="text-gray-500 mt-2 mb-6">
                                    {quoteData.length === 0
                                        ? "Creează prima ofertă sau primul deviz."
                                        : "Încearcă o altă căutare sau modifică filtrul."}
                                </p>

                                {quoteData.length === 0 && (
                                    <div className="flex flex-wrap justify-center gap-3">

                                        <Link
                                            href={route(
                                                "quotes.create"
                                            )}
                                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl transition"
                                        >
                                            + Creează prima ofertă
                                        </Link>

                                        <Link
                                            href={route(
                                                "quotes.create-deviz"
                                            )}
                                            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl transition"
                                        >
                                            + Creează primul deviz
                                        </Link>

                                    </div>
                                )}

                            </div>

                        ) : (

                            <div className="overflow-x-auto">

                                <table className="w-full">

                                    <thead>

                                        <tr className="bg-gray-50 border-b border-gray-200">

                                            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                Document
                                            </th>

                                            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                Client
                                            </th>

                                            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                Data
                                            </th>

                                            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                Status
                                            </th>

                                            <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                Total
                                            </th>

                                            <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                Acțiuni
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody className="divide-y divide-gray-100">

                                        {displayedQuotes.map(
                                            (quote) => (

                                                <tr
                                                    key={quote.id}
                                                    className="hover:bg-gray-50 transition"
                                                >

                                                    {/* DOCUMENT */}

                                                    <td className="px-6 py-5">

                                                        <div className="flex items-center gap-3">

                                                            <div
                                                                className={
                                                                    "w-10 h-10 rounded-xl flex items-center justify-center text-lg " +
                                                                    (
                                                                        quote.type === "deviz"
                                                                            ? "bg-orange-100"
                                                                            : "bg-blue-100"
                                                                    )
                                                                }
                                                            >
                                                                {quote.type ===
                                                                "deviz"
                                                                    ? "🛠️"
                                                                    : "🧾"}
                                                            </div>

                                                            <div>

                                                                <div className="font-semibold text-gray-900">
                                                                    {quote.number}
                                                                </div>

                                                                {quote.title && (
                                                                    <div className="text-xs text-gray-500 mt-1">
                                                                        {quote.title}
                                                                    </div>
                                                                )}

                                                                {quote.work_order && (
                                                                    <div className="text-xs text-gray-400 mt-1">
                                                                        Lucrare:{" "}
                                                                        {
                                                                            quote
                                                                                .work_order
                                                                                .number
                                                                        }
                                                                    </div>
                                                                )}

                                                            </div>

                                                        </div>

                                                    </td>

                                                    {/* CLIENT */}

                                                    <td className="px-6 py-5">

                                                        <div className="font-medium text-gray-800">
                                                            {quote.client?.name ||
                                                                "-"}
                                                        </div>

                                                        {quote.client?.phone && (
                                                            <div className="text-sm text-gray-500 mt-1">
                                                                {
                                                                    quote
                                                                        .client
                                                                        .phone
                                                                }
                                                            </div>
                                                        )}

                                                    </td>

                                                    {/* DATA */}

                                                    <td className="px-6 py-5 text-gray-700">
                                                        {formatDate(
                                                            quote.date
                                                        )}
                                                    </td>

                                                    {/* STATUS */}

                                                    <td className="px-6 py-5">

                                                        <span
                                                            className={
                                                                "inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium " +
                                                                statusStyle(
                                                                    quote.status
                                                                )
                                                            }
                                                        >
                                                            {statusLabel(
                                                                quote.status
                                                            )}
                                                        </span>

                                                    </td>

                                                    {/* TOTAL */}

                                                    <td className="px-6 py-5 text-right">

                                                        <div className="font-bold text-gray-900">
                                                            {formatMoney(
                                                                calculateTotal(
                                                                    quote
                                                                )
                                                            )}
                                                        </div>

                                                    </td>

                                                    {/* ACȚIUNI */}

                                                    <td className="px-6 py-5">

                                                        <div className="flex justify-end">

                                                            <select
                                                                defaultValue=""
                                                                onChange={(event) => {
                                                                    const action =
                                                                        event
                                                                            .target
                                                                            .value;

                                                                    event.target.value =
                                                                        "";

                                                                    handleAction(
                                                                        quote,
                                                                        action
                                                                    );
                                                                }}
                                                                className="min-w-[190px] rounded-xl border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:border-gray-400 focus:border-blue-500 focus:ring-blue-500 cursor-pointer"
                                                            >

                                                                <option
                                                                    value=""
                                                                    disabled
                                                                >
                                                                    ⚙️ Acțiuni...
                                                                </option>

                                                                <option value="view">
                                                                    👁️ Vezi documentul
                                                                </option>

                                                                <option value="edit">
                                                                    ✏️ Editează
                                                                </option>

                                                                <option value="print">
                                                                    🖨️ Printează / PDF
                                                                </option>

                                                                <option value="template">
                                                                    📋 Salvează ca șablon
                                                                </option>

                                                                {quote.type ===
                                                                    "oferta" &&
                                                                    quote.status !==
                                                                        "accepted" &&
                                                                    quote.status !==
                                                                        "rejected" && (
                                                                        <>
                                                                            <option value="send">
                                                                                📤 Marchează ca trimisă
                                                                            </option>

                                                                            <option value="accept">
                                                                                ✅ Acceptă oferta
                                                                            </option>

                                                                            <option value="reject">
                                                                                ❌ Respinge oferta
                                                                            </option>
                                                                        </>
                                                                    )}

                                                                {quote.type ===
                                                                    "oferta" &&
                                                                    quote.status ===
                                                                        "accepted" &&
                                                                    !quote.work_order_id && (
                                                                        <option value="work_order">
                                                                            🏗️ Creează lucrare
                                                                        </option>
                                                                    )}

                                                                {quote.type ===
                                                                    "deviz" &&
                                                                    quote.status !==
                                                                        "finalizat" && (
                                                                        <option value="finalize">
                                                                            ✅ Finalizează devizul
                                                                        </option>
                                                                    )}

                                                                {(
                                                                    (
                                                                        quote.type ===
                                                                            "oferta" &&
                                                                        (
                                                                            quote.status ===
                                                                                "accepted" ||
                                                                            quote.status ===
                                                                                "rejected"
                                                                        )
                                                                    ) ||
                                                                    (
                                                                        quote.type ===
                                                                            "deviz" &&
                                                                        quote.status ===
                                                                            "finalizat"
                                                                    )
                                                                ) && (
                                                                    <option value="reopen">
                                                                        🔄 Redeschide
                                                                    </option>
                                                                )}

                                                                <option value="delete">
                                                                    🗑️ Șterge
                                                                </option>

                                                            </select>

                                                        </div>

                                                    </td>

                                                </tr>
                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>
                        )}

                    </div>

                    {/* PAGINARE */}

                    {quotes?.links &&
                        quotes.links.length > 3 && (

                            <div className="flex flex-wrap justify-center gap-2 mt-6">

                                {quotes.links.map(
                                    (link, index) => (

                                        <Link
                                            key={index}
                                            href={
                                                link.url || "#"
                                            }
                                            preserveScroll
                                            className={
                                                "px-4 py-2 rounded-lg border text-sm transition " +
                                                (
                                                    link.active
                                                        ? "bg-blue-600 text-white border-blue-600"
                                                        : link.url
                                                        ? "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                                                        : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                                )
                                            }
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
        </AuthenticatedLayout>
    );
}
