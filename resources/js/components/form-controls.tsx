import type {
    ButtonHTMLAttributes,
    InputHTMLAttributes,
    ReactNode,
    SelectHTMLAttributes,
} from 'react';

type FieldProps = {
    label: string;
    name: string;
    error?: string;
};

export function TextField({
    label,
    name,
    error,
    className = '',
    ...props
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
    return (
        <label className="grid gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
            <span>{label}</span>
            <input
                name={name}
                className={`rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 transition outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-sky-900 ${className}`}
                {...props}
            />
            {error && (
                <span className="text-xs font-normal text-red-600">
                    {error}
                </span>
            )}
        </label>
    );
}

export function SelectField({
    label,
    name,
    error,
    children,
    ...props
}: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <label className="grid gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
            <span>{label}</span>
            <select
                name={name}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 transition outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-sky-900"
                {...props}
            >
                {children}
            </select>
            {error && (
                <span className="text-xs font-normal text-red-600">
                    {error}
                </span>
            )}
        </label>
    );
}

export function SubmitButton({
    processing,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
    processing: boolean;
    children: ReactNode;
}) {
    return (
        <button
            type="submit"
            disabled={processing}
            className="rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            {...props}
        >
            {processing ? 'Memproses...' : children}
        </button>
    );
}

export function StatusMessage({ message }: { message?: string | null }) {
    if (!message) {
        return null;
    }

    const translatedMessages: Record<string, string> = {
        'profile-updated': 'Profil berhasil diperbarui.',
        'password-updated': 'Kata sandi berhasil diperbarui.',
        'preferences-updated': 'Preferensi berhasil diperbarui.',
    };

    return (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            {translatedMessages[message] ?? message}
        </p>
    );
}
