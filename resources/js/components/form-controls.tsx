import type {
    ButtonHTMLAttributes,
    InputHTMLAttributes,
    ReactNode,
    SelectHTMLAttributes,
    TextareaHTMLAttributes,
} from 'react';

import { cn } from '@/lib/utils';

type FieldProps = {
    label: string;
    name: string;
    error?: string;
};

const formControlClassName = cn(
    'h-11 rounded-xl border-2 border-border-strong bg-background/70 px-3 py-2',
    'text-foreground shadow-[var(--control-shadow)] outline-none',
    'placeholder:text-muted-foreground',
    'transition-[border-color,background-color,box-shadow] duration-200',
    'hover:border-primary/40',
    'focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/20',
    'disabled:cursor-not-allowed disabled:opacity-60',
);

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
                className={cn(formControlClassName, className)}
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
    className,
    ...props
}: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <label className="grid gap-1.5 text-sm font-medium text-foreground-secondary">
            <span>{label}</span>
            <select
                name={name}
                className={cn(formControlClassName, className)}
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

export function TextAreaField({
    label,
    name,
    error,
    className,
    ...props
}: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <label className="grid gap-1.5 text-sm font-medium text-foreground-secondary">
            <span>{label}</span>
            <textarea
                name={name}
                className={cn(
                    formControlClassName,
                    'h-auto min-h-28 resize-y py-3',
                    className,
                )}
                {...props}
            />
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
        'financial-account-created': 'Akun keuangan berhasil ditambahkan.',
        'financial-account-updated': 'Akun keuangan berhasil diperbarui.',
        'financial-account-archived': 'Akun keuangan berhasil diarsipkan.',
        'category-created': 'Kategori berhasil ditambahkan.',
        'category-updated': 'Kategori berhasil diperbarui.',
        'category-archived': 'Kategori berhasil diarsipkan.',
        'transaction-created': 'Transaksi berhasil dicatat.',
        'transaction-voided': 'Transaksi berhasil dibatalkan.',
    };

    return (
        <p className="rounded-xl bg-success/10 px-3 py-2 text-sm text-success">
            {translatedMessages[message] ?? message}
        </p>
    );
}
