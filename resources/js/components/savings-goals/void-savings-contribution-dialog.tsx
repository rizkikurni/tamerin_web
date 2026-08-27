import { Form } from '@inertiajs/react';
import { Ban, X } from 'lucide-react';

import { TextAreaField } from '@/components/form-controls';
import Button from '@/components/ui/button';
import { voidMethod } from '@/routes/savings-contributions';

export default function VoidSavingsContributionDialog({
    contributionId,
    onClose,
}: {
    contributionId: string | null;
    onClose: () => void;
}) {
    if (contributionId === null) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--scrim)] p-4 backdrop-blur-sm">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="void-contribution-title"
                className="w-full max-w-md rounded-3xl border border-[var(--glass-border-strong)] bg-surface p-5 shadow-[var(--popup-shadow)]"
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-danger/10 text-danger">
                        <Ban className="h-5 w-5" />
                    </div>
                    <button
                        type="button"
                        aria-label="Tutup dialog"
                        onClick={onClose}
                        className="rounded-xl p-2 text-muted-foreground transition hover:bg-surface-muted hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <h2
                    id="void-contribution-title"
                    className="mt-4 text-lg font-medium text-foreground"
                >
                    Batalkan setoran?
                </h2>
                <p className="mt-1.5 text-sm leading-6 font-light text-muted-foreground">
                    Setoran tetap tersimpan sebagai riwayat, tetapi tidak lagi
                    dihitung dalam progres target.
                </p>

                <Form
                    {...voidMethod.form.patch(contributionId)}
                    onSuccess={onClose}
                    resetOnSuccess
                    className="mt-5 grid gap-4"
                >
                    {({ errors, processing }) => (
                        <>
                            <TextAreaField
                                label="Alasan pembatalan"
                                name="void_reason"
                                maxLength={500}
                                placeholder="Jelaskan alasan setoran dibatalkan"
                                required
                                autoFocus
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
                                    <Ban className="h-4 w-4" />
                                    Batalkan setoran
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </div>
    );
}
