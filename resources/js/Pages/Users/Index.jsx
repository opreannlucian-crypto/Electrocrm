import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";

export default function Index({ users = [], roles = {}, modules = {} }) {
    const currentUser = usePage().props.auth.user;

    function removeUser(user) {
        if (!window.confirm(`Ștergi contul pentru ${user.name}? Această acțiune nu poate fi anulată.`)) {
            return;
        }

        router.delete(route("users.destroy", user.id));
    }

    return (
        <AuthenticatedLayout>
            <Head title="Utilizatori și drepturi" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">Administrare acces</p>
                            <h1 className="mt-1 text-3xl font-bold text-slate-900">Utilizatori și drepturi</h1>
                            <p className="mt-2 max-w-2xl text-sm text-slate-600">
                                Creează conturi, atribuie roluri și controlează modulele disponibile fiecărui tehnician.
                            </p>
                        </div>
                        <Link href={route("users.create")} className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700">
                            + Utilizator nou
                        </Link>
                    </div>

                    <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-6 py-4">Utilizator</th>
                                        <th className="px-6 py-4">Rol</th>
                                        <th className="px-6 py-4">Angajat asociat</th>
                                        <th className="px-6 py-4">Acces</th>
                                        <th className="px-6 py-4 text-right">Acțiuni</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {users.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-sm text-slate-500">Nu există utilizatori configurați.</td>
                                        </tr>
                                    ) : users.map((user) => {
                                        const grantedModules = user.role === "technician"
                                            ? (user.allowed_modules ?? []).map((module) => modules[module]).filter(Boolean)
                                            : ["Acces complet"];

                                        return (
                                            <tr key={user.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-slate-900">{user.name}</div>
                                                    <div className="mt-0.5 text-sm text-slate-500">{user.email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">{roles[user.role] ?? user.role}</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-700">{user.employee?.name ?? "—"}</td>
                                                <td className="max-w-sm px-6 py-4 text-sm text-slate-600">
                                                    {grantedModules.length > 0 ? grantedModules.join(", ") : "Niciun modul activ"}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right">
                                                    <Link href={route("users.edit", user.id)} className="mr-3 text-sm font-semibold text-blue-600 hover:text-blue-800">Editează</Link>
                                                    {currentUser.id !== user.id && (
                                                        <button type="button" onClick={() => removeUser(user)} className="text-sm font-semibold text-red-600 hover:text-red-800">Șterge</button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
