export default function InputField({
    label,
    error,
    required = false,
    className = "",
    ...props
}) {
    return (
        <div className={className}>
            {label && (
                <label className="mb-2 block text-sm font-medium text-gray-700">
                    {label}
                    {required && (
                        <span className="ml-1 text-red-600">*</span>
                    )}
                </label>
            )}

            <input
                {...props}
                className="
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    px-4
                    py-2.5
                    focus:border-blue-500
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-200
                "
            />

            {error && (
                <p className="mt-1 text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}