import { Form } from '@inertiajs/react';
import { Bell, Save, Sparkles, X } from 'lucide-react';
import { useState } from 'react';

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
                <p className="mt-1 text-sm leading-6 font-light text-muted-foreground">
                    Catat hal penting terkait keuangan yang perlu Anda lakukan
                    atau tindak lanjuti.
                </p>

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
                                    autoFocus
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
                                <div className="flex items-center justify-between">
                                    <label
                                        htmlFor="due_on"
                                        className="text-xs font-medium text-foreground"
                                    >
                                        Tanggal pengingat (opsional)
                                    </label>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setDueOn(getTodayString())
                                            }
                                            className={cn(
                                                'rounded px-1.5 py-0.5 text-[11px] transition-colors',
                                                dueOn === getTodayString()
                                                    ? 'bg-primary-soft font-semibold text-primary'
                                                    : 'text-muted-foreground hover:text-foreground',
                                            )}
                                        >
                                            Hari ini
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setDueOn(getTomorrowString())
                                            }
                                            className={cn(
                                                'rounded px-1.5 py-0.5 text-[11px] transition-colors',
                                                dueOn === getTomorrowString()
                                                    ? 'bg-primary-soft font-semibold text-primary'
                                                    : 'text-muted-foreground hover:text-foreground',
                                            )}
                                        >
                                            Besok
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setDueOn(getDaysAhead(3))
                                            }
                                            className="rounded px-1.5 py-0.5 text-[11px] text-muted-foreground hover:text-foreground"
                                        >
                                            3 hari
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setDueOn(getDaysAhead(7))
                                            }
                                            className="rounded px-1.5 py-0.5 text-[11px] text-muted-foreground hover:text-foreground"
                                        >
                                            1 minggu
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setDueOn(getEndOfMonthString())
                                            }
                                            className="rounded px-1.5 py-0.5 text-[11px] text-muted-foreground hover:text-foreground"
                                        >
                                            Akhir bln
                                        </button>
                                        {dueOn && (
                                            <button
                                                type="button"
                                                onClick={() => setDueOn('')}
                                                className="rounded px-1.5 py-0.5 text-[11px] text-danger"
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
