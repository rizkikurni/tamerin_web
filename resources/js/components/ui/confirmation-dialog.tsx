import { Archive, X } from 'lucide-react';

import Button from '@/components/ui/button';

type ConfirmationDialogProps = {
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    processing?: boolean;
    onCancel: () => void;
    onConfirm: () => void;
};

export default function ConfirmationDialog({
    open,
    title,
    description,
    confirmLabel = 'Arsipkan',
    processing = false,
    onCancel,
    onConfirm,
}: ConfirmationDialogProps) {
    if (!open) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--scrim)] p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.currentTarget === event.target && !processing) {
                    onCancel();
                }
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirmation-dialog-title"
                className="w-full max-w-md rounded-3xl border border-[var(--glass-border-strong)] bg-surface p-5 shadow-[var(--popup-shadow)]"
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-warning/10 text-warning">
                        <Archive className="h-5 w-5" />
                    </div>
                    <button
                        type="button"
                        aria-label="Tutup dialog"
                        disabled={processing}
                        onClick={onCancel}
                        className="rounded-xl p-2 text-muted-foreground transition hover:bg-surface-muted hover:text-foreground disabled:opacity-50"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <h2
                    id="confirmation-dialog-title"
                    className="mt-4 text-lg font-medium text-foreground"
                >
                    {title}
                </h2>
                <p className="mt-1.5 text-sm font-light leading-6 text-muted-foreground">
                    {description}
                </p>

                <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={processing}
                        onClick={onCancel}
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        loading={processing}
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}
