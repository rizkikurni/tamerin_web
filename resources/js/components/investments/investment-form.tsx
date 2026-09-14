import { Form } from '@inertiajs/react';
import { Save, TrendingUp } from 'lucide-react';

import { SelectField, TextField } from '@/components/form-controls';
import Button, { ButtonLink } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { index, show, store, update } from '@/routes/investments';
import type { InvestmentFormData, SelectOption } from '@/types';

type InvestmentFormProps = {
    investment?: InvestmentFormData;
    instrumentOptions: SelectOption[];
    defaultAcquiredOn?: string;
};

export default function InvestmentForm({
    investment,
    instrumentOptions,
    defaultAcquiredOn,
}: InvestmentFormProps) {
    const isEditing = investment !== undefined;
    const form = isEditing ? update.form.patch(investment.id) : store.form();
    const cancelHref = isEditing ? show.url(investment.id) : index.url();

    return (
        <Card variant="navbar">
            <CardContent className="grid gap-5 p-5 sm:p-6">
                <div className="flex items-start gap-3 border-b border-border/70 pb-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                        <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-medium text-foreground">
                            {isEditing
                                ? 'Informasi investasi'
                                : 'Investasi baru'}
                        </h2>
                        <p className="mt-1 text-sm leading-6 font-light text-muted-foreground">
                            Catat modal perolehan dan unit. Nilai terkini
                            dicatat terpisah melalui valuasi.
                        </p>
                    </div>
                </div>

                <Form {...form} className="grid gap-4">
                    {({ errors, processing }) => (
                        <>
                            <TextField
                                label="Nama investasi"
                                name="name"
                                defaultValue={investment?.name ?? ''}
                                placeholder="Contoh: Saham BBCA"
                                maxLength={120}
                                required
                                autoFocus
                                error={errors.name}
                            />

                            <div className="grid gap-4 sm:grid-cols-2">
                                <SelectField
                                    label="Jenis instrumen"
                                    name="instrument_type"
                                    defaultValue={
                                        investment?.instrument_type ?? ''
                                    }
                                    required
                                    error={errors.instrument_type}
                                >
                                    <option value="" disabled>
                                        Pilih jenis
                                    </option>
                                    {instrumentOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </SelectField>
                                <TextField
                                    label="Tanggal perolehan"
                                    name="acquired_on"
                                    type="date"
                                    defaultValue={
                                        investment?.acquired_on ??
                                        defaultAcquiredOn ??
                                        ''
                                    }
                                    required
                                    error={errors.acquired_on}
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <TextField
                                    label="Modal perolehan"
                                    name="acquisition_cost"
                                    type="number"
                                    min={0}
                                    step={1}
                                    defaultValue={
                                        investment?.acquisition_cost ?? ''
                                    }
                                    placeholder="Contoh: 10000000"
                                    required
                                    error={errors.acquisition_cost}
                                />
                                <TextField
                                    label="Jumlah unit (opsional)"
                                    name="units"
                                    type="number"
                                    min="0.00000001"
                                    step="0.00000001"
                                    defaultValue={investment?.units ?? ''}
                                    placeholder="Contoh: 10.5"
                                    error={errors.units}
                                />
                            </div>

                            <p className="rounded-2xl border border-primary/10 bg-primary-soft/60 p-3.5 text-xs leading-5 font-light text-muted-foreground dark:border-border dark:bg-background/60">
                                Unit harus lebih dari nol dan dapat memakai
                                maksimal delapan angka desimal.
                            </p>

                            <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
                                <ButtonLink
                                    href={cancelHref}
                                    variant="ghost"
                                    size="sm"
                                >
                                    Batal
                                </ButtonLink>
                                <Button
                                    type="submit"
                                    size="sm"
                                    loading={processing}
                                >
                                    <Save className="h-4 w-4" />
                                    {isEditing
                                        ? 'Simpan perubahan'
                                        : 'Buat investasi'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </CardContent>
        </Card>
    );
}
