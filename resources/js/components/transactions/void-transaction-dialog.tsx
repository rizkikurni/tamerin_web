import { Form } from '@inertiajs/react';
import { Ban, X } from 'lucide-react';

import { TextAreaField } from '@/components/form-controls';
import Button from '@/components/ui/button';
import { voidMethod } from '@/routes/transactions';

type VoidTransactionDialogProps = {
    open: boolean;
    transactionId: string;
    onClose: () => void;
};

export default function VoidTransactionDialog({
    open,
    transactionId,
    onClose,
}: VoidTransactionDialogProps) {
    if (!open) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--scrim)] p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.currentTarget === event.target) {
                    onClose();
                }
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="void-transaction-title"
                className="w-full max-w-md rounded-[22px] border border-[var(--glass-border-strong)] bg-surface p-5 shadow-[var(--popup-shadow)]"
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-danger/10 text-danger">
                        <Ban className="h-5 w-5" />
                    </div>
                    <button
                        type="button"
                        aria-label="Tutup dialog"
                        onClick={onClose}
                        className="rounded-full p-2 text-muted-foreground transition hover:bg-surface-muted hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <h2
                    id="void-transaction-title"
                    className="mt-4 text-lg font-medium text-foreground"
                >
                    Batalkan transaksi?
                </h2>
                <p className="mt-1.5 text-sm leading-6 font-light text-muted-foreground">
                    Dampak transaksi akan dikeluarkan dari perhitungan saldo.
                    Transaksi dan alasan pembatalan tetap tersimpan sebagai
                    histori.
                </p>

                <Form
                    {...voidMethod.form.patch(transactionId)}
                    onSuccess={onClose}
                    className="mt-5 grid gap-4"
                >
                    {({ errors, processing }) => (
                        <>
                            <TextAreaField
                                label="Alasan pembatalan"
                                name="void_reason"
                                maxLength={500}
                                required
                                autoFocus
                                placeholder="Jelaskan mengapa transaksi ini dibatalkan"
                                error={errors.void_reason}
                            />

                            <div className="flex justify-end gap-2 border-t border-border pt-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    disabled={processing}
                                    onClick={onClose}
                                >
                                    Kembali
                                </Button>
                                <Button
                                    type="submit"
                                    variant="danger"
                                    size="sm"
                                    loading={processing}
                                >
                                    Batalkan Transaksi
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </div>
    );
}
