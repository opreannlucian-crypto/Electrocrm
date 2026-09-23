import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useMemo, useState } from "react";

export default function Edit({
    quote,
    clients = [],
    licenses = [],
    products = [],
}) {
    const isDeviz = quote?.type === "deviz";
    const typeLabel = isDeviz ? "deviz" : "ofertă";
    const typeLabelCapital = isDeviz ? "Deviz" : "Ofertă";

    const initialItems =
        quote?.items?.length > 0
            ? quote.items.map((item) => ({
                  product_id: item.product_id ?? "",
                  type: item.type ?? "material",
                  name: item.name ?? "",
                  unit: item.unit ?? "buc",
                  quantity: item.quantity ?? 1,
                  unit_price: item.unit_price ?? 0,
                  discount: item.discount ?? 0,
              }))
            : [
                  {
                      product_id: "",
                      type: "material",
                      name: "",
                      unit: "buc",
                      quantity: 1,
                      unit_price: 0,
                      discount: 0,
                  },
              ];

    /*
    |--------------------------------------------------------------------------
    | FORMULAR
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    | type este obligatoriu pentru QuoteController@update().
    | Înainte lipsea și de aici nu se salva editarea.
    |
    */

    const {
        data,
        setData,
        put,
        processing,
        errors,
    } = useForm({
        type: quote?.type ?? "oferta",

        work_order_id:
            quote?.work_order_id ?? "",

        client_id:
            quote?.client_id ?? "",

        license_id:
            quote?.license_id ?? "",

        title:
            quote?.title ?? "",

        date: quote?.date
            ? String(quote.date).substring(0, 10)
            : "",

        discount:
            quote?.discount ?? 0,

        vat_rate:
            quote?.vat_rate ?? 21,

        notes:
            quote?.notes ?? "",

        items: initialItems,
    });

    const [productSearch, setProductSearch] =
        useState({});

    function updateItem(index, field, value) {
        const items = [...data.items];

        items[index] = {
            ...items[index],
            [field]: value,
        };

        setData("items", items);
    }

    function getProductCode(product) {
        return (
            product?.code ??
            product?.product_code ??
            product?.sku ??
            product?.ean ??
            product?.barcode ??
            ""
        );
    }

    function getProductEan(product) {
        return (
            product?.ean ??
            product?.barcode ??
            product?.ean_code ??
            ""
        );
    }

    function selectProduct(index, productId) {
        const product = products.find(
            (item) =>
                String(item.id) ===
                String(productId)
        );

        if (!product) {
            updateItem(
                index,
                "product_id",
                ""
            );
            return;
        }

        const items = [...data.items];

        items[index] = {
            ...items[index],

            product_id: product.id,

            type: "material",

            name:
                product.name ?? "",

            unit:
                product.unit ?? "buc",

            unit_price:
                product.sale_price ?? 0,
        };

        setData("items", items);

        setProductSearch((current) => ({
            ...current,
            [index]: "",
        }));
    }

    function addItem(type = "material") {
        const newIndex =
            data.items.length;

        setData("items", [
            ...data.items,

            {
                product_id: "",

                type,

                name: "",

                unit:
                    type === "manopera"
                        ? "ore"
                        : "buc",

                quantity: 1,

                unit_price: 0,

                discount: 0,
            },
        ]);

        setProductSearch((current) => ({
            ...current,
            [newIndex]: "",
        }));
    }

    function removeItem(index) {
        if (data.items.length === 1) {
            return;
        }

        setData(
            "items",
            data.items.filter(
                (_, i) => i !== index
            )
        );

        setProductSearch((current) => {
            const updated = {};

            Object.keys(current).forEach(
                (key) => {
                    const numericKey =
                        Number(key);

                    if (
                        numericKey < index
                    ) {
                        updated[numericKey] =
                            current[key];
                    }

                    if (
                        numericKey > index
                    ) {
                        updated[
                            numericKey - 1
                        ] = current[key];
                    }
                }
            );

            return updated;
        });
    }

    function itemTotal(item) {
        const quantity =
            Number(item.quantity) || 0;

        const price =
            Number(item.unit_price) || 0;

        const discount =
            Number(item.discount) || 0;

        const subtotal =
            quantity * price;

        return (
            subtotal -
            (subtotal * discount) / 100
        );
    }

    const materials = useMemo(() => {
        return data.items
            .filter(
                (item) =>
                    item.type ===
                    "material"
            )
            .reduce(
                (total, item) =>
                    total +
                    itemTotal(item),
                0
            );
    }, [data.items]);

    const labor = useMemo(() => {
        return data.items
            .filter(
                (item) =>
                    item.type ===
                    "manopera"
            )
            .reduce(
                (total, item) =>
                    total +
                    itemTotal(item),
                0
            );
    }, [data.items]);

    const itemsSubtotal =
        materials + labor;

    const globalDiscount =
        (itemsSubtotal *
            Number(
                data.discount || 0
            )) /
        100;

    const taxable =
        itemsSubtotal -
        globalDiscount;

    const vat =
        (taxable *
            Number(
                data.vat_rate || 0
            )) /
        100;

    const total =
        taxable + vat;

    function formatMoney(value) {
        return Number(
            value
        ).toLocaleString(
            "ro-RO",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        );
    }

    function getFilteredProducts(index) {
        const search = String(
            productSearch[index] ?? ""
        )
            .trim()
            .toLowerCase();

        if (!search) {
            return products.slice(
                0,
                50
            );
        }

        return products
            .filter((product) => {
                const name =
                    String(
                        product?.name ??
                            ""
                    ).toLowerCase();

                const code =
                    String(
                        getProductCode(
                            product
                        )
                    ).toLowerCase();

                const ean =
                    String(
                        getProductEan(
                            product
                        )
                    ).toLowerCase();

                return (
                    name.includes(
                        search
                    ) ||
                    code.includes(
                        search
                    ) ||
                    ean.includes(
                        search
                    )
                );
            })
            .slice(0, 50);
    }

    function submit(event) {
        event.preventDefault();

        /*
        |--------------------------------------------------------------------------
        | Trimitem explicit type
        |--------------------------------------------------------------------------
        */

        setData(
            "type",
            quote?.type ?? "oferta"
        );

        put(
            route(
                "quotes.update",
                quote.id
            )
        );
    }

    return (
        <AuthenticatedLayout>
            <Head
                title={`Editare ${typeLabel}`}
            />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    <div className="bg-white shadow-xl rounded-2xl overflow-hidden">

                        {/* HEADER */}

                        <div
                            className={
                                isDeviz
                                    ? "bg-purple-900 text-white px-8 py-7"
                                    : "bg-slate-900 text-white px-8 py-7"
                            }
                        >
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                                <div>

                                    <p className="text-sm text-slate-300">
                                        CRM • Electrodep
                                    </p>

                                    <h1 className="text-3xl font-bold mt-1">
                                        Editare{" "}
                                        {typeLabelCapital}
                                    </h1>

                                    <p className="text-slate-300 mt-2">
                                        {
                                            quote?.number
                                        }
                                    </p>

                                </div>

                                <div className="text-left md:text-right">

                                    <p className="text-sm text-slate-300">
                                        Total{" "}
                                        {typeLabel}
                                    </p>

                                    <p className="text-2xl font-bold">
                                        {
                                            formatMoney(
                                                total
                                            )
                                        }{" "}
                                        lei
                                    </p>

                                </div>

                            </div>
                        </div>

                        <form onSubmit={submit}>

                            <div className="p-8">

                                {/* DATE GENERALE */}

                                <div className="mb-6">

                                    <h2 className="text-lg font-bold text-slate-900">
                                        Date{" "}
                                        {typeLabel}
                                    </h2>

                                    <p className="text-sm text-gray-500 mt-1">
                                        Datele principale ale documentului
                                    </p>

                                </div>

                                <div className="grid md:grid-cols-3 gap-6 mb-8">

                                    {/* CLIENT */}

                                    <div>

                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Client *
                                        </label>

                                        <select
                                            value={
                                                data.client_id
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    "client_id",
                                                    e
                                                        .target
                                                        .value
                                                )
                                            }
                                            className="w-full rounded-xl border-gray-300 shadow-sm"
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
                                            <p className="text-red-600 text-sm mt-1">
                                                {
                                                    errors.client_id
                                                }
                                            </p>
                                        )}

                                    </div>

                                    {/* LICENTA / AUTORIZATIE */}

                                    <div>

                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Licență / Autorizație
                                        </label>

                                        <select
                                            value={
                                                data.license_id
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    "license_id",
                                                    e
                                                        .target
                                                        .value
                                                )
                                            }
                                            className="w-full rounded-xl border-gray-300 shadow-sm"
                                        >

                                            <option value="">
                                                Fără licență / autorizație
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
                                                            ? ` - ${license.code}`
                                                            : ""}
                                                    </option>
                                                )
                                            )}

                                        </select>

                                        {errors.license_id && (
                                            <p className="text-red-600 text-sm mt-1">
                                                {
                                                    errors.license_id
                                                }
                                            </p>
                                        )}

                                    </div>

                                    {/* DATA */}

                                    <div>

                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                                                    e
                                                        .target
                                                        .value
                                                )
                                            }
                                            className="w-full rounded-xl border-gray-300 shadow-sm"
                                        />

                                        {errors.date && (
                                            <p className="text-red-600 text-sm mt-1">
                                                {
                                                    errors.date
                                                }
                                            </p>
                                        )}

                                    </div>

                                </div>

                                {/* TITLU */}

                                <div className="mb-8">

                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Titlu{" "}
                                        {typeLabel}{" "}
                                        *
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            data.title
                                        }
                                        onChange={(e) =>
                                            setData(
                                                "title",
                                                e
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="Ex: Instalare sistem supraveghere video"
                                        className="w-full rounded-xl border-gray-300 shadow-sm"
                                    />

                                    {errors.title && (
                                        <p className="text-red-600 text-sm mt-1">
                                            {
                                                errors.title
                                            }
                                        </p>
                                    )}

                                </div>

                                {/* LICENTA SELECTATA */}

                                {data.license_id && (
                                    <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-4">

                                        <div className="text-sm text-blue-600 font-semibold">
                                            Licență / Autorizație selectată
                                        </div>

                                        <div className="text-lg font-bold text-blue-900 mt-1">

                                            {
                                                licenses.find(
                                                    (
                                                        license
                                                    ) =>
                                                        String(
                                                            license.id
                                                        ) ===
                                                        String(
                                                            data.license_id
                                                        )
                                                )?.name
                                            }

                                        </div>

                                        {licenses.find(
                                            (
                                                license
                                            ) =>
                                                String(
                                                    license.id
                                                ) ===
                                                String(
                                                    data.license_id
                                                )
                                        )?.code && (
                                            <div className="text-sm text-blue-700 mt-1">

                                                Cod:{" "}

                                                {
                                                    licenses.find(
                                                        (
                                                            license
                                                        ) =>
                                                            String(
                                                                license.id
                                                            ) ===
                                                            String(
                                                                data.license_id
                                                            )
                                                    )?.code
                                                }

                                            </div>
                                        )}

                                    </div>
                                )}

                                {/* DISCOUNT / TVA */}

                                <div className="grid md:grid-cols-2 gap-6 mb-8">

                                    <div>

                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Discount general (%)
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={
                                                data.discount
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    "discount",
                                                    e
                                                        .target
                                                        .value
                                                )
                                            }
                                            className="w-full rounded-xl border-gray-300 shadow-sm"
                                        />

                                    </div>

                                    <div>

                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            TVA (%)
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={
                                                data.vat_rate
                                            }
                                            onChange={(e) =>
                                                setData(
                                                    "vat_rate",
                                                    e
                                                        .target
                                                        .value
                                                )
                                            }
                                            className="w-full rounded-xl border-gray-300 shadow-sm"
                                        />

                                    </div>

                                </div>

                                {/* PRODUSE */}

                                <div className="border rounded-2xl overflow-hidden">

                                    <div className="bg-gray-50 px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                                        <div>

                                            <h2 className="font-bold text-lg">
                                                Produse, materiale și manoperă
                                            </h2>

                                            <p className="text-sm text-gray-500 mt-1">
                                                Caută produsele după denumire, cod sau EAN
                                            </p>

                                        </div>

                                        <div className="flex flex-wrap gap-2">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    addItem(
                                                        "material"
                                                    )
                                                }
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
                                            >
                                                + Material
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    addItem(
                                                        "manopera"
                                                    )
                                                }
                                                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold"
                                            >
                                                + Manoperă
                                            </button>

                                        </div>

                                    </div>

                                    <div className="overflow-x-auto">

                                        <table className="w-full">

                                            <thead className="bg-gray-100">

                                                <tr>

                                                    <th className="text-left px-4 py-3">
                                                        Tip
                                                    </th>

                                                    <th className="text-left px-4 py-3 min-w-[360px]">
                                                        Produs / Denumire
                                                    </th>

                                                    <th className="text-left px-4 py-3">
                                                        UM
                                                    </th>

                                                    <th className="text-left px-4 py-3">
                                                        Cant.
                                                    </th>

                                                    <th className="text-left px-4 py-3">
                                                        Preț unitar
                                                    </th>

                                                    <th className="text-left px-4 py-3">
                                                        Disc. %
                                                    </th>

                                                    <th className="text-right px-4 py-3">
                                                        Total
                                                    </th>

                                                    <th></th>

                                                </tr>

                                            </thead>

                                            <tbody>

                                                {data.items.map(
                                                    (
                                                        item,
                                                        index
                                                    ) => {

                                                        const selectedProduct =
                                                            products.find(
                                                                (
                                                                    product
                                                                ) =>
                                                                    String(
                                                                        product.id
                                                                    ) ===
                                                                    String(
                                                                        item.product_id
                                                                    )
                                                            );

                                                        const filteredProducts =
                                                            getFilteredProducts(
                                                                index
                                                            );

                                                        return (
                                                            <tr
                                                                key={
                                                                    index
                                                                }
                                                                className="border-t align-top"
                                                            >

                                                                {/* TIP */}

                                                                <td className="px-4 py-4">

                                                                    <select
                                                                        value={
                                                                            item.type
                                                                        }
                                                                        onChange={(e) =>
                                                                            updateItem(
                                                                                index,
                                                                                "type",
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                        className="rounded-lg border-gray-300"
                                                                    >

                                                                        <option value="material">
                                                                            Material
                                                                        </option>

                                                                        <option value="manopera">
                                                                            Manoperă
                                                                        </option>

                                                                    </select>

                                                                </td>

                                                                {/* PRODUS */}

                                                                <td className="px-4 py-4">

                                                                    {item.type ===
                                                                    "material" ? (
                                                                        <div>

                                                                            <div className="relative">

                                                                                <input
                                                                                    type="text"
                                                                                    value={
                                                                                        productSearch[
                                                                                            index
                                                                                        ] ??
                                                                                        ""
                                                                                    }
                                                                                    onChange={(e) =>
                                                                                        setProductSearch(
                                                                                            (
                                                                                                current
                                                                                            ) => ({
                                                                                                ...current,
                                                                                                [index]:
                                                                                                    e
                                                                                                        .target
                                                                                                        .value,
                                                                                            })
                                                                                        )
                                                                                    }
                                                                                    placeholder="🔎 Caută după nume, cod sau EAN..."
                                                                                    className="w-full rounded-lg border-gray-300 pr-10"
                                                                                />

                                                                                {productSearch[
                                                                                    index
                                                                                ] && (
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() =>
                                                                                            setProductSearch(
                                                                                                (
                                                                                                    current
                                                                                                ) => ({
                                                                                                    ...current,
                                                                                                    [index]:
                                                                                                        "",
                                                                                                })
                                                                                            )
                                                                                        }
                                                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                                                                                    >
                                                                                        ✕
                                                                                    </button>
                                                                                )}

                                                                            </div>

                                                                            <select
                                                                                value={
                                                                                    item.product_id
                                                                                }
                                                                                onChange={(e) =>
                                                                                    selectProduct(
                                                                                        index,
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                    )
                                                                                }
                                                                                className="w-full rounded-lg border-gray-300 mt-2"
                                                                            >

                                                                                <option value="">
                                                                                    {productSearch[
                                                                                        index
                                                                                    ]
                                                                                        ? "Selectează produsul găsit"
                                                                                        : "Selectează produs din stoc"}
                                                                                </option>

                                                                                {filteredProducts.map(
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

                                                                                            {getProductCode(
                                                                                                product
                                                                                            )
                                                                                                ? ` • Cod: ${getProductCode(
                                                                                                      product
                                                                                                  )}`
                                                                                                : ""}

                                                                                            {" • "}

                                                                                            {formatMoney(
                                                                                                product.sale_price
                                                                                            )}{" "}
                                                                                            lei
                                                                                        </option>
                                                                                    )
                                                                                )}

                                                                            </select>

                                                                            {productSearch[
                                                                                index
                                                                            ] &&
                                                                                filteredProducts.length ===
                                                                                    0 && (
                                                                                    <p className="text-sm text-red-600 mt-2">
                                                                                        Nu am găsit niciun produs.
                                                                                    </p>
                                                                                )}

                                                                            {selectedProduct && (
                                                                                <div className="mt-2 text-xs text-gray-500 space-y-1">

                                                                                    {getProductCode(
                                                                                        selectedProduct
                                                                                    ) && (
                                                                                        <div>
                                                                                            Cod:{" "}
                                                                                            <strong>
                                                                                                {getProductCode(
                                                                                                    selectedProduct
                                                                                                )}
                                                                                            </strong>
                                                                                        </div>
                                                                                    )}

                                                                                    {getProductEan(
                                                                                        selectedProduct
                                                                                    ) &&
                                                                                        getProductEan(
                                                                                            selectedProduct
                                                                                        ) !==
                                                                                            getProductCode(
                                                                                                selectedProduct
                                                                                            ) && (
                                                                                            <div>
                                                                                                EAN:{" "}
                                                                                                <strong>
                                                                                                    {getProductEan(
                                                                                                        selectedProduct
                                                                                                    )}
                                                                                                </strong>
                                                                                            </div>
                                                                                        )}

                                                                                    <div>
                                                                                        Stoc disponibil:{" "}
                                                                                        <strong>
                                                                                            {selectedProduct.stock_quantity ??
                                                                                                0}{" "}
                                                                                            {
                                                                                                item.unit
                                                                                            }
                                                                                        </strong>
                                                                                    </div>

                                                                                </div>
                                                                            )}

                                                                        </div>
                                                                    ) : (
                                                                        <input
                                                                            type="text"
                                                                            value={
                                                                                item.name
                                                                            }
                                                                            onChange={(e) =>
                                                                                updateItem(
                                                                                    index,
                                                                                    "name",
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                )
                                                                            }
                                                                            placeholder="Ex: Montaj tablou electric"
                                                                            className="w-full rounded-lg border-gray-300"
                                                                        />
                                                                    )}

                                                                </td>

                                                                {/* UM */}

                                                                <td className="px-4 py-4">

                                                                    <input
                                                                        type="text"
                                                                        value={
                                                                            item.unit
                                                                        }
                                                                        onChange={(e) =>
                                                                            updateItem(
                                                                                index,
                                                                                "unit",
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                        className="w-20 rounded-lg border-gray-300"
                                                                    />

                                                                </td>

                                                                {/* CANTITATE */}

                                                                <td className="px-4 py-4">

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
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                        className="w-24 rounded-lg border-gray-300"
                                                                    />

                                                                </td>

                                                                {/* PRET */}

                                                                <td className="px-4 py-4">

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
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                        className="w-28 rounded-lg border-gray-300"
                                                                    />

                                                                </td>

                                                                {/* DISCOUNT */}

                                                                <td className="px-4 py-4">

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
                                                                                e
                                                                                    .target
                                                                                    .value
                                                                            )
                                                                        }
                                                                        className="w-20 rounded-lg border-gray-300"
                                                                    />

                                                                </td>

                                                                {/* TOTAL */}

                                                                <td className="px-4 py-4 text-right font-semibold whitespace-nowrap">

                                                                    {
                                                                        formatMoney(
                                                                            itemTotal(
                                                                                item
                                                                            )
                                                                        )
                                                                    }{" "}
                                                                    lei

                                                                </td>

                                                                {/* STERGERE */}

                                                                <td className="px-4 py-4">

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            removeItem(
                                                                                index
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            data
                                                                                .items
                                                                                .length ===
                                                                            1
                                                                        }
                                                                        className="w-9 h-9 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-800 disabled:bg-gray-50 disabled:text-gray-300 font-bold"
                                                                        title="Șterge poziția"
                                                                    >
                                                                        ✕
                                                                    </button>

                                                                </td>

                                                            </tr>
                                                        );
                                                    }
                                                )}

                                            </tbody>

                                        </table>

                                    </div>

                                </div>

                                {/* OBSERVATII */}

                                <div className="mt-8">

                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Observații / condiții
                                    </label>

                                    <textarea
                                        rows="4"
                                        value={
                                            data.notes
                                        }
                                        onChange={(e) =>
                                            setData(
                                                "notes",
                                                e
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="Termen de execuție, condiții de plată, garanție etc."
                                        className="w-full rounded-xl border-gray-300 shadow-sm"
                                    />

                                </div>

                                {/* TOTALURI */}

                                <div className="mt-8 flex justify-end">

                                    <div className="w-full md:w-96 bg-gray-50 rounded-2xl p-6 border">

                                        <div className="flex justify-between py-2">

                                            <span>
                                                Materiale
                                            </span>

                                            <span className="font-semibold">
                                                {
                                                    formatMoney(
                                                        materials
                                                    )
                                                }{" "}
                                                lei
                                            </span>

                                        </div>

                                        <div className="flex justify-between py-2">

                                            <span>
                                                Manoperă
                                            </span>

                                            <span className="font-semibold">
                                                {
                                                    formatMoney(
                                                        labor
                                                    )
                                                }{" "}
                                                lei
                                            </span>

                                        </div>

                                        <div className="flex justify-between py-2 border-t mt-2">

                                            <span>
                                                Subtotal
                                            </span>

                                            <span className="font-semibold">
                                                {
                                                    formatMoney(
                                                        itemsSubtotal
                                                    )
                                                }{" "}
                                                lei
                                            </span>

                                        </div>

                                        <div className="flex justify-between py-2">

                                            <span>
                                                Discount (
                                                {
                                                    data.discount
                                                }
                                                %)
                                            </span>

                                            <span className="font-semibold text-red-600">
                                                -{" "}
                                                {
                                                    formatMoney(
                                                        globalDiscount
                                                    )
                                                }{" "}
                                                lei
                                            </span>

                                        </div>

                                        <div className="flex justify-between py-2">

                                            <span>
                                                TVA (
                                                {
                                                    data.vat_rate
                                                }
                                                %)
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

                                        <div className="border-t mt-3 pt-4 flex justify-between items-center">

                                            <span className="text-xl font-bold">
                                                TOTAL
                                            </span>

                                            <span className="text-2xl font-bold text-blue-600">
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

                                {/* BUTOANE */}

                                <div className="flex flex-wrap gap-3 mt-8">

                                    <button
                                        type="submit"
                                        disabled={
                                            processing
                                        }
                                        className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-7 py-3 rounded-xl font-semibold shadow-sm"
                                    >
                                        {processing
                                            ? "Se salvează..."
                                            : "💾 Salvează modificările"}
                                    </button>

                                    <Link
                                        href={route(
                                            "quotes.show",
                                            quote.id
                                        )}
                                        className="bg-gray-600 hover:bg-gray-700 text-white px-7 py-3 rounded-xl"
                                    >
                                        ⬅ Înapoi la{" "}
                                        {typeLabel}
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