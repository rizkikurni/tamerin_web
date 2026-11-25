import { Form } from '@inertiajs/react';
import { Bell, Save, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { TextAreaField, TextField } from '@/components/form-controls';
import Button from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { store, update } from '@/routes/reminders';
import type { ManualReminderListItem } from '@/types';

type Props = {
    open: boolean;
    reminder: ManualReminderListItem | null;
    onClose: () => void;
};

const SUGGESTIONS = [
    'Bayar Listrik & Air',
    'Bayar Wifi / Internet',
    'Cek Tagihan Kartu Kredit',
    'Setor Tabungan Bulanan',
    'Update Valuasi Investasi',
    'Tagih Pembayaran Piutang',
    'Evaluasi Budget Bulanan',
];

function getTodayString(): string {
    return new Date().toISOString().split('T')[0];
}

function getTomorrowString(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);

    return d.toISOString().split('T')[0];
}

function getDaysAhead(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);

    return d.toISOString().split('T')[0];
}

function getEndOfMonthString(): string {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return end.toISOString().split('T')[0];
}

function ReminderFormModal({
    reminder,
    onClose,
}: {
    reminder: ManualReminderListItem | null;
    onClose: () => void;
}) {
    const isEditing = reminder !== null;
    const form = isEditing ? update.form.patch(reminder.id) : store.form();

    const [title, setTitle] = useState(reminder?.title ?? '');
    const [dueOn, setDueOn] = useState(reminder?.due_on ?? '');

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, []);

    const todayString = getTodayString();
    const tomorrowString = getTomorrowString();
    const threeDaysString = getDaysAhead(3);
    const oneWeekString = getDaysAhead(7);
    const endOfMonthString = getEndOfMonthString();

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overscroll-contain bg-[var(--scrim)] p-3 backdrop-blur-sm sm:p-4"
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
                className="my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto overscroll-contain rounded-[22px] border border-[var(--glass-border-strong)] bg-surface p-4 shadow-[var(--popup-shadow)] sm:max-h-[90dvh] sm:p-6"
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                            <Bell className="h-5 w-5" />
                        </div>
                        <div>
                            <h2
                                id="reminder-form-title"
                                className="text-base font-medium text-foreground sm:text-lg"
                            >
                                {isEditing
                                    ? 'Ubah pengingat'
                                    : 'Pengingat baru'}
                            </h2>
                            <p className="mt-0.5 text-xs leading-5 font-light text-muted-foreground sm:text-sm">
                                Catat hal penting terkait keuangan yang perlu
                                Anda tindak lanjuti.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        aria-label="Tutup dialog"
                        onClick={onClose}
                        className="shrink-0 rounded-full p-2 text-muted-foreground transition hover:bg-surface-muted hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <Form
                    key={reminder?.id ?? 'create-reminder'}
                    {...form}
                    onSuccess={onClose}
                    className="mt-5 grid gap-4"
                >
                    {({ errors, processing }) => (
                        <>
                            {/* Judul & Inspirasi */}
                            <div className="grid gap-1.5">
                                <TextField
                                    label="Judul pengingat"
                                    name="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Contoh: Bayar tagihan internet bulanan"
                                    maxLength={160}
                                    required
                                    error={errors.title}
                                />
                                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                    <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                                        <Sparkles className="h-3 w-3 text-primary" />
                                        Inspirasi:
                                    </span>
                                    {SUGGESTIONS.map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => setTitle(preset)}
                                            className={cn(
                                                'rounded-lg border px-2 py-0.5 text-xs font-normal transition-all',
                                                title === preset
                                                    ? 'border-primary bg-primary-soft text-primary'
                                                    : 'border-border/80 bg-surface text-muted-foreground hover:border-primary/50 hover:text-foreground',
                                            )}
                                        >
                                            {preset}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tanggal & Pintasan Waktu */}
                            <div className="grid gap-1.5">
                                <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                                    <label
                                        htmlFor="due_on"
                                        className="text-xs font-medium text-foreground"
                                    >
                                        Tanggal pengingat (opsional)
                                    </label>
                                    <div className="flex flex-wrap items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setDueOn(todayString)
                                            }
                                            className={cn(
                                                'rounded-md px-2 py-0.5 text-[11px] transition-colors',
                                                dueOn === todayString
                                                    ? 'bg-primary-soft font-medium text-primary'
                                                    : 'bg-surface-muted text-muted-foreground hover:text-foreground',
                                            )}
                                        >
                                            Hari ini
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setDueOn(tomorrowString)
                                            }
                                            className={cn(
                                                'rounded-md px-2 py-0.5 text-[11px] transition-colors',
                                                dueOn === tomorrowString
                                                    ? 'bg-primary-soft font-medium text-primary'
                                                    : 'bg-surface-muted text-muted-foreground hover:text-foreground',
                                            )}
                                        >
                                            Besok
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setDueOn(threeDaysString)
                                            }
                                            className={cn(
                                                'rounded-md px-2 py-0.5 text-[11px] transition-colors',
                                                dueOn === threeDaysString
                                                    ? 'bg-primary-soft font-medium text-primary'
                                                    : 'bg-surface-muted text-muted-foreground hover:text-foreground',
                                            )}
                                        >
                                            3 hari
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setDueOn(oneWeekString)
                                            }
                                            className={cn(
                                                'rounded-md px-2 py-0.5 text-[11px] transition-colors',
                                                dueOn === oneWeekString
                                                    ? 'bg-primary-soft font-medium text-primary'
                                                    : 'bg-surface-muted text-muted-foreground hover:text-foreground',
                                            )}
                                        >
                                            1 minggu
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setDueOn(endOfMonthString)
                                            }
                                            className={cn(
                                                'rounded-md px-2 py-0.5 text-[11px] transition-colors',
                                                dueOn === endOfMonthString
                                                    ? 'bg-primary-soft font-medium text-primary'
                                                    : 'bg-surface-muted text-muted-foreground hover:text-foreground',
                                            )}
                                        >
                                            Akhir bln
                                        </button>
                                        {dueOn && (
                                            <button
                                                type="button"
                                                onClick={() => setDueOn('')}
                                                className="rounded-md px-2 py-0.5 text-[11px] text-danger"
                                            >
                                                Hapus
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <input
                                    id="due_on"
                                    name="due_on"
                                    type="date"
                                    value={dueOn}
                                    onChange={(e) => setDueOn(e.target.value)}
                                    className="border-input focus:border-ring focus:ring-ring w-full rounded-2xl border bg-surface px-3 py-2 text-sm text-foreground shadow-[var(--control-shadow)] focus:ring-1 focus:outline-none"
                                />
                                {errors.due_on && (
                                    <p className="text-xs text-danger">
                                        {errors.due_on}
                                    </p>
                                )}
                            </div>

                            <TextAreaField
                                label="Catatan tambahan (opsional)"
                                name="note"
                                defaultValue={reminder?.note ?? ''}
                                maxLength={500}
                                placeholder="Tambahkan nomor rekening, batas toleransi, atau instruksi singkat"
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
                                    className="rounded-full px-5"
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

export default function ReminderFormDialog({ open, reminder, onClose }: Props) {
    if (!open) {
        return null;
    }

    return (
        <ReminderFormModal
            key={reminder?.id ?? 'create-reminder'}
            reminder={reminder}
            onClose={onClose}
        />
    );
}
