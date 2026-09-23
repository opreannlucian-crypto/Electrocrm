export default function Card({
    children,
    title = "",
    className = "",
    footer = null,
}) {
    return (
        <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
            {title && (
                <div className="border-b px-6 py-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                        {title}
                    </h2>
                </div>
            )}

            <div className="p-6">
                {children}
            </div>

            {footer && (
                <div className="rounded-b-2xl border-t border-slate-100 bg-slate-50 px-6 py-4">
                    {footer}
                </div>
            )}
        </div>
    );
}
