import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import { useMemo } from "react";

export default function Edit({
    workOrder,
    clients = [],
    employees = [],
    licenses = [],
    products = [],
}) {
    const initialEmployeeIds =
        workOrder?.employees?.length > 0
            ? workOrder.employees.map((employee) => String(employee.id))
            : workOrder?.employee_id
                ? [String(workOrder.employee_id)]
                : [];

    const initialMaterials =
        workOrder?.materials_used?.map((material) => ({
            product_id: String(material.product_id),
            quantity: material.quantity ?? "",
        })) ?? [];

    const {
        data,
        setData,
        put,
        processing,
        errors,
    } = useForm({
        client_id: workOrder?.client_id ?? "",
        employee_id: workOrder?.employee_id
            ? String(workOrder.employee_id)
            : "",
        employee_ids: initialEmployeeIds,
        license_id: workOrder?.license_id
            ? String(workOrder.license_id)
            : "",
        type: workOrder?.type ?? "",
        priority: workOrder?.priority ?? "normal",
        status: workOrder?.status ?? "noua",
        scheduled_date: workOrder?.scheduled_date
            ? String(workOrder.scheduled_date).substring(0, 10)
            : "",
        scheduled_time: workOrder?.scheduled_time
            ? String(workOrder.scheduled_time).substring(0, 5)
            : "",
        address: workOrder?.address ?? "",
        contact_person: workOrder?.contact_person ?? "",
        phone: workOrder?.phone ?? "",
        description: workOrder?.description ?? "",
        materials: workOrder?.materials ?? "",
        materials_used: initialMaterials,
        notes: workOrder?.notes ?? "",
    });

    const selectedClient = clients.find(
        (client) => client.id == data.client_id
    );

    const totalMaterialsValue = useMemo(() => {
        return data.materials_used.reduce((total, item) => {
            const product = products.find(
                (productItem) =>
                    String(productItem.id) === String(item.product_id)
            );

            if (!product) {
                return total;
            }

            const quantity = Number(item.quantity || 0);
            const price = Number(product.purchase_price || 0);

            return total + quantity * price;
        }, 0);
    }, [data.materials_used, products]);

    function submit(e) {
        e.preventDefault();

        put(route("work_orders.update", workOrder.id));
    }

    function handleEmployeesChange(e) {
        const selectedIds = Array.from(
            e.target.selectedOptions,
            (option) => option.value
        );

        setData("employee_ids", selectedIds);

        setData(
            "employee_id",
            selectedIds.length > 0 ? selectedIds[0] : ""
        );
    }

    function addMaterial() {
        setData("materials_used", [
            ...data.materials_used,
            {
                product_id: "",
                quantity: "",
            },
        ]);
    }

    function removeMaterial(index) {
        const materials = [...data.materials_used];

        materials.splice(index, 1);

        setData("materials_used", materials);
    }

    function updateMaterial(index, field, value) {
        const materials = [...data.materials_used];

        materials[index] = {
            ...materials[index],
            [field]: value,
        };

        setData("materials_used", materials);
    }

    function getProduct(productId) {
        return products.find(
            (product) =>
                String(product.id) === String(productId)
        );
    }

    function formatNumber(value) {
        return Number(value || 0).toLocaleString("ro-RO", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }

    return (
        <AuthenticatedLayout>
            <Head title={`Editare lucrare ${workOrder?.number ?? ""}`} />

            <div className="py-8">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

                    <div className="overflow-hidden rounded-2xl bg-white shadow-xl">

                        {/* HEADER */}

                        <div className="border-b border-slate-200 px-6 py-7 sm:px-8">
                            <p className="text-sm font-medium text-slate-500">
                                CRM • Electrodep
                            </p>

                            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <h1 className="mt-1 text-3xl font-bold text-slate-900">
                                        Editează lucrarea
                                    </h1>

                                    <p className="mt-2 text-slate-500">
                                        {workOrder?.number || "Lucrare"}
                                    </p>
                                </div>

                                {data.employee_ids.length > 0 && (
                                    <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">
                                        <span className="font-bold">
                                            {data.employee_ids.length}
                                        </span>{" "}
                                        tehnicieni alocați
                                    </div>
                                )}
                            </div>
                        </div>

                        <form onSubmit={submit}>

                            {/* DATE GENERALE */}

                            <div className="px-6 py-7 sm:px-8">

                                <div className="mb-6">
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Date generale
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Clientul, tehnicienii și tipul lucrării.
                                    </p>
                                </div>

                                {/* CLIENT */}

                                <div className="mb-6">
                                    <label className="mb-2 block font-semibold text-slate-700">
                                        Client *
                                    </label>

                                    <select
                                        className="w-full rounded-xl border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={data.client_id}
                                        onChange={(e) =>
                                            setData(
                                                "client_id",
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="">
                                            Selectează client
                                        </option>

                                        {clients.map((client) => (
                                            <option
                                                key={client.id}
                                                value={client.id}
                                            >
                                                {client.name}
                                            </option>
                                        ))}
                                    </select>

                                    {errors.client_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.client_id}
                                        </p>
                                    )}
                                </div>

                                {/* DATE CLIENT */}

                                {selectedClient && (
                                    <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
                                        <h2 className="mb-3 font-bold text-blue-900">
                                            Date client
                                        </h2>

                                        <div className="grid gap-4 text-sm md:grid-cols-3">

                                            <div>
                                                <span className="font-semibold">
                                                    Telefon:
                                                </span>{" "}
                                                {selectedClient.phone || "-"}
                                            </div>

                                            <div>
                                                <span className="font-semibold">
                                                    Email:
                                                </span>{" "}
                                                {selectedClient.email || "-"}
                                            </div>

                                            <div>
                                                <span className="font-semibold">
                                                    Adresă:
                                                </span>{" "}
                                                {selectedClient.address || "-"}
                                            </div>

                                        </div>
                                    </div>
                                )}

                                {/* TEHNICIENI / LICENTA */}

                                <div className="mb-6 grid gap-5 md:grid-cols-2">

                                    {/* TEHNICIENI */}

                                    <div>
                                        <label className="mb-2 block font-semibold text-slate-700">
                                            Tehnicieni alocați
                                        </label>

                                        <select
                                            multiple
                                            className="min-h-[150px] w-full rounded-xl border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            value={data.employee_ids}
                                            onChange={handleEmployeesChange}
                                        >
                                            {employees.map((employee) => (
                                                <option
                                                    key={employee.id}
                                                    value={employee.id}
                                                >
                                                    {employee.name}
                                                </option>
                                            ))}
                                        </select>

                                        <div className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
                                            Ține apăsat{" "}
                                            <strong>Ctrl</strong> pe Windows
                                            sau{" "}
                                            <strong>Command</strong> pe Mac
                                            pentru a selecta mai mulți
                                            tehnicieni.
                                        </div>

                                        {data.employee_ids.length > 0 && (
                                            <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                                                <p className="text-sm font-semibold text-emerald-800">
                                                    Tehnicieni selectați:
                                                </p>

                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {data.employee_ids.map(
                                                        (employeeId) => {
                                                            const employee =
                                                                employees.find(
                                                                    (item) =>
                                                                        String(
                                                                            item.id
                                                                        ) ===
                                                                        String(
                                                                            employeeId
                                                                        )
                                                                );

                                                            if (!employee) {
                                                                return null;
                                                            }

                                                            return (
                                                                <span
                                                                    key={
                                                                        employee.id
                                                                    }
                                                                    className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800"
                                                                >
                                                                    {employee.name}
                                                                </span>
                                                            );
                                                        }
                                                    )}
                                                </div>

                                                <p className="mt-2 text-xs text-emerald-700">
                                                    Primul tehnician selectat
                                                    este tehnicianul principal.
                                                </p>
                                            </div>
                                        )}

                                        {errors.employee_ids && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.employee_ids}
                                            </p>
                                        )}

                                        {errors.employee_id && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.employee_id}
                                            </p>
                                        )}
                                    </div>

                                    {/* LICENTA */}

                                    <div>
                                        <label className="mb-2 block font-semibold text-slate-700">
                                            Licență / autorizație
                                        </label>

                                        <select
                                            className="w-full rounded-xl border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            value={data.license_id}
                                            onChange={(e) =>
                                                setData(
                                                    "license_id",
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="">
                                                Fără licență
                                            </option>

                                            {licenses.map((license) => (
                                                <option
                                                    key={license.id}
                                                    value={license.id}
                                                >
                                                    {license.name}
                                                    {license.code
                                                        ? ` - ${license.code}`
                                                        : ""}
                                                </option>
                                            ))}
                                        </select>

                                        {errors.license_id && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.license_id}
                                            </p>
                                        )}
                                    </div>

                                </div>

                                {/* TIP / PRIORITATE / STATUS */}

                                <div className="mb-6 grid gap-5 md:grid-cols-3">

                                    <div>
                                        <label className="mb-2 block font-semibold text-slate-700">
                                            Tip lucrare *
                                        </label>

                                        <select
                                            className="w-full rounded-xl border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            value={data.type}
                                            onChange={(e) =>
                                                setData(
                                                    "type",
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="">
                                                Selectează
                                            </option>

                                            <option value="instalare">
                                                Instalare
                                            </option>

                                            <option value="mentenanta">
                                                Mentenanță
                                            </option>

                                            <option value="interventie">
                                                Intervenție
                                            </option>

                                            <option value="service">
                                                Service
                                            </option>
                                        </select>

                                        {errors.type && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.type}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block font-semibold text-slate-700">
                                            Prioritate
                                        </label>

                                        <select
                                            className="w-full rounded-xl border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            value={data.priority}
                                            onChange={(e) =>
                                                setData(
                                                    "priority",
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="normal">
                                                Normală
                                            </option>

                                            <option value="urgenta">
                                                Urgentă
                                            </option>

                                            <option value="scazuta">
                                                Scăzută
                                            </option>

                                            <option value="medie">
                                                Medie
                                            </option>

                                            <option value="ridicata">
                                                Ridicată
                                            </option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-2 block font-semibold text-slate-700">
                                            Status
                                        </label>

                                        <select
                                            className="w-full rounded-xl border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            value={data.status}
                                            onChange={(e) =>
                                                setData(
                                                    "status",
                                                    e.target.value
                                                )
                                            }
                                        >
                                            <option value="noua">
                                                Nouă
                                            </option>

                                            <option value="programata">
                                                Programată
                                            </option>

                                            <option value="lucru">
                                                În lucru
                                            </option>

                                            <option value="finalizata">
                                                Finalizată
                                            </option>

                                            <option value="anulata">
                                                Anulată
                                            </option>
                                        </select>
                                    </div>

                                </div>

                                {/* PROGRAMARE */}

                                <div className="mb-6 grid gap-5 md:grid-cols-2">

                                    <div>
                                        <label className="mb-2 block font-semibold text-slate-700">
                                            Data programării
                                        </label>

                                        <input
                                            type="date"
                                            className="w-full rounded-xl border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            value={data.scheduled_date}
                                            onChange={(e) =>
                                                setData(
                                                    "scheduled_date",
                                                    e.target.value
                                                )
                                            }
                                        />

                                        {errors.scheduled_date && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.scheduled_date}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block font-semibold text-slate-700">
                                            Ora programării
                                        </label>

                                        <input
                                            type="time"
                                            className="w-full rounded-xl border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            value={data.scheduled_time}
                                            onChange={(e) =>
                                                setData(
                                                    "scheduled_time",
                                                    e.target.value
                                                )
                                            }
                                        />

                                        {errors.scheduled_time && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.scheduled_time}
                                            </p>
                                        )}
                                    </div>

                                </div>

                                {/* ADRESA */}

                                <div className="mb-6">
                                    <label className="mb-2 block font-semibold text-slate-700">
                                        Adresă lucrare
                                    </label>

                                    <input
                                        type="text"
                                        className="w-full rounded-xl border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="Stradă, număr, localitate"
                                        value={data.address}
                                        onChange={(e) =>
                                            setData(
                                                "address",
                                                e.target.value
                                            )
                                        }
                                    />

                                    {errors.address && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.address}
                                        </p>
                                    )}
                                </div>

                                {/* CONTACT */}

                                <div className="mb-6 grid gap-5 md:grid-cols-2">

                                    <div>
                                        <label className="mb-2 block font-semibold text-slate-700">
                                            Persoană de contact
                                        </label>

                                        <input
                                            type="text"
                                            className="w-full rounded-xl border-gray-300 p-3 shadow-sm"
                                            placeholder="Nume persoană de contact"
                                            value={data.contact_person}
                                            onChange={(e) =>
                                                setData(
                                                    "contact_person",
                                                    e.target.value
                                                )
                                            }
                                        />

                                        {errors.contact_person && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.contact_person}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-2 block font-semibold text-slate-700">
                                            Telefon
                                        </label>

                                        <input
                                            type="text"
                                            className="w-full rounded-xl border-gray-300 p-3 shadow-sm"
                                            placeholder="Număr telefon"
                                            value={data.phone}
                                            onChange={(e) =>
                                                setData(
                                                    "phone",
                                                    e.target.value
                                                )
                                            }
                                        />

                                        {errors.phone && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.phone}
                                            </p>
                                        )}
                                    </div>

                                </div>

                                {/* DESCRIERE */}

                                <div className="mb-6">
                                    <label className="mb-2 block font-semibold text-slate-700">
                                        Descriere lucrare
                                    </label>

                                    <textarea
                                        className="w-full rounded-xl border-gray-300 p-3 shadow-sm"
                                        rows="5"
                                        placeholder="Descrie lucrarea, ce trebuie executat, cerințele clientului etc."
                                        value={data.description}
                                        onChange={(e) =>
                                            setData(
                                                "description",
                                                e.target.value
                                            )
                                        }
                                    />

                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.description}
                                        </p>
                                    )}
                                </div>

                                {/* MATERIALE CONSUMATE DIN STOC */}

                                <div className="mb-6 overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50/50">

                                    <div className="border-b border-emerald-200 bg-emerald-50 px-5 py-5 sm:px-6">
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                            <div>
                                                <h2 className="text-lg font-bold text-emerald-900">
                                                    Materiale consumate din stoc
                                                </h2>

                                                <p className="mt-1 text-sm text-emerald-700">
                                                    Materialele adăugate aici
                                                    vor fi scăzute automat din
                                                    stoc la salvarea lucrării.
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={addMaterial}
                                                className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700"
                                            >
                                                + Adaugă material
                                            </button>

                                        </div>
                                    </div>

                                    <div className="p-5 sm:p-6">

                                        {data.materials_used.length === 0 ? (
                                            <div className="rounded-xl border border-dashed border-emerald-300 bg-white p-8 text-center">
                                                <div className="text-3xl">
                                                    📦
                                                </div>

                                                <div className="mt-3 font-bold text-slate-900">
                                                    Nu ai adăugat materiale
                                                </div>

                                                <p className="mx-auto mt-1 max-w-lg text-sm text-slate-500">
                                                    Apasă „Adaugă material” pentru
                                                    a selecta produse și cantități
                                                    din stoc.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">

                                                {data.materials_used.map(
                                                    (item, index) => {
                                                        const product =
                                                            getProduct(
                                                                item.product_id
                                                            );

                                                        const quantity =
                                                            Number(
                                                                item.quantity ||
                                                                    0
                                                            );

                                                        const unitPrice =
                                                            Number(
                                                                product?.purchase_price ||
                                                                    0
                                                            );

                                                        const total =
                                                            quantity *
                                                            unitPrice;

                                                        return (
                                                            <div
                                                                key={index}
                                                                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                                                            >
                                                                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto] lg:items-end">

                                                                    {/* PRODUS */}

                                                                    <div>
                                                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                                            Produs
                                                                        </label>

                                                                        <select
                                                                            className="w-full rounded-xl border-gray-300 p-3 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                                                            value={
                                                                                item.product_id
                                                                            }
                                                                            onChange={(
                                                                                e
                                                                            ) =>
                                                                                updateMaterial(
                                                                                    index,
                                                                                    "product_id",
                                                                                    e
                                                                                        .target
                                                                                        .value
                                                                                )
                                                                            }
                                                                        >
                                                                            <option value="">
                                                                                Selectează produs
                                                                            </option>

                                                                            {products.map(
                                                                                (
                                                                                    productItem
                                                                                ) => (
                                                                                    <option
                                                                                        key={
                                                                                            productItem.id
                                                                                        }
                                                                                        value={
                                                                                            productItem.id
                                                                                        }
                                                                                    >
                                                                                        {
                                                                                            productItem.name
                                                                                        }
                                                                                        {productItem.code
                                                                                            ? ` - ${productItem.code}`
                                                                                            : ""}
                                                                                    </option>
                                                                                )
                                                                            )}
                                                                        </select>

                                                                        {product && (
                                                                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                                                                                <span>
                                                                                    Cod:{" "}
                                                                                    {
                                                                                        product.code
                                                                                    }
                                                                                </span>

                                                                                <span>
                                                                                    Stoc actual:{" "}
                                                                                    <strong className="text-emerald-700">
                                                                                        {formatNumber(
                                                                                            product.stock_quantity
                                                                                        )}{" "}
                                                                                        {
                                                                                            product.unit
                                                                                        }
                                                                                    </strong>
                                                                                </span>

                                                                                <span>
                                                                                    Preț:{" "}
                                                                                    {formatNumber(
                                                                                        product.purchase_price
                                                                                    )}{" "}
                                                                                    lei
                                                                                </span>
                                                                            </div>
                                                                        )}

                                                                        {errors[
                                                                            `materials_used.${index}.product_id`
                                                                        ] && (
                                                                            <p className="mt-1 text-sm text-red-600">
                                                                                {
                                                                                    errors[
                                                                                        `materials_used.${index}.product_id`
                                                                                    ]
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </div>

                                                                    {/* CANTITATE */}

                                                                    <div>
                                                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                                            Cantitate
                                                                        </label>

                                                                        <div className="relative">
                                                                            <input
                                                                                type="number"
                                                                                min="0.01"
                                                                                step="0.01"
                                                                                className="w-full rounded-xl border-gray-300 p-3 pr-14 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                                                                value={
                                                                                    item.quantity
                                                                                }
                                                                                onChange={(
                                                                                    e
                                                                                ) =>
                                                                                    updateMaterial(
                                                                                        index,
                                                                                        "quantity",
                                                                                        e
                                                                                            .target
                                                                                            .value
                                                                                    )
                                                                                }
                                                                                placeholder="0.00"
                                                                            />

                                                                            {product?.unit && (
                                                                                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-slate-400">
                                                                                    {
                                                                                        product.unit
                                                                                    }
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        {product &&
                                                                            quantity >
                                                                                Number(
                                                                                    product.stock_quantity
                                                                                ) && (
                                                                                <p className="mt-1 text-xs font-semibold text-red-600">
                                                                                    Atenție: verifică stocul disponibil.
                                                                                </p>
                                                                            )}

                                                                        {errors[
                                                                            `materials_used.${index}.quantity`
                                                                        ] && (
                                                                            <p className="mt-1 text-sm text-red-600">
                                                                                {
                                                                                    errors[
                                                                                        `materials_used.${index}.quantity`
                                                                                    ]
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </div>

                                                                    {/* VALOARE */}

                                                                    <div>
                                                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                                            Valoare
                                                                        </label>

                                                                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900">
                                                                            {formatNumber(
                                                                                total
                                                                            )}{" "}
                                                                            lei
                                                                        </div>
                                                                    </div>

                                                                    {/* STERGE */}

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            removeMaterial(
                                                                                index
                                                                            )
                                                                        }
                                                                        className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100"
                                                                    >
                                                                        Șterge
                                                                    </button>

                                                                </div>
                                                            </div>
                                                        );
                                                    }
                                                )}

                                                <div className="flex flex-col gap-4 rounded-xl border border-emerald-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                                                    <div>
                                                        <div className="text-sm font-semibold text-slate-500">
                                                            Materiale selectate
                                                        </div>

                                                        <div className="mt-1 text-xl font-bold text-slate-900">
                                                            {
                                                                data.materials_used
                                                                    .length
                                                            }
                                                        </div>
                                                    </div>

                                                    <div className="text-left sm:text-right">
                                                        <div className="text-sm font-semibold text-slate-500">
                                                            Valoare estimată
                                                        </div>

                                                        <div className="mt-1 text-xl font-bold text-emerald-700">
                                                            {formatNumber(
                                                                totalMaterialsValue
                                                            )}{" "}
                                                            lei
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        )}

                                    </div>
                                </div>

                                {/* MATERIALE TEXT */}

                                <div className="mb-6">
                                    <label className="mb-2 block font-semibold text-slate-700">
                                        Materiale / descriere liberă
                                    </label>

                                    <textarea
                                        className="w-full rounded-xl border-gray-300 p-3 shadow-sm"
                                        rows="4"
                                        placeholder="Descriere suplimentară a materialelor, echipamentelor sau consumabilelor..."
                                        value={data.materials}
                                        onChange={(e) =>
                                            setData(
                                                "materials",
                                                e.target.value
                                            )
                                        }
                                    />

                                    <p className="mt-1 text-xs text-slate-500">
                                        Acest câmp este doar informativ. Pentru
                                        scăderea efectivă din stoc folosește
                                        secțiunea „Materiale consumate din stoc”.
                                    </p>

                                    {errors.materials && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.materials}
                                        </p>
                                    )}
                                </div>

                                {/* OBSERVATII */}

                                <div className="mb-8">
                                    <label className="mb-2 block font-semibold text-slate-700">
                                        Observații
                                    </label>

                                    <textarea
                                        className="w-full rounded-xl border-gray-300 p-3 shadow-sm"
                                        rows="4"
                                        placeholder="Observații, instrucțiuni, condiții speciale..."
                                        value={data.notes}
                                        onChange={(e) =>
                                            setData(
                                                "notes",
                                                e.target.value
                                            )
                                        }
                                    />

                                    {errors.notes && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.notes}
                                        </p>
                                    )}
                                </div>

                                {/* ACTIUNI */}

                                <div className="flex flex-wrap items-center gap-3">

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="rounded-xl bg-blue-600 px-8 py-3 font-semibold text-white shadow transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {processing
                                            ? "Se salvează..."
                                            : "💾 Salvează modificările"}
                                    </button>

                                </div>

                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}