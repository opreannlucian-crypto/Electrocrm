import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";

export default function Create({
    clients = [],
    products = [],
    licenses = [],
    workOrders = [],
    prefill = null,
    mode = "oferta",
    templateMode = false,
}) {
    /*
    |--------------------------------------------------------------------------
    | TIP DOCUMENT
    |--------------------------------------------------------------------------
    */

    const urlParams =
        typeof window !== "undefined"
            ? new URLSearchParams(window.location.search)
            : null;

    const urlWorkOrderId =
        urlParams?.get("work_order_id") || "";

    const urlSourceQuoteId =
        urlParams?.get("source_quote_id") || "";

    const initialWorkOrderId =
        prefill?.work_order_id ??
        urlWorkOrderId ??
        "";

    const initialSourceQuoteId =
        prefill?.source_quote_id ??
        urlSourceQuoteId ??
        "";

    const isDeviz =
        mode === "deviz" ||
        prefill?.type === "deviz" ||
        !!initialWorkOrderId ||
        !!initialSourceQuoteId;

    const documentType = isDeviz
        ? "deviz"
        : "oferta";

    const documentLabel = isDeviz
        ? "Deviz"
        : "Ofertă";

    const documentLabelUpper = isDeviz
        ? "DEVIZ"
        : "OFERTĂ";

    /*
    |--------------------------------------------------------------------------
    | ARTICOLE INITIALE
    |--------------------------------------------------------------------------
    */

    const buildItems = (items) => {
        if (
            Array.isArray(items) &&
            items.length > 0
        ) {
            return items.map((item) => ({
                id: item.id ?? null,

                product_id:
                    item.product_id ?? "",

                type:
                    item.type ?? "material",

                name:
                    item.name ?? "",

                unit:
                    item.unit ?? "buc",

                quantity:
                    item.quantity ?? 1,

                unit_price:
                    item.unit_price ?? 0,

                discount:
                    item.discount ?? 0,
            }));
        }

        return [];
    };

    /*
    |--------------------------------------------------------------------------
    | FORM
    |--------------------------------------------------------------------------
    */

    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
    } = useForm({
        type: documentType,

        client_id:
            prefill?.client_id ?? "",

        license_id:
            prefill?.license_id ?? "",

        work_order_id:
            initialWorkOrderId,

        source_quote_id:
            initialSourceQuoteId,

        title:
            prefill?.title ?? "",

        date:
            prefill?.date
                ? String(prefill.date).substring(
                      0,
                      10
                  )
                : new Date()
                      .toISOString()
                      .slice(0, 10),

        discount:
            prefill?.discount ?? 0,

        vat_rate:
            prefill?.vat_rate ?? 21,

        notes:
            prefill?.notes ?? "",

        name: "",

        items: buildItems(
            prefill?.items
        ),
    });

    const emptyDraftItem = (type = "material") => ({
        product_id: "",
        type,
        name: "",
        unit: type === "manopera" ? "ore" : "buc",
        quantity: 1,
        unit_price: 0,
        discount: 0,
    });

    const [draftItem, setDraftItem] = useState(emptyDraftItem());

    /*
    |--------------------------------------------------------------------------
    | SINCRONIZARE PREFILL
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!prefill) {
            return;
        }

        const nextType =
            prefill.type === "deviz" ||
            mode === "deviz" ||
            prefill.work_order_id ||
            prefill.source_quote_id
                ? "deviz"
                : "oferta";

        setData((current) => ({
            ...current,

            type: nextType,

            client_id:
                prefill.client_id ??
                current.client_id ??
                "",

            license_id:
                prefill.license_id ??
                current.license_id ??
                "",

            work_order_id:
                prefill.work_order_id ??
                current.work_order_id ??
                "",

            source_quote_id:
                prefill.source_quote_id ??
                current.source_quote_id ??
                "",

            title:
                prefill.title ??
                current.title ??
                "",

            date: prefill.date
                ? String(
                      prefill.date
                  ).substring(
                      0,
                      10
                  )
                : current.date,

            discount:
                prefill.discount ??
                current.discount ??
                0,

            vat_rate:
                prefill.vat_rate ??
                current.vat_rate ??
                21,

            notes:
                prefill.notes ??
                current.notes ??
                "",

            items:
                Array.isArray(
                    prefill.items
                ) &&
                prefill.items.length > 0
                    ? buildItems(
                          prefill.items
                      )
                    : current.items,
        }));
    }, [
        prefill?.id,
        prefill?.source_quote_id,
        prefill?.work_order_id,
    ]);

    /*
    |--------------------------------------------------------------------------
    | CLIENT SELECTAT
    |--------------------------------------------------------------------------
    */

    const selectedClient = useMemo(() => {
        return clients.find(
            (client) =>
                String(client.id) ===
                String(data.client_id)
        );
    }, [
        clients,
        data.client_id,
    ]);

    /*
    |--------------------------------------------------------------------------
    | TVA AUTOMAT DUPA CLIENT
    |--------------------------------------------------------------------------
    |
    | Regula:
    |
    | platitor_tva    -> 0%
    | neplatitor_tva  -> 21%
    | neverificat     -> 21%
    |
    */

    const automaticVatRate =
        selectedClient?.tva_status ===
        "platitor_tva"
            ? 0
            : 21;

    const isVatRegistered =
        selectedClient?.tva_status ===
        "platitor_tva";

    const vatStatusLabel =
        isVatRegistered
            ? "Fara TVA - client platitor TVA"
            : "TVA 21% - client neplatitor TVA";

    useEffect(() => {
        if (!data.client_id) {
            return;
        }

        setData(
            "vat_rate",
            automaticVatRate
        );
    }, [
        data.client_id,
        selectedClient?.tva_status,
    ]);

    /*
    |--------------------------------------------------------------------------
    | LUCRARE SELECTATA
    |--------------------------------------------------------------------------
    */

    const selectedWorkOrder = useMemo(() => {
        return workOrders.find(
            (workOrder) =>
                String(workOrder.id) ===
                String(
                    data.work_order_id
                )
        );
    }, [
        workOrders,
        data.work_order_id,
    ]);

    /*
    |--------------------------------------------------------------------------
    | COMPLETARE AUTOMATA DIN LUCRARE
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (
            !selectedWorkOrder
        ) {
            return;
        }

        if (
            selectedWorkOrder.client_id &&
            !data.client_id
        ) {
            setData(
                "client_id",
                selectedWorkOrder.client_id
            );
        }

        if (
            !data.title &&
            selectedWorkOrder.description
        ) {
            setData(
                "title",
                selectedWorkOrder.description
            );
        }
    }, [
        selectedWorkOrder?.id,
    ]);

    /*
    |--------------------------------------------------------------------------
    | ARTICOLE
    |--------------------------------------------------------------------------
    */

    function updateItem(
        index,
        field,
        value
    ) {
        const updated = [
            ...data.items,
        ];

        updated[index] = {
            ...updated[index],
            [field]: value,
        };

        setData(
            "items",
            updated
        );
    }

    function addItem(
        type = "material"
    ) {
        setData(
            "items",
            [
                ...data.items,
                {
                    product_id: "",
                    type,
                    name: "",
                    unit:
                        type ===
                        "manopera"
                            ? "ore"
                            : "buc",
                    quantity: 1,
                    unit_price: 0,
                    discount: 0,
                },
            ]
        );
    }

    function updateDraftItem(field, value) {
        setDraftItem((current) => ({
            ...current,
            [field]: value,
        }));
    }

    function selectDraftProduct(productId) {
        const product = products.find(
            (item) => String(item.id) === String(productId)
        );

        setDraftItem((current) => ({
            ...current,
            product_id: productId,
            name: product?.name ?? current.name,
            unit: product?.unit ?? current.unit,
            unit_price: product ? getProductPrice(product) : current.unit_price,
        }));
    }

    function addDraftItem() {
        if (!draftItem.name.trim()) {
            window.alert("Completează denumirea poziției.");
            return;
        }

        if (Number(draftItem.quantity) <= 0) {
            window.alert("Cantitatea trebuie să fie mai mare decât 0.");
            return;
        }

        setData("items", [...data.items, { ...draftItem, id: null }]);
        setDraftItem(emptyDraftItem(draftItem.type));
    }

    function removeItem(index) {
        setData(
            "items",
            data.items.filter(
                (_, itemIndex) =>
                    itemIndex !== index
            )
        );
    }

    /*
    |--------------------------------------------------------------------------
    | PRODUS
    |--------------------------------------------------------------------------
    */

    function getProductPrice(
        product
    ) {
        return (
            product?.sale_price ??
            product?.selling_price ??
            product?.price ??
            product?.unit_price ??
            0
        );
    }

    function handleProductChange(
        index,
        productId
    ) {
        const product =
            products.find(
                (item) =>
                    String(item.id) ===
                    String(productId)
            );

        const updated = [
            ...data.items,
        ];

        updated[index] = {
            ...updated[index],

            product_id:
                productId,

            name:
                product?.name ??
                updated[index]
                    .name ??
                "",

            unit:
                product?.unit ??
                updated[index]
                    .unit ??
                "buc",

            unit_price:
                getProductPrice(
                    product
                ),
        };

        setData(
            "items",
            updated
        );
    }

    /*
    |--------------------------------------------------------------------------
    | CALCUL ARTICOL
    |--------------------------------------------------------------------------
    */

    function itemTotal(item) {
        const quantity =
            Number(
                item?.quantity
            ) || 0;

        const unitPrice =
            Number(
                item?.unit_price
            ) || 0;

        const discount =
            Number(
                item?.discount
            ) || 0;

        const subtotal =
            quantity *
            unitPrice;

        return (
            subtotal -
            (subtotal *
                discount) /
                100
        );
    }

    /*
    |--------------------------------------------------------------------------
    | TOTALURI
    |--------------------------------------------------------------------------
    */

    const subtotal =
        data.items.reduce(
            (
                total,
                item
            ) =>
                total +
                itemTotal(
                    item
                ),
            0
        );

    const generalDiscountRate =
        Number(
            data.discount
        ) || 0;

    const generalDiscount =
        (subtotal *
            generalDiscountRate) /
        100;

    const taxable =
        subtotal -
        generalDiscount;

    const vatRate =
        Number(
            data.vat_rate
        ) || 0;

    const vat =
        (taxable *
            vatRate) /
        100;

    const total =
        taxable + vat;

    /*
    |--------------------------------------------------------------------------
    | FORMATARE BANI
    |--------------------------------------------------------------------------
    */

    function formatMoney(
        value
    ) {
        return Number(
            value || 0
        ).toLocaleString(
            "ro-RO",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | SUBMIT
    |--------------------------------------------------------------------------
    */

    function submit(event) {
        event.preventDefault();

        const payload = {
            ...data,

            type: documentType,

            /*
            |--------------------------------------------------------------------------
            | TVA calculat automat.
            | Nu folosim valoarea modificata manual.
            |--------------------------------------------------------------------------
            */

            vat_rate:
                automaticVatRate,

            work_order_id:
                data.work_order_id ||
                null,

            source_quote_id:
                data.source_quote_id ||
                null,

            license_id:
                data.license_id ||
                null,

            items: data.items.map(
                (item) => ({
                    id:
                        item.id ??
                        null,

                    product_id:
                        item.product_id ||
                        null,

                    type:
                        item.type ||
                        "material",

                    name:
                        item.name ||
                        "",

                    unit:
                        item.unit ||
                        "buc",

                    quantity:
                        item.quantity ??
                        1,

                    unit_price:
                        item.unit_price ??
                        0,

                    discount:
                        item.discount ??
                        0,
                })
            ),
        };

        if (prefill?.id) {
            put(
                route(
                    "quotes.update",
                    prefill.id
                ),
                {
                    data: payload,
                }
            );

            return;
        }

        if (templateMode) {
            post(route("quote-templates.store"), {
                data: {
                    ...payload,
                    name: data.name,
                },
            });

            return;
        }

        post(
            route(
                "quotes.store"
            ),
            {
                data: payload,
            }
        );
    }

    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <AuthenticatedLayout>
            <Head
                title={
                    templateMode
                        ? "Șablon ofertă nou"
                        : prefill?.id
                        ? `Editează ${documentLabel}`
                        : `${documentLabel} nou`
                }
            />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* HEADER */}

                    <div
                        className={
                            "rounded-2xl shadow-xl overflow-hidden mb-8 " +
                            (isDeviz
                                ? "bg-purple-700"
                                : "bg-slate-900")
                        }
                    >
                        <div className="px-8 py-8">

                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                                <div>

                                    <div className="text-sm text-white/70 uppercase tracking-wider">
                                        ELECTRODEP SRL
                                    </div>

                                    <h1 className="text-3xl lg:text-4xl font-bold text-white mt-2">
                                        {prefill?.id
                                            ? `Editează ${documentLabel}`
                                            : templateMode
                                            ? "Șablon ofertă nou"
                                            : `${documentLabel} nou`}
                                    </h1>

                                    <p className="text-white/80 mt-2">
                                        {documentLabelUpper}
                                        {" "}
                                        — document comercial
                                    </p>

                                    {data.source_quote_id && (
                                        <div className="mt-4 inline-flex items-center px-4 py-2 rounded-full bg-white/15 text-white border border-white/20 font-semibold">
                                            📋 Preluat din oferta #
                                            {" "}
                                            {
                                                data.source_quote_id
                                            }
                                        </div>
                                    )}

                                    {selectedWorkOrder && (
                                        <div className="mt-3 inline-flex items-center px-4 py-2 rounded-full bg-white/15 text-white border border-white/20 font-semibold">
                                            🔧 Lucrare{" "}
                                            {
                                                selectedWorkOrder.number
                                            }
                                        </div>
                                    )}

                                </div>

                                <div className="text-left lg:text-right">

                                    <div className="text-xs uppercase text-white/60">
                                        Tip document
                                    </div>

                                    <div className="text-2xl font-bold text-white mt-1">
                                        {
                                            documentLabelUpper
                                        }
                                    </div>

                                </div>

                            </div>

                        </div>
                    </div>


                    <form onSubmit={submit}>

                        {/* ======================================================
                             INFORMAȚII GENERALE
                        ======================================================= */}

                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

                            <div className="bg-slate-100 px-6 py-5 border-b border-slate-200">

                                <h2 className="text-xl font-bold text-slate-900">
                                    Informații generale
                                </h2>

                                <p className="text-sm text-slate-500 mt-1">
                                    Datele principale ale documentului
                                </p>

                            </div>

                            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

                                {templateMode ? (
                                    <div className="lg:col-span-2">

                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Nume șablon *
                                        </label>

                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData("name", e.target.value)}
                                            placeholder="Ex: Ofertă standard instalație apartament"
                                            className="w-full rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />

                                        {errors.name && (
                                            <div className="text-red-600 text-sm mt-1">
                                                {errors.name}
                                            </div>
                                        )}

                                    </div>
                                ) : (
                                <div>

                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Client *
                                    </label>

                                    <select
                                        value={
                                            data.client_id
                                        }
                                        onChange={(e) =>
                                            setData(
                                                "client_id",
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    >

                                        <option value="">
                                            Selectează clientul
                                        </option>

                                        {clients.map(
                                            (
                                                client
                                            ) => (
                                                <option
                                                    key={
                                                        client.id
                                                    }
                                                    value={
                                                        client.id
                                                    }
                                                >
                                                    {
                                                        client.name
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>

                                    {errors.client_id && (
                                        <div className="text-red-600 text-sm mt-1">
                                            {
                                                errors.client_id
                                            }
                                        </div>
                                    )}

                                </div>
                                )}


                                {/* DATA */}

                                <div>

                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Data *
                                    </label>

                                    <input
                                        type="date"
                                        value={
                                            data.date
                                        }
                                        onChange={(e) =>
                                            setData(
                                                "date",
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />

                                    {errors.date && (
                                        <div className="text-red-600 text-sm mt-1">
                                            {
                                                errors.date
                                            }
                                        </div>
                                    )}

                                </div>


                                {/* TITLU */}

                                <div className="lg:col-span-2">

                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Obiect / Titlu *
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            data.title
                                        }
                                        onChange={(e) =>
                                            setData(
                                                "title",
                                                e.target.value
                                            )
                                        }
                                        placeholder={
                                            isDeviz
                                                ? "Ex: Instalație electrică apartament"
                                                : "Ex: Ofertă instalație electrică"
                                        }
                                        className="w-full rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />

                                    {errors.title && (
                                        <div className="text-red-600 text-sm mt-1">
                                            {
                                                errors.title
                                            }
                                        </div>
                                    )}

                                </div>


                                {/* LICENTA */}

                                <div>

                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Licență / Autorizație
                                    </label>

                                    <select
                                        value={
                                            data.license_id
                                        }
                                        onChange={(e) =>
                                            setData(
                                                "license_id",
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    >

                                        <option value="">
                                            Fără licență
                                        </option>

                                        {licenses.map(
                                            (
                                                license
                                            ) => (
                                                <option
                                                    key={
                                                        license.id
                                                    }
                                                    value={
                                                        license.id
                                                    }
                                                >
                                                    {
                                                        license.name
                                                    }

                                                    {license.code
                                                        ? ` (${license.code})`
                                                        : ""}
                                                </option>
                                            )
                                        )}

                                    </select>

                                    {errors.license_id && (
                                        <div className="text-red-600 text-sm mt-1">
                                            {
                                                errors.license_id
                                            }
                                        </div>
                                    )}

                                </div>


                                {/* LUCRARE */}

                                <div>

                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Lucrare asociată
                                    </label>

                                    <select
                                        value={
                                            data.work_order_id
                                        }
                                        onChange={(e) =>
                                            setData(
                                                "work_order_id",
                                                e.target.value
                                            )
                                        }
                                        className="w-full rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    >

                                        <option value="">
                                            Fără lucrare
                                        </option>

                                        {workOrders.map(
                                            (
                                                workOrder
                                            ) => (
                                                <option
                                                    key={
                                                        workOrder.id
                                                    }
                                                    value={
                                                        workOrder.id
                                                    }
                                                >
                                                    {
                                                        workOrder.number
                                                    }

                                                    {workOrder.client?.name
                                                        ? ` — ${workOrder.client.name}`
                                                        : ""}
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>


                                {/* LUCRARE SELECTATA */}

                                {selectedWorkOrder && (
                                    <div className="lg:col-span-2 bg-purple-50 border border-purple-200 rounded-xl p-5">

                                        <div className="text-xs uppercase tracking-wide text-purple-600 font-semibold">
                                            Lucrare asociată
                                        </div>

                                        <div className="text-lg font-bold text-purple-950 mt-1">
                                            {
                                                selectedWorkOrder.number
                                            }
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-3 mt-3 text-sm text-purple-900">

                                            <div>
                                                <span className="font-semibold">
                                                    Client:
                                                </span>{" "}
                                                {
                                                    selectedWorkOrder.client?.name ||
                                                    selectedClient?.name ||
                                                    "-"
                                                }
                                            </div>

                                            <div>
                                                <span className="font-semibold">
                                                    Adresă:
                                                </span>{" "}
                                                {
                                                    selectedWorkOrder.address ||
                                                    "-"
                                                }
                                            </div>

                                            <div>
                                                <span className="font-semibold">
                                                    Data:
                                                </span>{" "}
                                                {
                                                    selectedWorkOrder.scheduled_date ||
                                                    "-"
                                                }
                                            </div>

                                        </div>

                                    </div>
                                )}


                                {/* CLIENT SELECTAT */}

                                {selectedClient && (
                                    <div className="lg:col-span-2 bg-blue-50 border border-blue-200 rounded-xl p-5">

                                        <div className="text-xs uppercase tracking-wide text-blue-600 font-semibold">
                                            Client selectat
                                        </div>

                                        <div className="text-lg font-bold text-blue-950 mt-1">
                                            {
                                                selectedClient.name
                                            }
                                        </div>

                                        <div className="grid md:grid-cols-4 gap-3 mt-3 text-sm text-blue-900">

                                            <div>
                                                <span className="font-semibold">
                                                    CUI:
                                                </span>{" "}
                                                {
                                                    selectedClient.cui ||
                                                    "-"
                                                }
                                            </div>

                                            <div>
                                                <span className="font-semibold">
                                                    Telefon:
                                                </span>{" "}
                                                {
                                                    selectedClient.phone ||
                                                    "-"
                                                }
                                            </div>

                                            <div>
                                                <span className="font-semibold">
                                                    Email:
                                                </span>{" "}
                                                {
                                                    selectedClient.email ||
                                                    "-"
                                                }
                                            </div>

                                            <div>
                                                <span className="font-semibold">
                                                    Adresă:
                                                </span>{" "}
                                                {
                                                    selectedClient.address ||
                                                    "-"
                                                }
                                            </div>

                                        </div>


                                        {/* STATUT TVA */}

                                        <div
                                            className={
                                                "mt-4 rounded-xl px-4 py-3 border font-semibold " +
                                                (
                                                    isVatRegistered
                                                        ? "bg-green-50 border-green-200 text-green-800"
                                                        : "bg-amber-50 border-amber-200 text-amber-800"
                                                )
                                            }
                                        >

                                            <div className="flex items-center justify-between gap-4">

                                                <span>
                                                    {isVatRegistered
                                                        ? "✓"
                                                        : "✓"}{" "}
                                                    {vatStatusLabel}
                                                </span>

                                                <span className="font-bold">
                                                    TVA:{" "}
                                                    {
                                                        automaticVatRate
                                                    }%
                                                </span>

                                            </div>

                                        </div>

                                    </div>
                                )}

                            </div>

                        </div>


                        {/* ======================================================
                             ARTICOLE
                        ======================================================= */}

                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mt-8">

                            <div className="bg-slate-100 px-6 py-5 border-b border-slate-200">

                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                                    <div>

                                        <h2 className="text-xl font-bold text-slate-900">
                                            Materiale și manoperă
                                        </h2>

                                        <p className="text-sm text-slate-500 mt-1">
                                            Adaugă toate pozițiile din{" "}
                                            {
                                                documentLabel.toLowerCase()
                                            }
                                        </p>

                                    </div>

                                </div>

                            </div>


                            <div className="p-6">

                                <div className="space-y-5">

                                    {data.items.map(
                                        (
                                            item,
                                            index
                                        ) => (
                                            <div
                                                key={
                                                    item.id ??
                                                    `new-${index}`
                                                }
                                                className="border border-slate-200 rounded-2xl p-5 bg-slate-50"
                                            >

                                                <div className="flex items-center justify-between mb-4">

                                                    <div className="flex items-center gap-3">

                                                        <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
                                                            {
                                                                index +
                                                                1
                                                            }
                                                        </div>

                                                        <span
                                                            className={
                                                                "px-3 py-1 rounded-full text-xs font-bold " +
                                                                (
                                                                    item.type ===
                                                                    "manopera"
                                                                        ? "bg-purple-100 text-purple-700"
                                                                        : "bg-blue-100 text-blue-700"
                                                                )
                                                            }
                                                        >
                                                            {
                                                                item.type ===
                                                                "manopera"
                                                                    ? "MANOPERĂ"
                                                                    : "MATERIAL"
                                                            }
                                                        </span>

                                                    </div>


                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeItem(
                                                                index
                                                            )
                                                        }
                                                        className="text-red-600 hover:text-red-800 font-semibold"
                                                    >
                                                        🗑️ Șterge
                                                    </button>

                                                </div>


                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">

                                                    {/* PRODUS */}

                                                    <div className="lg:col-span-2">

                                                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                                                            Produs
                                                        </label>

                                                        <select
                                                            value={
                                                                item.product_id
                                                            }
                                                            onChange={(e) =>
                                                                handleProductChange(
                                                                    index,
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-full rounded-xl border-slate-300"
                                                        >

                                                            <option value="">
                                                                Produs manual
                                                            </option>

                                                            {products.map(
                                                                (
                                                                    product
                                                                ) => (
                                                                    <option
                                                                        key={
                                                                            product.id
                                                                        }
                                                                        value={
                                                                            product.id
                                                                        }
                                                                    >
                                                                        {
                                                                            product.name
                                                                        }
                                                                    </option>
                                                                )
                                                            )}

                                                        </select>

                                                    </div>


                                                    {/* DENUMIRE */}

                                                    <div className="lg:col-span-2">

                                                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                                                            Denumire *
                                                        </label>

                                                        <input
                                                            type="text"
                                                            value={
                                                                item.name
                                                            }
                                                            onChange={(e) =>
                                                                updateItem(
                                                                    index,
                                                                    "name",
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-full rounded-xl border-slate-300"
                                                            required
                                                        />

                                                    </div>


                                                    {/* UM */}

                                                    <div>

                                                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                                                            UM *
                                                        </label>

                                                        <input
                                                            type="text"
                                                            value={
                                                                item.unit
                                                            }
                                                            onChange={(e) =>
                                                                updateItem(
                                                                    index,
                                                                    "unit",
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-full rounded-xl border-slate-300"
                                                            required
                                                        />

                                                    </div>


                                                    {/* CANTITATE */}

                                                    <div>

                                                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                                                            Cantitate *
                                                        </label>

                                                        <input
                                                            type="number"
                                                            min="0.01"
                                                            step="0.01"
                                                            value={
                                                                item.quantity
                                                            }
                                                            onChange={(e) =>
                                                                updateItem(
                                                                    index,
                                                                    "quantity",
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-full rounded-xl border-slate-300"
                                                            required
                                                        />

                                                    </div>


                                                    {/* PRET */}

                                                    <div>

                                                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                                                            Preț unitar *
                                                        </label>

                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={
                                                                item.unit_price
                                                            }
                                                            onChange={(e) =>
                                                                updateItem(
                                                                    index,
                                                                    "unit_price",
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-full rounded-xl border-slate-300"
                                                            required
                                                        />

                                                    </div>


                                                    {/* DISCOUNT */}

                                                    <div>

                                                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                                                            Discount %
                                                        </label>

                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            step="0.01"
                                                            value={
                                                                item.discount
                                                            }
                                                            onChange={(e) =>
                                                                updateItem(
                                                                    index,
                                                                    "discount",
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-full rounded-xl border-slate-300"
                                                        />

                                                    </div>


                                                    {/* TOTAL */}

                                                    <div>

                                                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                                                            Total
                                                        </label>

                                                        <div className="h-[42px] rounded-xl bg-white border border-slate-200 flex items-center justify-end px-4 font-bold text-slate-900">
                                                            {
                                                                formatMoney(
                                                                    itemTotal(
                                                                        item
                                                                    )
                                                                )
                                                            }{" "}
                                                            lei
                                                        </div>

                                                    </div>

                                                </div>

                                            </div>
                                        )
                                    )}

                                </div>

                                {data.items.length === 0 && (
                                    <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                                        Nu ai adăugat încă poziții. Completează formularul de mai jos.
                                    </div>
                                )}

                                <div className="mt-6 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50 p-5">
                                    <div className="mb-4">
                                        <h3 className="font-bold text-slate-900">
                                            + Adaugă poziție
                                        </h3>
                                        <p className="mt-1 text-sm text-slate-600">
                                            După adăugare, formularul se golește pentru următorul produs sau serviciu.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
                                        <div>
                                            <label className="mb-1 block text-xs font-semibold text-slate-600">Tip</label>
                                            <select value={draftItem.type} onChange={(e) => setDraftItem(emptyDraftItem(e.target.value))} className="w-full rounded-xl border-slate-300">
                                                <option value="material">Material</option>
                                                <option value="manopera">Manoperă</option>
                                            </select>
                                        </div>

                                        {draftItem.type === "material" && (
                                            <div className="lg:col-span-2">
                                                <label className="mb-1 block text-xs font-semibold text-slate-600">Produs existent</label>
                                                <select value={draftItem.product_id} onChange={(e) => selectDraftProduct(e.target.value)} className="w-full rounded-xl border-slate-300">
                                                    <option value="">Produs manual</option>
                                                    {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
                                                </select>
                                            </div>
                                        )}

                                        <div className={draftItem.type === "material" ? "lg:col-span-2" : "lg:col-span-3"}>
                                            <label className="mb-1 block text-xs font-semibold text-slate-600">Denumire</label>
                                            <input type="text" value={draftItem.name} onChange={(e) => updateDraftItem("name", e.target.value)} placeholder={draftItem.type === "manopera" ? "Ex: Montaj tablou electric" : "Denumire produs"} className="w-full rounded-xl border-slate-300" />
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-semibold text-slate-600">UM</label>
                                            <input type="text" value={draftItem.unit} onChange={(e) => updateDraftItem("unit", e.target.value)} className="w-full rounded-xl border-slate-300" />
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-semibold text-slate-600">Cantitate</label>
                                            <input type="number" min="0.01" step="0.01" value={draftItem.quantity} onChange={(e) => updateDraftItem("quantity", e.target.value)} className="w-full rounded-xl border-slate-300" />
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-semibold text-slate-600">Preț unitar</label>
                                            <input type="number" min="0" step="0.01" value={draftItem.unit_price} onChange={(e) => updateDraftItem("unit_price", e.target.value)} className="w-full rounded-xl border-slate-300" />
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-semibold text-slate-600">Discount %</label>
                                            <input type="number" min="0" max="100" step="0.01" value={draftItem.discount} onChange={(e) => updateDraftItem("discount", e.target.value)} className="w-full rounded-xl border-slate-300" />
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                        <div className="font-semibold text-slate-700">
                                            Total poziție: {formatMoney(itemTotal(draftItem))} lei
                                        </div>
                                        <button type="button" onClick={addDraftItem} className={draftItem.type === "manopera" ? "rounded-xl bg-purple-600 px-5 py-3 font-bold text-white hover:bg-purple-700" : "rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700"}>
                                            + Adaugă {draftItem.type === "manopera" ? "manoperă" : "material"}
                                        </button>
                                    </div>
                                </div>

                            </div>

                        </div>


                        {/* ======================================================
                             TOTALURI
                        ======================================================= */}

                        <div className="grid lg:grid-cols-2 gap-8 mt-8">

                            {/* OBSERVATII */}

                            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

                                <div className="bg-slate-100 px-6 py-5 border-b border-slate-200">

                                    <h2 className="text-xl font-bold text-slate-900">
                                        Observații / condiții
                                    </h2>

                                </div>

                                <div className="p-6">

                                    <textarea
                                        value={
                                            data.notes
                                        }
                                        onChange={(e) =>
                                            setData(
                                                "notes",
                                                e.target.value
                                            )
                                        }
                                        rows={8}
                                        placeholder="Observații, condiții de plată, termen de execuție etc."
                                        className="w-full rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                                    />

                                </div>

                            </div>


                            {/* CALCUL */}

                            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

                                <div className="bg-slate-100 px-6 py-5 border-b border-slate-200">

                                    <h2 className="text-xl font-bold text-slate-900">
                                        Calcul document
                                    </h2>

                                </div>

                                <div className="p-6">

                                    <div className="flex justify-between py-2">

                                        <span className="text-slate-600">
                                            Subtotal
                                        </span>

                                        <span className="font-semibold">
                                            {
                                                formatMoney(
                                                    subtotal
                                                )
                                            }{" "}
                                            lei
                                        </span>

                                    </div>


                                    <div className="flex items-center justify-between py-3">

                                        <label className="text-slate-600">
                                            Discount general %
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.01"
                                            value={
                                                data.discount
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    "discount",
                                                    e.target.value
                                                )
                                            }
                                            className="w-28 rounded-xl border-slate-300 text-right"
                                        />

                                    </div>


                                    {generalDiscountRate >
                                        0 && (
                                        <div className="flex justify-between py-2 text-red-600">

                                            <span>
                                                Discount
                                            </span>

                                            <span className="font-semibold">
                                                -{" "}
                                                {
                                                    formatMoney(
                                                        generalDiscount
                                                    )
                                                }{" "}
                                                lei
                                            </span>

                                        </div>
                                    )}


                                    {/* TVA AUTOMAT */}

                                    <div className="mt-3 border-t pt-4">

                                        <div
                                            className={
                                                "rounded-xl border px-4 py-3 " +
                                                (
                                                    isVatRegistered
                                                        ? "bg-green-50 border-green-200"
                                                        : "bg-amber-50 border-amber-200"
                                                )
                                            }
                                        >

                                            <div className="flex items-center justify-between gap-4">

                                                <div>

                                                    <div
                                                        className={
                                                            "text-sm font-bold " +
                                                            (
                                                                isVatRegistered
                                                                    ? "text-green-800"
                                                                    : "text-amber-800"
                                                            )
                                                        }
                                                    >
                                                        {vatStatusLabel}
                                                    </div>

                                                    <div
                                                        className={
                                                            "text-xs mt-1 " +
                                                            (
                                                                isVatRegistered
                                                                    ? "text-green-700"
                                                                    : "text-amber-700"
                                                            )
                                                        }
                                                    >
                                                        TVA stabilită automat din statutul clientului.
                                                    </div>

                                                </div>

                                                <div
                                                    className={
                                                        "text-xl font-bold whitespace-nowrap " +
                                                        (
                                                            isVatRegistered
                                                                ? "text-green-700"
                                                                : "text-amber-700"
                                                        )
                                                    }
                                                >
                                                    {automaticVatRate}%
                                                </div>

                                            </div>

                                        </div>

                                    </div>


                                    <div className="flex justify-between py-3">

                                        <span className="text-slate-600">
                                            Total fără TVA
                                        </span>

                                        <span className="font-semibold">
                                            {
                                                formatMoney(
                                                    taxable
                                                )
                                            }{" "}
                                            lei
                                        </span>

                                    </div>


                                    {vatRate > 0 && (
                                        <div className="flex justify-between py-2">

                                            <span className="text-slate-600">
                                                TVA{" "}
                                                {
                                                    vatRate
                                                }%
                                            </span>

                                            <span className="font-semibold">
                                                {
                                                    formatMoney(
                                                        vat
                                                    )
                                                }{" "}
                                                lei
                                            </span>

                                        </div>
                                    )}


                                    <div className="border-t-2 border-slate-900 mt-4 pt-5 flex justify-between items-center">

                                        <span className="text-xl font-bold">
                                            {
                                                isVatRegistered
                                                    ? "TOTAL"
                                                    : "TOTAL CU TVA"
                                            }
                                        </span>

                                        <span
                                            className={
                                                "text-2xl font-bold " +
                                                (
                                                    isDeviz
                                                        ? "text-purple-600"
                                                        : "text-blue-600"
                                                )
                                            }
                                        >
                                            {
                                                formatMoney(
                                                    total
                                                )
                                            }{" "}
                                            lei
                                        </span>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* ERORI */}

                        {Object.keys(
                            errors
                        ).length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mt-8">

                                <div className="font-bold text-red-800 mb-3">
                                    Verifică datele introduse
                                </div>

                                <div className="space-y-1 text-sm text-red-700">

                                    {Object.entries(
                                        errors
                                    ).map(
                                        (
                                            [
                                                key,
                                                value,
                                            ]
                                        ) => (
                                            <div
                                                key={
                                                    key
                                                }
                                            >
                                                •{" "}
                                                {
                                                    value
                                                }
                                            </div>
                                        )
                                    )}

                                </div>

                            </div>
                        )}


                        {/* BUTOANE */}

                        <div className="flex flex-wrap justify-end gap-3 mt-8">

                            <Link
                                href={route(
                                    templateMode
                                        ? "quote-templates.index"
                                        : "quotes.index"
                                )}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold"
                            >
                                ← Renunță
                            </Link>

                            <button
                                type="submit"
                                disabled={
                                    processing
                                }
                                className={
                                    "text-white px-7 py-3 rounded-xl font-bold shadow-lg disabled:opacity-50 " +
                                    (
                                        isDeviz
                                            ? "bg-purple-600 hover:bg-purple-700"
                                            : "bg-blue-600 hover:bg-blue-700"
                                    )
                                }
                            >
                                {processing
                                    ? "Se salvează..."
                                    : templateMode
                                    ? "💾 Salvează șablonul"
                                    : prefill?.id
                                    ? "💾 Salvează modificările"
                                    : `💾 Salvează ${documentLabel.toLowerCase()}`}
                            </button>

                        </div>

                    </form>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
