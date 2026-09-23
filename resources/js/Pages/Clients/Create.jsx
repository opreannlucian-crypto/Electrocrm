import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";

export default function Create() {
    const {
        data,
        setData,
        post,
        processing,
        errors,
    } = useForm({
        type: "firma",
        name: "",
        cui: "",
        tva_status: "",
        anaf_name: "",
        anaf_checked_at: "",
        contact_person: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        notes: "",
    });

    const [checkingCui, setCheckingCui] = useState(false);
    const [cuiMessage, setCuiMessage] = useState("");
    const [cuiError, setCuiError] = useState("");

    function submit(e) {
        e.preventDefault();

        post(route("clients.store"));
    }

    async function verifyCui() {
        setCuiMessage("");
        setCuiError("");

        const cui = String(data.cui || "")
            .trim()
            .toUpperCase()
            .replace(/\s+/g, "");

        if (!cui) {
            setCuiError("Introdu CUI-ul firmei.");
            return;
        }

        setCheckingCui(true);

        try {
            const csrfToken =
                document.querySelector(
                    'meta[name="csrf-token"]'
                )?.getAttribute("content") || "";

            const response = await fetch(
                route("clients.verify-cui"),
                {
                    method: "POST",

                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": csrfToken,
                        "X-Requested-With": "XMLHttpRequest",
                    },

                    credentials: "same-origin",

                    body: JSON.stringify({
                        cui,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message ||
                        "CUI-ul nu a putut fi verificat."
                );
            }

            const client = result.client || {};

            setData({
                type: "firma",
                name: client.name || data.name || "",
                cui: client.cui || cui,
                tva_status:
                    client.tva_status || "",
                anaf_name:
                    client.anaf_name ||
                    client.name ||
                    "",
                anaf_checked_at:
                    client.anaf_checked_at || "",
                contact_person:
                    data.contact_person || "",
                phone:
                    client.phone ||
                    data.phone ||
                    "",
                email:
                    data.email || "",
                address:
                    client.address ||
                    data.address ||
                    "",
                city:
                    client.city ||
                    data.city ||
                    "",
                notes:
                    data.notes || "",
            });

            if (client.vat_registered) {
                setCuiMessage(
                    "Firma a fost verificata in ANAF. Este platitoare de TVA."
                );
            } else {
                setCuiMessage(
                    "Firma a fost verificata in ANAF. Este neplatitoare de TVA."
                );
            }
        } catch (error) {
            setCuiError(
                error?.message ||
                    "A aparut o eroare la verificarea CUI-ului."
            );
        } finally {
            setCheckingCui(false);
        }
    }

    const isVatPayer =
        data.tva_status === "platitor_tva";

    const isNotVatPayer =
        data.tva_status === "neplatitor_tva";

    return (
        <AuthenticatedLayout>
            <Head title="Adaugă client" />

            <div className="p-6 max-w-4xl mx-auto">

                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Adaugă client
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Introdu CUI-ul firmei pentru completarea automata
                        a datelor din ANAF.
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-6"
                >

                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">

                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Date client
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tip client
                                </label>

                                <select
                                    className="border border-gray-300 rounded-lg p-2.5 w-full bg-white"
                                    value={data.type}
                                    onChange={(e) =>
                                        setData(
                                            "type",
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="firma">
                                        Firmă
                                    </option>

                                    <option value="persoana_fizica">
                                        Persoană fizică
                                    </option>
                                </select>

                                {errors.type && (
                                    <div className="text-red-600 text-sm mt-1">
                                        {errors.type}
                                    </div>
                                )}
                            </div>


                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    CUI / CIF
                                </label>

                                <div className="flex gap-2">

                                    <input
                                        className="border border-gray-300 rounded-lg p-2.5 w-full"
                                        placeholder="Ex. 12345678 sau RO12345678"
                                        value={data.cui}
                                        disabled={
                                            data.type ===
                                            "persoana_fizica"
                                        }
                                        onChange={(e) =>
                                            setData(
                                                "cui",
                                                e.target.value.toUpperCase()
                                            )
                                        }
                                    />

                                    <button
                                        type="button"
                                        onClick={verifyCui}
                                        disabled={
                                            checkingCui ||
                                            data.type ===
                                                "persoana_fizica"
                                        }
                                        className="px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                    >
                                        {checkingCui
                                            ? "Verific..."
                                            : "Verifică CUI"}
                                    </button>

                                </div>

                                {errors.cui && (
                                    <div className="text-red-600 text-sm mt-1">
                                        {errors.cui}
                                    </div>
                                )}

                            </div>

                        </div>


                        {cuiMessage && (
                            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                                {cuiMessage}
                            </div>
                        )}


                        {cuiError && (
                            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {cuiError}
                            </div>
                        )}

                    </div>


                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">

                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Date fiscale
                        </h2>


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Denumire
                                </label>

                                <input
                                    className="border border-gray-300 rounded-lg p-2.5 w-full"
                                    placeholder="Denumire client"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData(
                                            "name",
                                            e.target.value
                                        )
                                    }
                                />

                                {errors.name && (
                                    <div className="text-red-600 text-sm mt-1">
                                        {errors.name}
                                    </div>
                                )}
                            </div>


                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Statut TVA
                                </label>

                                <div
                                    className={`
                                        rounded-lg border p-2.5 font-medium
                                        ${
                                            isVatPayer
                                                ? "border-blue-200 bg-blue-50 text-blue-800"
                                                : ""
                                        }
                                        ${
                                            isNotVatPayer
                                                ? "border-amber-200 bg-amber-50 text-amber-800"
                                                : ""
                                        }
                                        ${
                                            !isVatPayer &&
                                            !isNotVatPayer
                                                ? "border-gray-300 bg-gray-50 text-gray-500"
                                                : ""
                                        }
                                    `}
                                >

                                    {isVatPayer
                                        ? "Plătitor TVA"
                                        : isNotVatPayer
                                        ? "Neplătitor TVA"
                                        : "Neverificat"}

                                </div>

                            </div>

                        </div>


                        {isVatPayer && (
                            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                                Pentru acest client, ofertele vor fi
                                generate fără TVA.
                            </div>
                        )}


                        {isNotVatPayer && (
                            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                Pentru acest client, ofertele vor fi
                                generate cu TVA 21%.
                            </div>
                        )}

                    </div>


                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">

                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Date contact
                        </h2>


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Persoană de contact
                                </label>

                                <input
                                    className="border border-gray-300 rounded-lg p-2.5 w-full"
                                    placeholder="Persoană de contact"
                                    value={
                                        data.contact_person
                                    }
                                    onChange={(e) =>
                                        setData(
                                            "contact_person",
                                            e.target.value
                                        )
                                    }
                                />

                                {errors.contact_person && (
                                    <div className="text-red-600 text-sm mt-1">
                                        {errors.contact_person}
                                    </div>
                                )}
                            </div>


                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Telefon
                                </label>

                                <input
                                    className="border border-gray-300 rounded-lg p-2.5 w-full"
                                    placeholder="Telefon"
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData(
                                            "phone",
                                            e.target.value
                                        )
                                    }
                                />

                                {errors.phone && (
                                    <div className="text-red-600 text-sm mt-1">
                                        {errors.phone}
                                    </div>
                                )}
                            </div>


                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    className="border border-gray-300 rounded-lg p-2.5 w-full"
                                    placeholder="Email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData(
                                            "email",
                                            e.target.value
                                        )
                                    }
                                />

                                {errors.email && (
                                    <div className="text-red-600 text-sm mt-1">
                                        {errors.email}
                                    </div>
                                )}
                            </div>


                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Oraș
                                </label>

                                <input
                                    className="border border-gray-300 rounded-lg p-2.5 w-full"
                                    placeholder="Oraș"
                                    value={data.city}
                                    onChange={(e) =>
                                        setData(
                                            "city",
                                            e.target.value
                                        )
                                    }
                                />

                                {errors.city && (
                                    <div className="text-red-600 text-sm mt-1">
                                        {errors.city}
                                    </div>
                                )}
                            </div>

                        </div>


                        <div className="mt-4">

                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Adresă
                            </label>

                            <textarea
                                className="border border-gray-300 rounded-lg p-2.5 w-full"
                                rows="3"
                                placeholder="Adresă"
                                value={data.address}
                                onChange={(e) =>
                                    setData(
                                        "address",
                                        e.target.value
                                    )
                                }
                            />

                            {errors.address && (
                                <div className="text-red-600 text-sm mt-1">
                                    {errors.address}
                                </div>
                            )}

                        </div>


                        <div className="mt-4">

                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Observații
                            </label>

                            <textarea
                                className="border border-gray-300 rounded-lg p-2.5 w-full"
                                rows="3"
                                placeholder="Observații"
                                value={data.notes}
                                onChange={(e) =>
                                    setData(
                                        "notes",
                                        e.target.value
                                    )
                                }
                            />

                            {errors.notes && (
                                <div className="text-red-600 text-sm mt-1">
                                    {errors.notes}
                                </div>
                            )}

                        </div>

                    </div>


                    {data.anaf_checked_at && (
                        <div className="text-xs text-gray-500">
                            Date fiscale verificate automat în ANAF la{" "}
                            {data.anaf_checked_at}
                        </div>
                    )}


                    <div className="flex justify-end gap-3">

                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing
                                ? "Se salvează..."
                                : "Salvează client"}
                        </button>

                    </div>

                </form>

            </div>

        </AuthenticatedLayout>
    );
}