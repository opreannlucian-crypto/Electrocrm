import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";

export default function Index({ oblioConfigured, anafPrepared, anafEnvironment }) {
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
        </AuthenticatedLayout>
    );
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
