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
        <label className="grid gap-1.5 text-sm font-medium text-foreground-secondary">
            <span>{label}</span>
            <input
                name={name}
                className={`rounded-xl border border-border bg-surface px-3 py-2 text-foreground transition outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 ${className}`}
                {...props}
            />
            {error && (
                <span className="text-xs font-normal text-danger">{error}</span>
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
        <label className="grid gap-1.5 text-sm font-medium text-foreground-secondary">
            <span>{label}</span>
            <select
                name={name}
                className="rounded-xl border border-border bg-surface px-3 py-2 text-foreground transition outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                {...props}
            >
                {children}
            </select>
            {error && (
                <span className="text-xs font-normal text-danger">{error}</span>
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
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
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
        <p className="rounded-xl bg-success/10 px-3 py-2 text-sm text-success">
            {translatedMessages[message] ?? message}
        </p>
    );
}
