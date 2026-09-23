import { Link } from "@inertiajs/react";

export default function PageHeader({
    title,
    subtitle = "",
    action = null,
}) {
    return (
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold tracking-[-0.025em] text-slate-950 sm:text-3xl">
                    {title}
                </h1>

                {subtitle && (
                    <p className="mt-1 text-sm text-slate-500">
                        {subtitle}
                    </p>
                )}
            </div>

            {action && <div>{action}</div>}
        </div>
    );
}
