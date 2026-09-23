import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useState } from "react";

export default function Index({ oblioConfigured, anafPrepared, anafEnvironment }) {
    const [showAuthorization, setShowAuthorization] = useState(false);

    return (
        <AuthenticatedLayout>
            <Head title="SPV – Facturi primite" />
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <p className="text-sm font-bold uppercase tracking-wider text-blue-600">Documente</p>
                    <h1 className="mt-1 text-3xl font-bold text-slate-900">SPV – Facturi primite</h1>
                    <p className="mt-2 max-w-3xl text-slate-600">
                        Aici vor ajunge facturile electronice primite de la furnizori. Fiecare document va putea fi verificat înainte de a crea o recepție și de a actualiza stocul.
                    </p>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                    <ConnectionCard
                        title="Oblio Wallet"
                        icon="🟠"
                        ready={oblioConfigured}
                        readyText="Conexiunea API Oblio este configurată în ElectroCRM."
                        pendingText="Adaugă datele API Oblio în configurarea locală pentru a verifica integrarea."
                    >
                        <p>Oblio Wallet primește facturile furnizorilor din SPV. API-ul public Oblio nu documentează încă citirea documentelor din Wallet, deci nu folosim metode nesigure sau neoficiale.</p>
                        <a href="https://www.oblio.eu/wallet" target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600">
                            Deschide Oblio Wallet ↗
                        </a>
                    </ConnectionCard>

                    <ConnectionCard
                        title="Conectare directă ANAF / SPV"
                        icon="🏛️"
                        ready={anafPrepared}
                        readyText={`Pregătită pentru mediul ${anafEnvironment === "prod" ? "de producție" : "de test"}.`}
                        pendingText="Pregătită în ElectroCRM; lipsește încă autorizarea API ANAF."
                    >
                        <p>Conectorul direct va prelua lista mesajelor SPV, arhiva XML semnată și va bloca automat dublurile înainte de crearea recepției.</p>
                        <p className="mt-3 text-sm text-slate-500">Autorizarea se face cu token API ANAF, nu cu parola SPV. Datele se păstrează doar în configurarea locală a serverului.</p>
                        <button type="button" onClick={() => setShowAuthorization(true)} className="mt-4 inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700">
                            Conectează ANAF / SPV →
                        </button>
                    </ConnectionCard>
                </div>

                <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Inbox facturi furnizori</h2>
                            <p className="mt-1 text-sm text-slate-500">Facturile sincronizate vor apărea aici pentru verificare și recepție.</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-600">0 documente</span>
                    </div>
                    <div className="px-6 py-14 text-center">
                        <div className="text-5xl">📥</div>
                        <h3 className="mt-4 text-lg font-bold text-slate-900">Nu sunt încă facturi importate</h3>
                        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">După activarea sursei de sincronizare, aici vei vedea furnizorul, numărul facturii, data, totalul, XML-ul original și butonul „Creează recepție”.</p>
                    </div>
                </section>
            </div>
            {showAuthorization && <AuthorizationDialog prepared={anafPrepared} onClose={() => setShowAuthorization(false)} />}
        </AuthenticatedLayout>
    );
}

function AuthorizationDialog({ prepared, onClose }) {
    return <div className="fixed inset-0 z-50 flex items-end bg-slate-950/40 p-4 sm:items-center sm:justify-center" role="dialog" aria-modal="true" aria-labelledby="spv-authorization-title">
        <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold uppercase tracking-wider text-blue-600">ANAF / SPV</p><h2 id="spv-authorization-title" className="mt-1 text-2xl font-bold text-slate-900">Conectează ElectroCRM</h2></div><button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Închide">✕</button></div>
            <ol className="mt-6 space-y-4 text-sm text-slate-700"><li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">1</span><span>Vei fi trimis la ANAF pentru autentificare cu certificatul digital calificat.</span></li><li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">2</span><span>După acceptare, ANAF te redirecționează automat înapoi în ElectroCRM.</span></li><li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">3</span><span>De atunci, poți sincroniza facturile primite direct în inbox.</span></li></ol>
            {!prepared && <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><p className="font-bold">Mai este necesară înrolarea aplicației la ANAF.</p><p className="mt-1">Butonul de autorizare real se activează după înregistrarea „ElectroCRM” ca aplicație OAuth în portalul ANAF și configurarea adresei de revenire.</p></div>}
            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700">Închide</button><button type="button" disabled={!prepared} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">Continuă spre ANAF →</button></div>
        </div>
    </div>;
}

function ConnectionCard({ title, icon, ready, readyText, pendingText, children }) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl">{icon}</span>
                    <h2 className="text-lg font-bold text-slate-900">{title}</h2>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${ready ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                    {ready ? "Pregătită" : "Necesită autorizare"}
                </span>
            </div>
            <p className={`mt-5 rounded-xl px-4 py-3 text-sm font-semibold ${ready ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"}`}>
                {ready ? readyText : pendingText}
            </p>
            <div className="mt-4 text-sm leading-6 text-slate-600">{children}</div>
        </section>
    );
}
