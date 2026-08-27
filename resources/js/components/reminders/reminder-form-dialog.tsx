import { Form } from '@inertiajs/react';
import { Bell, Save, X } from 'lucide-react';

import { TextAreaField, TextField } from '@/components/form-controls';
import Button from '@/components/ui/button';
import { store, update } from '@/routes/reminders';
import type { ManualReminderListItem } from '@/types';

type Props = {
    open: boolean;
    reminder: ManualReminderListItem | null;
    onClose: () => void;
};

export default function ReminderFormDialog({ open, reminder, onClose }: Props) {
    if (!open) {
        return null;
    }

    const isEditing = reminder !== null;
    const form = isEditing ? update.form.patch(reminder.id) : store.form();

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
                aria-labelledby="reminder-form-title"
                className="w-full max-w-lg rounded-[22px] border border-[var(--glass-border-strong)] bg-surface p-5 shadow-[var(--popup-shadow)]"
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                        <Bell className="h-5 w-5" />
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
                    id="reminder-form-title"
                    className="mt-4 text-lg font-medium text-foreground"
                >
                    {isEditing ? 'Ubah pengingat' : 'Pengingat baru'}
                </h2>
                <p className="mt-1.5 text-sm leading-6 font-light text-muted-foreground">
                    Simpan hal penting yang perlu ditindaklanjuti nanti.
                </p>

                <Form
                    key={reminder?.id ?? 'create-reminder'}
                    {...form}
                    onSuccess={onClose}
                    className="mt-5 grid gap-4"
                >
                    {({ errors, processing }) => (
                        <>
                            <TextField
                                label="Judul"
                                name="title"
                                defaultValue={reminder?.title ?? ''}
                                placeholder="Contoh: Bayar tagihan listrik"
                                maxLength={160}
                                required
                                autoFocus
                                error={errors.title}
                            />
                            <TextField
                                label="Tanggal (opsional)"
                                name="due_on"
                                type="date"
                                defaultValue={reminder?.due_on ?? ''}
                                error={errors.due_on}
                            />
                            <TextAreaField
                                label="Catatan (opsional)"
                                name="note"
                                defaultValue={reminder?.note ?? ''}
                                maxLength={500}
                                placeholder="Tambahkan konteks atau langkah berikutnya"
                                error={errors.note}
                            />
                            <div className="flex justify-end gap-2 border-t border-border pt-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    disabled={processing}
                                    onClick={onClose}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    loading={processing}
                                >
                                    <Save className="h-4 w-4" />
                                    {isEditing
                                        ? 'Simpan perubahan'
                                        : 'Simpan pengingat'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </div>
    );
}
