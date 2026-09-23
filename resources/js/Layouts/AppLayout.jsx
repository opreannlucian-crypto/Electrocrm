import { Link, usePage } from "@inertiajs/react";

export default function AppLayout({ title, children }) {
    const { auth } = usePage().props;

    return (
        <div className="flex min-h-screen bg-gray-100">

            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white">

                <div className="border-b border-slate-700 p-6">
                    <h1 className="text-2xl font-bold">
                        ElectroCRM
                    </h1>

                    <p className="text-sm text-slate-400 mt-1">
                        Electrodep SRL
                    </p>
                </div>

                <nav className="mt-6">

                    <Link
                        href={route("dashboard")}
                        className="block px-6 py-3 hover:bg-slate-800"
                    >
                        📊 Dashboard
                    </Link>

                    <Link
                        href={route("clients.index")}
                        className="block px-6 py-3 hover:bg-slate-800"
                    >
                        👤 Clienți
                    </Link>

                    <Link
    href={route("work_orders.index")}
    className="block px-6 py-3 hover:bg-slate-800"
>
    🔧 Intervenții
</Link>

                    <Link
                        href={route("employees.index")}
                        className="block px-6 py-3 hover:bg-slate-800"
                    >
                        👷 Angajați
                    </Link>

                </nav>
            </aside>

            {/* Conținut */}
            <div className="flex-1">

                {/* Top Bar */}
                <header className="flex items-center justify-between border-b bg-white px-8 py-4 shadow-sm">

                    <h2 className="text-2xl font-semibold">
                        {title}
                    </h2>

                    <div className="flex items-center gap-4">

                        <span className="text-gray-600">
                            {auth.user.name}
                        </span>

                        <Link
                            href={route("logout")}
                            method="post"
                            as="button"
                            className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                        >
                            Logout
                        </Link>

                    </div>

                </header>

                <main className="p-8">

                    {children}

                </main>

            </div>

        </div>
    );
}
