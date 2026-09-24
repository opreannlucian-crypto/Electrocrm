import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import NotificationBell from "@/Components/Notifications/NotificationBell";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { Link, usePage } from "@inertiajs/react";
import { useLayoutEffect, useRef, useState } from "react";

export default function AuthenticatedLayout({
    header,
    children,
}) {
    const user =
        usePage().props.auth.user;

    const technicianDefaultModules = [
        "dashboard",
        "work_orders",
        "calendar",
        "attendance",
        "client_creation",
    ];
    const isTechnician = user?.role === "technician";
    const isAdministrator = user?.role === "administrator";
    const allowedModules = Array.isArray(user?.allowed_modules)
        ? user.allowed_modules
        : technicianDefaultModules;
    const canAccess = (module) => !isTechnician || allowedModules.includes(module);
    const roleLabel = {
        administrator: "Administrator",
        sales_manager: "Manager vânzări",
        technician: "Tehnician",
    }[user?.role] ?? "Cont utilizator";
    const technicianMobileLinkClass = "mb-2 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[15px] font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800";

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    const [documentsOpen, setDocumentsOpen] =
        useState(true);
    const [actsOpen, setActsOpen] = useState(true);
    const [reportsOpen, setReportsOpen] = useState(true);
    const [settingsOpen, setSettingsOpen] = useState(true);
    const [nomenclaturesOpen, setNomenclaturesOpen] = useState(true);
    const sidebarScrollRef = useRef(null);

    useLayoutEffect(() => {
        const savedPosition = window.sessionStorage.getItem("electrocrm.sidebar-scroll-position");
        if (savedPosition && sidebarScrollRef.current) {
            sidebarScrollRef.current.scrollTop = Number(savedPosition);
        }
    }, []);

    const rememberSidebarPosition = (event) => {
        window.sessionStorage.setItem("electrocrm.sidebar-scroll-position", String(event.currentTarget.scrollTop));
    };

    return (
        <div className="crm-app">

            {/* ============================================================
                DESKTOP LAYOUT
            ============================================================ */}

            <div className="flex min-h-screen">

                {/* ========================================================
                    SIDEBAR DESKTOP
                ========================================================= */}

                <aside className="crm-sidebar hidden w-64 shrink-0 lg:block">

                    <div className="sticky top-0 flex h-screen flex-col">

                        {/* LOGO */}

                        <div className="border-b border-gray-200 px-5 py-5">

                            <Link
                                href={route("dashboard")}
                                className="flex items-center"
                            >
                                <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                            </Link>

                            <div className="mt-2 text-xs font-medium text-gray-400">
                                ElectroCRM
                            </div>

                        </div>


                        {/* USER */}

                        <div className="border-b border-gray-200 px-5 py-4">

                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="text-sm font-semibold text-gray-800">
                                        {user.name}
                                    </div>

                                    <div className="mt-0.5 truncate text-xs text-gray-500">
                                        {user.email}
                                    </div>

                                    <div className="mt-2 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                        {roleLabel}
                                    </div>
                                </div>

                                <NotificationBell compact />
                            </div>

                        </div>


                        {/* NAVIGATION */}

                        <nav ref={sidebarScrollRef} onScroll={rememberSidebarPosition} className="flex-1 overflow-y-auto px-3 py-4">

                            <div className="space-y-1">

                                {/* DASHBOARD */}

                                <Link
                                    href={route("dashboard")}
                                    style={{ display: canAccess("dashboard") ? undefined : "none" }}
                                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                        route().current("dashboard")
                                            ? "bg-blue-600 text-white shadow-sm"
                                            : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/5 text-lg">
                                        🏠
                                    </span>

                                    <span>
                                        Dashboard
                                    </span>
                                </Link>


                                <div className="pt-2" style={{ display: isTechnician ? "none" : undefined }}>
                                    <SidebarSection
                                        icon="📑"
                                        label="Acte"
                                        open={actsOpen}
                                        onToggle={() => setActsOpen((value) => !value)}
                                        active={route().current("quotes.*") || route().current("contracts.*") || route().current("reports.*") || route().current("projects.*")}
                                    >
                                        <SidebarLink href={route("quotes.index")} active={route().current("quotes.*")} icon="📑" label="Oferte și devize" />
                                        <SidebarLink href={route("contracts.index")} active={route().current("contracts.*")} icon="📃" label="Contracte" />
                                        <SidebarLink href={route("projects.index")} active={route().current("projects.*")} icon="📁" label="Proiecte" />
                                        <SidebarLink href={route("reports.index")} active={route().current("reports.*")} icon="📝" label="Procese-verbale" />
                                        <SidebarLink href={route("report-templates.index")} active={route().current("report-templates.*")} icon="📋" label="Șabloane procese-verbale" />
                                    </SidebarSection>

                                    <SidebarSection
                                        icon="📄"
                                        label="Documente"
                                        open={documentsOpen}
                                        onToggle={() => setDocumentsOpen((value) => !value)}
                                        active={route().current("invoices.*") || route().current("proformas.*") || route().current("receipts.*") || route().current("receptions.*") || route().current("consumption-notes.*") || route().current("spv.*")}
                                    >
                                        <SidebarLink href={route("invoices.index")} active={route().current("invoices.*")} icon="🧾" label="Facturi" />
                                        <SidebarLink href={route("proformas.index")} active={route().current("proformas.*")} icon="📄" label="Proforme" />
                                        <SidebarLink href={route("receipts.index")} active={route().current("receipts.*")} icon="💰" label="Încasări" />
                                        <SidebarLink href={route("receptions.index")} active={route().current("receptions.*")} icon="📥" label="Recepții furnizori" />
                                        <SidebarLink href={route("spv.index")} active={route().current("spv.*")} icon="🏛️" label="SPV – Facturi primite" />
                                        <SidebarLink href={route("consumption-notes.index")} active={route().current("consumption-notes.*")} icon="📤" label="Bonuri de consum" />
                                        <SidebarLink href={route("inventory.index")} active={route().current("inventory.*")} icon="📋" label="Inventar" />
                                        <SidebarLink href={route("transfer-notes.index")} active={route().current("transfer-notes.*")} icon="🔄" label="Note de transfer" />
                                    </SidebarSection>
                                </div>


                                {/* LUCRARI */}

                                <Link
                                    href={route("work_orders.index")}
                                    style={{ display: canAccess("work_orders") ? undefined : "none" }}
                                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                        route().current("work_orders.*")
                                            ? "bg-blue-600 text-white shadow-sm"
                                            : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/5 text-lg">
                                        🛠️
                                    </span>

                                    <span>
                                        Lucrări
                                    </span>
                                </Link>


                                {/* CALENDAR */}

                                <Link
                                    href={route("calendar.index")}
                                    style={{ display: canAccess("calendar") ? undefined : "none" }}
                                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                        route().current("calendar.*")
                                            ? "bg-indigo-600 text-white shadow-sm"
                                            : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/5 text-lg">
                                        📅
                                    </span>

                                    <span>
                                        Calendar
                                    </span>
                                </Link>


                                <div className="pt-2" style={{ display: isTechnician ? "none" : undefined }}>
                                    <SidebarSection
                                        icon="📊"
                                        label="Rapoarte"
                                        open={reportsOpen}
                                        onToggle={() => setReportsOpen((value) => !value)}
                                        active={route().current("suppliers.*") || route().current("financial-reports.*") || route().current("warehouses.*") || route().current("revisions.*") || route().current("reports.technician-hours.*") || route().current("reports.activity-journal.*")}
                                    >
                                        <SidebarLink href={route("suppliers.index")} active={route().current("suppliers.*")} icon="🏭" label="Furnizori" />
                                        <SidebarLink href={route("financial-reports.suppliers.index")} active={route().current("financial-reports.suppliers.*")} icon="📊" label="Sold furnizori" />
                                        <SidebarLink href={route("financial-reports.receipts.index")} active={route().current("financial-reports.receipts.*")} icon="💰" label="Raport încasări" />
                                        <SidebarLink href={route("supplier-payments.index")} active={route().current("supplier-payments.*")} icon="💸" label="Registru plăți" />
                                        <SidebarLink href={route("financial-reports.invoices.index")} active={route().current("financial-reports.invoices.*")} icon="📈" label="Raport facturi" />
                                        <SidebarLink href={route("financial-reports.cash-register.index")} active={route().current("financial-reports.cash-register.*")} icon="💵" label="Registru de casă" />
                                        <SidebarLink href={route("financial-reports.stocks.index")} active={route().current("financial-reports.stocks.*")} icon="📦" label="Raport stocuri" />
                                        <SidebarLink href={route("financial-reports.minutes.index")} active={route().current("financial-reports.minutes.*")} icon="📝" label="Raport procese-verbale" />
                                        <SidebarLink href={route("financial-reports.contracts.index")} active={route().current("financial-reports.contracts.*")} icon="📃" label="Raport contracte" />
                                        <SidebarLink href={route("revisions.index")} active={route().current("revisions.*")} icon="🛡️" label="Revizii" />
                                        <SidebarLink href={route("operational-reports.show", "receptions")} active={route().current("operational-reports.show") && route().params.kind === "receptions"} icon="📥" label="Raport recepții" />
                                        <SidebarLink href={route("operational-reports.show", "proformas")} active={route().current("operational-reports.show") && route().params.kind === "proformas"} icon="📄" label="Raport proforme" />
                                        <SidebarLink href={route("operational-reports.show", "bank-journal")} active={route().current("operational-reports.show") && route().params.kind === "bank-journal"} icon="🏦" label="Jurnal bancă" />
                                        <SidebarLink href={route("operational-reports.show", "documents")} active={route().current("operational-reports.show") && route().params.kind === "documents"} icon="🗂️" label="Raport documente" />
                                        <SidebarLink href={route("operational-reports.show", "sales-agents")} active={route().current("operational-reports.show") && route().params.kind === "sales-agents"} icon="🧑‍💼" label="Vânzări pe agent" />
                                        <SidebarLink href={route("operational-reports.show", "sales-products")} active={route().current("operational-reports.show") && route().params.kind === "sales-products"} icon="📦" label="Vânzări pe produs" />
                                        <SidebarLink href={route("operational-reports.show", "product-profit")} active={route().current("operational-reports.show") && route().params.kind === "product-profit"} icon="💹" label="Profit produs" />
                                        <SidebarLink href={route("operational-reports.show", "expenses-categories")} active={route().current("operational-reports.show") && route().params.kind === "expenses-categories"} icon="📉" label="Cheltuieli pe categorii" />
                                        <SidebarLink href={route("reports.technician-hours.index")} active={route().current("reports.technician-hours.*")} icon="⏱️" label="Ore tehnicieni" />
                                        <SidebarLink href={route("reports.activity-journal.index")} active={route().current("reports.activity-journal.*")} icon="📋" label="Jurnal activități" />
                                        <SidebarLink href={route("warehouses.index")} active={route().current("warehouses.*")} icon="🏬" label="Gestiuni" />
                                    </SidebarSection>
                                </div>


                                {/* PRODUSE */}

                                {!isTechnician && <SidebarSection icon="📚" label="Nomenclatoare" open={nomenclaturesOpen} onToggle={() => setNomenclaturesOpen((value) => !value)} active={route().current("products.*") || route().current("services.*") || route().current("warehouses.*") || route().current("clients.*") || route().current("suppliers.*") || route().current("product-categories.*")}>
                                    <SidebarLink href={route("products.index")} active={route().current("products.*")} icon="📦" label="Produse" />
                                    <SidebarLink href={route("services.index")} active={route().current("services.*")} icon="🛠️" label="Servicii" />
                                    <SidebarLink href={route("warehouses.index")} active={route().current("warehouses.*")} icon="🏬" label="Gestiuni" />
                                    <SidebarLink href={route("clients.index")} active={route().current("clients.*")} icon="👥" label="Clienți" />
                                    <SidebarLink href={route("suppliers.index")} active={route().current("suppliers.*")} icon="🏭" label="Furnizori" />
                                    <SidebarLink href={route("product-categories.index")} active={route().current("product-categories.*")} icon="🏷️" label="Categorii și conturi" />
                                </SidebarSection>}

                                <Link
                                    href={route("attendance.index")}
                                    style={{ display: canAccess("attendance") ? undefined : "none" }}
                                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                        route().current("attendance.*")
                                            ? "bg-blue-600 text-white shadow-sm"
                                            : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/5 text-lg">
                                        ⏱️
                                    </span>
                                    <span>Pontaj</span>
                                </Link>



                                {/* ANGAJATI */}

                                <Link
                                    href={route("employees.index")}
                                    style={{ display: !isTechnician ? undefined : "none" }}
                                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                        route().current("employees.*")
                                            ? "bg-blue-600 text-white shadow-sm"
                                            : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/5 text-lg">
                                        👷
                                    </span>

                                    <span>
                                        Angajați
                                    </span>
                                </Link>


                                {!isTechnician && (
                                    <Link
                                        href={route("salary-slips.index")}
                                        className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                            route().current("salary-slips.*")
                                                ? "bg-blue-600 text-white shadow-sm"
                                                : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                    >
                                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/5 text-lg">💶</span>
                                        <span>Salarii și fluturași</span>
                                    </Link>
                                )}

                                {isAdministrator && (
                                    <SidebarSection
                                        icon="⚙️"
                                        label="Setări"
                                        open={settingsOpen}
                                        onToggle={() => setSettingsOpen((value) => !value)}
                                        active={route().current("notification-settings.*") || route().current("notifications.history") || route().current("users.*") || route().current("company-profile.*") || route().current("settings.*") || route().current("profile.*")}
                                    >
                                        <SidebarLink href={route("notification-settings.index")} active={route().current("notification-settings.*") || route().current("notifications.history")} icon="🔔" label="Notificări" />
                                        <SidebarLink href={route("users.index")} active={route().current("users.*")} icon="🔐" label="Utilizatori și drepturi" />
                                        <SidebarLink href={route("company-profile.edit")} active={route().current("company-profile.*")} icon="🏢" label="Date firmă" />
                                        <SidebarLink href={route("profile.edit")} active={route().current("profile.*")} icon="👤" label="Date cont" />
                                        <SidebarLink href={route("settings.edit", "bank-accounts")} active={route().params.section === "bank-accounts"} icon="🏦" label="Conturi bancare" />
                                        <SidebarLink href={route("settings.edit", "vat-rates")} active={route().params.section === "vat-rates"} icon="%" label="Cote TVA" />
                                        <SidebarLink href={route("settings.edit", "cash-registers")} active={route().params.section === "cash-registers"} icon="🧾" label="Case de marcat" />
                                        <SidebarLink href={route("settings.edit", "document-series")} active={route().params.section === "document-series"} icon="🔢" label="Serii documente" />
                                        <SidebarLink href={route("settings.edit", "product-preferences")} active={route().params.section === "product-preferences"} icon="📦" label="Preferințe produse" />
                                        <SidebarLink href={route("settings.edit", "document-preferences")} active={route().params.section === "document-preferences"} icon="📄" label="Preferințe documente" />
                                        <SidebarLink href={route("settings.edit", "personal-preferences")} active={route().params.section === "personal-preferences"} icon="⚙️" label="Preferințe personale" />
                                    </SidebarSection>
                                )}

                            </div>

                        </nav>


                        {/* USER ACTIONS */}

                        <div className="border-t border-gray-200 p-4">

                            <Dropdown>

                                <Dropdown.Trigger>

                                    <button
                                        type="button"
                                        className="flex w-full items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-left transition hover:bg-gray-100"
                                    >

                                        <div className="min-w-0">

                                            <div className="truncate text-sm font-semibold text-gray-800">
                                                {user.name}
                                            </div>

                                            <div className="truncate text-xs text-gray-500">
                                                {roleLabel}
                                            </div>

                                        </div>

                                        <svg
                                            className="h-4 w-4 shrink-0 text-gray-500"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 010 1.414l-4 4a1 1 0 010 1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>

                                    </button>

                                </Dropdown.Trigger>

                                <Dropdown.Content align="left" position="up">

                                    <Dropdown.Link
                                        href={route(
                                            "profile.edit"
                                        )}
                                    >
                                        Profil
                                    </Dropdown.Link>

                                    <Dropdown.Link
                                        href={route(
                                            "logout"
                                        )}
                                        method="post"
                                        as="button"
                                    >
                                        Deconectare
                                    </Dropdown.Link>

                                </Dropdown.Content>

                            </Dropdown>

                        </div>

                    </div>

                </aside>


                {/* ========================================================
                    ZONA PRINCIPALA
                ========================================================= */}

                <div className="min-w-0 flex-1">

                    {/* ====================================================
                        TOP BAR MOBILE
                    ==================================================== */}

                    <nav className="border-b border-gray-200 bg-white shadow-sm lg:hidden">

                        <div className="px-4 sm:px-6">

                            <div className="flex h-16 items-center justify-between">

                                <Link
                                    href={route(
                                        "dashboard"
                                    )}
                                >
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
                                </Link>


                                <button
                                    onClick={() =>
                                        setShowingNavigationDropdown(
                                            (
                                                previousState
                                            ) =>
                                                !previousState
                                        )
                                    }
                                    className="inline-flex items-center justify-center rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
                                >

                                    <svg
                                        className="h-6 w-6"
                                        stroke="currentColor"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >

                                        <path
                                            className={
                                                !showingNavigationDropdown
                                                    ? "inline-flex"
                                                    : "hidden"
                                            }
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />

                                        <path
                                            className={
                                                showingNavigationDropdown
                                                    ? "inline-flex"
                                                    : "hidden"
                                            }
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />

                                    </svg>

                                </button>

                            </div>

                        </div>


                        {/* MOBILE NAVIGATION */}

                        <div
                            className={
                                showingNavigationDropdown
                                    ? "block"
                                    : "hidden"
                            }
                        >

                            <div className="space-y-1 border-t border-gray-100 px-4 pb-3 pt-3">

                                {isTechnician && (
                                    <div className="mb-4 rounded-2xl bg-gradient-to-br from-blue-700 to-sky-600 px-4 py-4 text-white shadow-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/20 text-lg font-bold">
                                                {user.name?.slice(0, 1)?.toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-bold">{user.name}</p>
                                                <p className="mt-0.5 text-xs text-blue-100">Spațiul meu de lucru</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <ResponsiveNavLink
                                    href={route(
                                        "dashboard"
                                    )}
                                    style={{ display: canAccess("dashboard") ? undefined : "none" }}
                                    className={isTechnician ? technicianMobileLinkClass : ""}
                                    active={route().current(
                                        "dashboard"
                                    )}
                                >
                                    {isTechnician ? "🏠 Acasă" : "🏠 Dashboard"}
                                </ResponsiveNavLink>


                                <ResponsiveNavLink
                                    href={route(
                                        "clients.index"
                                    )}
                                    style={{ display: !isTechnician ? undefined : "none" }}
                                    active={route().current(
                                        "clients.*"
                                    )}
                                >
                                    👥 Clienți
                                </ResponsiveNavLink>


                                <ResponsiveNavLink
                                    href={route(
                                        "work_orders.index"
                                    )}
                                    style={{ display: canAccess("work_orders") ? undefined : "none" }}
                                    className={isTechnician ? technicianMobileLinkClass : ""}
                                    active={route().current(
                                        "work_orders.*"
                                    )}
                                >
                                    {isTechnician ? "🛠️ Lucrările mele" : "🛠️ Lucrări"}
                                </ResponsiveNavLink>


                                <ResponsiveNavLink
                                    href={route(
                                        "calendar.index"
                                    )}
                                    style={{ display: canAccess("calendar") ? undefined : "none" }}
                                    className={isTechnician ? technicianMobileLinkClass : ""}
                                    active={route().current(
                                        "calendar.*"
                                    )}
                                >
                                    📅 Calendar
                                </ResponsiveNavLink>


                                <div className="space-y-1 pt-2" style={{ display: isTechnician ? "none" : undefined }}>
                                    <MobileSection label="📄 Documente" open={documentsOpen} onToggle={() => setDocumentsOpen((value) => !value)}>
                                        <ResponsiveNavLink href={route("invoices.index")} active={route().current("invoices.*")}>🧾 Facturi</ResponsiveNavLink>
                                        <ResponsiveNavLink href={route("proformas.index")} active={route().current("proformas.*")}>📄 Proforme</ResponsiveNavLink>
                                        <ResponsiveNavLink href={route("receipts.index")} active={route().current("receipts.*")}>💰 Încasări</ResponsiveNavLink>
                                        <ResponsiveNavLink href={route("receptions.index")} active={route().current("receptions.*")}>📥 Recepții furnizori</ResponsiveNavLink>
                                        <ResponsiveNavLink href={route("spv.index")} active={route().current("spv.*")}>🏛️ SPV – Facturi primite</ResponsiveNavLink>
                                    </MobileSection>
                                    <MobileSection label="📑 Acte" open={actsOpen} onToggle={() => setActsOpen((value) => !value)}>
                                        <ResponsiveNavLink href={route("quotes.index")} active={route().current("quotes.*")}>📑 Oferte și devize</ResponsiveNavLink>
                                        <ResponsiveNavLink href={route("contracts.index")} active={route().current("contracts.*")}>📃 Contracte</ResponsiveNavLink>
                                        <ResponsiveNavLink href={route("projects.index")} active={route().current("projects.*")}>📁 Proiecte</ResponsiveNavLink>
                                        <ResponsiveNavLink href={route("reports.index")} active={route().current("reports.*")}>📝 Procese-verbale</ResponsiveNavLink>
                                    </MobileSection>
                                    <MobileSection label="📊 Rapoarte" open={reportsOpen} onToggle={() => setReportsOpen((value) => !value)}>
                                        <ResponsiveNavLink href={route("suppliers.index")} active={route().current("suppliers.*")}>🏭 Furnizori</ResponsiveNavLink>
                                        <ResponsiveNavLink href={route("financial-reports.suppliers.index")} active={route().current("financial-reports.suppliers.*")}>📊 Sold furnizori</ResponsiveNavLink>
                                        <ResponsiveNavLink href={route("financial-reports.receipts.index")} active={route().current("financial-reports.receipts.*")}>💰 Raport încasări</ResponsiveNavLink>
                                        <ResponsiveNavLink href={route("supplier-payments.index")} active={route().current("supplier-payments.*")}>💸 Registru plăți</ResponsiveNavLink>
                                        <ResponsiveNavLink href={route("financial-reports.invoices.index")} active={route().current("financial-reports.invoices.*")}>📈 Raport facturi</ResponsiveNavLink>
                                        <ResponsiveNavLink href={route("financial-reports.cash-register.index")} active={route().current("financial-reports.cash-register.*")}>💵 Registru de casă</ResponsiveNavLink>
                                        <ResponsiveNavLink href={route("financial-reports.minutes.index")} active={route().current("financial-reports.minutes.*")}>📝 Raport procese-verbale</ResponsiveNavLink>
                                        <ResponsiveNavLink href={route("financial-reports.contracts.index")} active={route().current("financial-reports.contracts.*")}>📃 Raport contracte</ResponsiveNavLink>
                                        <ResponsiveNavLink href={route("revisions.index")} active={route().current("revisions.*")}>🛡️ Revizii</ResponsiveNavLink>
                                        <ResponsiveNavLink href={route("operational-reports.show", "receptions")} active={route().current("operational-reports.show")}>📥 Raport recepții</ResponsiveNavLink>
                                        <ResponsiveNavLink href={route("operational-reports.show", "proformas")} active={route().current("operational-reports.show")}>📄 Raport proforme</ResponsiveNavLink>
                                        <ResponsiveNavLink href={route("operational-reports.show", "bank-journal")} active={route().current("operational-reports.show")}>🏦 Jurnal bancă</ResponsiveNavLink>
                                        <ResponsiveNavLink href={route("operational-reports.show", "documents")} active={route().current("operational-reports.show")}>🗂️ Raport documente</ResponsiveNavLink>
                                        <ResponsiveNavLink href={route("operational-reports.show", "sales-agents")} active={route().current("operational-reports.show")}>🧑‍💼 Vânzări pe agent</ResponsiveNavLink>
                                        <ResponsiveNavLink href={route("operational-reports.show", "sales-products")} active={route().current("operational-reports.show")}>📦 Vânzări pe produs</ResponsiveNavLink>
                                        <ResponsiveNavLink href={route("operational-reports.show", "product-profit")} active={route().current("operational-reports.show")}>💹 Profit produs</ResponsiveNavLink>
                                        <ResponsiveNavLink href={route("operational-reports.show", "expenses-categories")} active={route().current("operational-reports.show")}>📉 Cheltuieli pe categorii</ResponsiveNavLink>
                                        <ResponsiveNavLink href={route("reports.technician-hours.index")} active={route().current("reports.technician-hours.*")}>⏱️ Ore tehnicieni</ResponsiveNavLink>
                                        <ResponsiveNavLink href={route("reports.activity-journal.index")} active={route().current("reports.activity-journal.*")}>📋 Jurnal activități</ResponsiveNavLink>
                                        <ResponsiveNavLink href={route("warehouses.index")} active={route().current("warehouses.*")}>🏬 Gestiuni</ResponsiveNavLink>
                                    </MobileSection>
                                </div>


                                <ResponsiveNavLink
                                    href={route(
                                        "products.index"
                                    )}
                                    style={{ display: !isTechnician ? undefined : "none" }}
                                    active={route().current(
                                        "products.*"
                                    )}
                                >
                                    📦 Produse
                                </ResponsiveNavLink>

                                <ResponsiveNavLink
                                    href={route("services.index")}
                                    style={{ display: !isTechnician ? undefined : "none" }}
                                    active={route().current("services.*")}
                                >
                                    🛠️ Servicii
                                </ResponsiveNavLink>


                                <ResponsiveNavLink
                                    href={route(
                                        "employees.index"
                                    )}
                                    style={{ display: !isTechnician ? undefined : "none" }}
                                    active={route().current(
                                        "employees.*"
                                    )}
                                >
                                    👷 Angajați
                                </ResponsiveNavLink>


                                <ResponsiveNavLink
                                    href={route(
                                        "attendance.index"
                                    )}
                                    style={{ display: canAccess("attendance") ? undefined : "none" }}
                                    className={isTechnician ? technicianMobileLinkClass : ""}
                                    active={route().current(
                                        "attendance.*"
                                    )}
                                >
                                    ⏱️ Pontaj
                                </ResponsiveNavLink>

                                {isTechnician && (
                                    <ResponsiveNavLink
                                        href={route("notifications.index")}
                                        className={technicianMobileLinkClass}
                                        active={route().current("notifications.index")}
                                    >
                                        🔔 Notificări
                                    </ResponsiveNavLink>
                                )}

                            </div>


                            {/* USER MOBILE */}

                            <div className={`border-t border-gray-200 px-4 pb-4 pt-4 ${isTechnician ? "bg-slate-50" : ""}`}>

                                <div className={`mb-3 ${isTechnician ? "hidden" : ""}`}>

                                    <div className="text-base font-medium text-gray-800">
                                        {user.name}
                                    </div>

                                    <div className="text-sm font-medium text-gray-500">
                                        {user.email}
                                    </div>

                                </div>


                                <div className="space-y-1">

                                    <ResponsiveNavLink
                                        href={route(
                                            "profile.edit"
                                        )}
                                        className={isTechnician ? technicianMobileLinkClass : ""}
                                    >
                                        {isTechnician ? "👤 Profil" : "Profil"}
                                    </ResponsiveNavLink>

                                    <ResponsiveNavLink
                                        method="post"
                                        href={route(
                                            "logout"
                                        )}
                                        as="button"
                                        className={isTechnician ? "rounded-2xl px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700" : ""}
                                    >
                                        {isTechnician ? "↪ Deconectare" : "Deconectare"}
                                    </ResponsiveNavLink>

                                </div>

                            </div>

                        </div>

                    </nav>


                    {/* ====================================================
                        HEADER PAGINA
                    ==================================================== */}

                    {header && (
                        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 shadow-sm backdrop-blur-xl">
                            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                                {header}
                            </div>
                        </header>
                    )}


                    {/* ====================================================
                        CONTINUT
                    ==================================================== */}

                    <main className="min-h-screen w-full overflow-visible">
                        {children}
                    </main>

                </div>

            </div>

        </div>
    );
}

function SidebarSection({ icon, label, open, onToggle, active, children }) {
    return <div className="mt-1">
        <button type="button" onClick={onToggle} className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${active ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-100"}`}>
            <span className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-lg">{icon}</span><span>{label}</span></span>
            <span className={`text-xs transition-transform ${open ? "rotate-180" : ""}`}>▼</span>
        </button>
        {open && <div className="mt-1 space-y-1 pl-5">{children}</div>}
    </div>;
}

function SidebarLink({ href, active, icon, label }) {
    return <Link href={href} className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm transition ${active ? "bg-emerald-50 font-semibold text-emerald-700" : "text-gray-600 hover:bg-gray-100 hover:text-emerald-600"}`}><span>{icon}</span><span>{label}</span></Link>;
}

function MobileSection({ label, open, onToggle, children }) {
    return <div>
        <button type="button" onClick={onToggle} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100"><span>{label}</span><span className={`text-xs transition-transform ${open ? "rotate-180" : ""}`}>▼</span></button>
        {open && <div className="mt-1 space-y-1 pl-3">{children}</div>}
    </div>;
}
