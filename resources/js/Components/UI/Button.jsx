export default function Button({
    children,
    type = "button",
    onClick,
    className = "",
    disabled = false,
    variant = "primary",
}) {
    const variants = {
        primary:
            "bg-blue-600 hover:bg-blue-700 text-white shadow-sm",
        secondary:
            "bg-slate-700 hover:bg-slate-800 text-white",
        success:
            "bg-emerald-600 hover:bg-emerald-700 text-white",
        danger:
            "bg-rose-600 hover:bg-rose-700 text-white",
        warning:
            "bg-amber-500 hover:bg-amber-600 text-white",
        outline:
            "border border-slate-300 bg-white hover:bg-slate-50 text-slate-700",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`
                inline-flex items-center justify-center
                min-h-10 rounded-lg
                px-4 py-2
                text-sm font-semibold
                transition
                duration-200
                disabled:opacity-50
                disabled:cursor-not-allowed
                ${variants[variant]}
                ${className}
            `}
        >
            {children}
        </button>
    );
}
