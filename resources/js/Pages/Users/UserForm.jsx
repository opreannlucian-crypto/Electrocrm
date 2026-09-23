import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function UserForm({
    userAccount = null,
    employees = [],
    roles = {},
    modules = {},
}) {
    const isEditing = Boolean(userAccount);

    const { data, setData, post, put, processing, errors } = useForm({
        name: userAccount?.name ?? "",
        email: userAccount?.email ?? "",
        password: "",
        password_confirmation: "",
        role: userAccount?.role ?? "technician",
        employee_id: userAccount?.employee_id ? String(userAccount.employee_id) : "",
        allowed_modules: userAccount?.allowed_modules ?? Object.keys(modules),
    });

    const isTechnician = data.role === "technician";

    function toggleModule(module) {
        const nextModules = data.allowed_modules.includes(module)
            ? data.allowed_modules.filter((item) => item !== module)
            : [...data.allowed_modules, module];

        setData("allowed_modules", nextModules);
    }

    function submit(event) {
        event.preventDefault();

        if (isEditing) {
            put(route("users.update", userAccount.id));
            return;
        }

        post(route("users.store"));
    }

    return (
        <AuthenticatedLayout>
            <Head title={isEditing ? "Editează utilizator" : "Utilizator nou"} />

            <div className="py-8">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
                        <div className="border-b border-slate-200 px-6 py-7 sm:px-8">
                            <p className="text-sm font-medium text-slate-500">Administrare acces</p>
                            <h1 className="mt-1 text-3xl font-bold text-slate-900">
                                {isEditing ? "Editează utilizator" : "Creează utilizator"}
                            </h1>
                            <p className="mt-2 text-sm text-slate-500">
                                Atribuie rolul și modulele disponibile. Managerii de vânzări și administratorii au acces complet.
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-7 px-6 py-7 sm:px-8">
                            <div className="grid gap-5 md:grid-cols-2">
                                <Field label="Nume complet" error={errors.name}>
                                    <input
                                        value={data.name}
                                        onChange={(event) => setData("name", event.target.value)}
                                        className="w-full rounded-xl border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </Field>

                                <Field label="Adresă e-mail" error={errors.email}>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(event) => setData("email", event.target.value)}
                                        className="w-full rounded-xl border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </Field>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <Field label={isEditing ? "Parolă nouă (opțional)" : "Parolă"} error={errors.password}>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={(event) => setData("password", event.target.value)}
                                        className="w-full rounded-xl border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required={!isEditing}
                                        minLength="8"
                                    />
                                </Field>

                                <Field label="Confirmă parola" error={errors.password_confirmation}>
                                    <input
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(event) => setData("password_confirmation", event.target.value)}
                                        className="w-full rounded-xl border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required={!isEditing || Boolean(data.password)}
                                        minLength="8"
                                    />
                                </Field>
                            </div>

                            <div className="grid gap-5 md:grid-cols-2">
                                <Field label="Rol" error={errors.role}>
                                    <select
                                        value={data.role}
                                        onChange={(event) => setData("role", event.target.value)}
                                        className="w-full rounded-xl border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        {Object.entries(roles).map(([value, label]) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                </Field>

                                <Field label={isTechnician ? "Angajat asociat" : "Angajat asociat (opțional)"} error={errors.employee_id}>
                                    <select
                                        value={data.employee_id}
                                        onChange={(event) => setData("employee_id", event.target.value)}
                                        className="w-full rounded-xl border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required={isTechnician}
                                    >
                                        <option value="">Selectează angajat</option>
                                        {employees.map((employee) => (
                                            <option key={employee.id} value={employee.id}>
                                                {employee.name}{employee.position ? ` — ${employee.position}` : ""}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                            </div>

                            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                                <h2 className="font-bold text-slate-900">Module permise</h2>
                                {isTechnician ? (
                                    <>
                                        <p className="mt-1 text-sm text-slate-600">
                                            Administratorul poate activa sau dezactiva fiecare modul pentru acest tehnician.
                                        </p>
                                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                            {Object.entries(modules).map(([module, label]) => (
                                                <label key={module} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-700">
                                                    <input
                                                        type="checkbox"
                                                        checked={data.allowed_modules.includes(module)}
                                                        onChange={() => toggleModule(module)}
                                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    {label}
                                                </label>
                                            ))}
                                        </div>
                                        {errors.allowed_modules && <p className="mt-2 text-sm text-red-600">{errors.allowed_modules}</p>}
                                    </>
                                ) : (
                                    <p className="mt-1 text-sm text-slate-600">
                                        Acest rol are acces complet la toate modulele ElectroCRM. Setările de module nu îi limitează accesul.
                                    </p>
                                )}
                            </section>

                            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
                                <Link href={route("users.index")} className="rounded-xl border border-slate-300 px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                                    Anulează
                                </Link>
                                <button type="submit" disabled={processing} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                                    {processing ? "Se salvează..." : isEditing ? "Salvează drepturile" : "Creează utilizator"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function Field({ label, error, children }) {
    return (
        <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
            {children}
            {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
        </label>
    );
}
