import { Form } from '@inertiajs/react';
import { CalendarDays, Save, Wallet, X } from 'lucide-react';

import { SelectField, TextField } from '@/components/form-controls';
import Button from '@/components/ui/button';
import { store, update } from '@/routes/budgets';
import type { BudgetListItem, DashboardPeriod, SelectOption } from '@/types';

type BudgetFormDialogProps = {
    open: boolean;
    period: DashboardPeriod;
    categoryOptions: SelectOption[];
    budget: BudgetListItem | null;
    onClose: () => void;
};

export default function BudgetFormDialog({
    open,
    period,
    categoryOptions,
    budget,
    onClose,
}: BudgetFormDialogProps) {
    if (!open) {
        return null;
    }

    const isEditing = budget !== null;
    const form = isEditing ? update.form.patch(budget.id) : store.form();

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
                aria-labelledby="budget-form-title"
                className="w-full max-w-lg rounded-[22px] border border-[var(--glass-border-strong)] bg-surface p-5 shadow-[var(--popup-shadow)]"
            >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                        <Wallet className="h-5 w-5" />
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
                    id="budget-form-title"
                    className="mt-4 text-lg font-medium text-foreground"
                >
                    {isEditing ? 'Ubah budget' : 'Buat budget'}
                </h2>
                <p className="mt-1.5 text-sm leading-6 font-light text-muted-foreground">
                    {isEditing
                        ? 'Perbarui batas pengeluaran kategori ini.'
                        : 'Tetapkan batas pengeluaran untuk satu kategori pada bulan terpilih.'}
                </p>

                <Form
                    key={budget?.id ?? 'create-budget'}
                    {...form}
                    onSuccess={onClose}
                    className="mt-5 grid gap-4"
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-primary-soft/60 p-3 dark:border-border dark:bg-background/60">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                                    <CalendarDays className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-light text-muted-foreground">
                                        Periode budget
                                    </p>
                                    <p className="text-sm font-medium text-foreground">
                                        {period.label}
                                    </p>
                                </div>
                            </div>

                            {!isEditing && (
                                <>
                                    <input
                                        type="hidden"
                                        name="period"
                                        value={period.value}
                                    />
                                    <SelectField
                                        label="Kategori pengeluaran"
                                        name="category_id"
                                        defaultValue=""
                                        required
                                        autoFocus
                                        error={errors.category_id}
                                    >
                                        <option value="" disabled>
                                            Pilih kategori
                                        </option>
                                        {categoryOptions.map((category) => (
                                            <option
                                                key={category.value}
                                                value={category.value}
                                            >
                                                {category.label}
                                            </option>
                                        ))}
                                    </SelectField>
                                    {errors.period && (
                                        <p className="text-xs text-danger">
                                            {errors.period}
                                        </p>
                                    )}
                                </>
                            )}

                            {isEditing && (
                                <div className="rounded-2xl border border-primary/10 bg-primary-soft/60 p-3 dark:border-border dark:bg-background/60">
                                    <p className="text-xs font-light text-muted-foreground">
                                        Kategori
                                    </p>
                                    <p className="mt-0.5 text-sm font-medium text-foreground">
                                        {budget.category.name}
                                    </p>
                                </div>
                            )}

                            <TextField
                                label="Nominal budget"
                                name="amount"
                                type="number"
                                min={1}
                                step={1}
                                defaultValue={budget?.amount ?? ''}
                                placeholder="Contoh: 1500000"
                                required
                                autoFocus={isEditing}
                                error={errors.amount}
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
                                        : 'Simpan budget'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </div>
    );
}
