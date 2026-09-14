import { Form } from '@inertiajs/react';
import { CalendarClock, HandCoins, Save } from 'lucide-react';

import {
    SelectField,
    TextAreaField,
    TextField,
} from '@/components/form-controls';
import Button, { ButtonLink } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { index, show, store, update } from '@/routes/obligations';
import type { ObligationFormData, SelectOption } from '@/types';

type Props = {
    obligation?: ObligationFormData;
    kindOptions: SelectOption[];
    defaultStartedOn?: string;
};

export default function ObligationForm({
    obligation,
    kindOptions,
    defaultStartedOn,
}: Props) {
    const isEditing = obligation !== undefined;
    const form = isEditing ? update.form.patch(obligation.id) : store.form();

    return (
        <Card variant="navbar">
            <CardContent className="grid gap-5 p-5 sm:p-6">
                <div className="flex items-start gap-3 border-b border-border/70 pb-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                        <HandCoins className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-medium text-foreground">
                            {isEditing ? 'Informasi kewajiban' : 'Catatan baru'}
                        </h2>
                        <p className="mt-1 text-sm leading-6 font-light text-muted-foreground">
                            Catat utang yang harus dibayar atau piutang yang
                            perlu ditagih.
                        </p>
                    </div>
                </div>

                <Form {...form} className="grid gap-4">
                    {({ errors, processing }) => (
                        <>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <SelectField
                                    label="Jenis"
                                    name="kind"
                                    defaultValue={obligation?.kind ?? ''}
                                    required
                                    error={errors.kind}
                                >
                                    <option value="" disabled>
                                        Pilih jenis
                                    </option>
                                    {kindOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </SelectField>
                                <TextField
                                    label="Nama pihak"
                                    name="counterparty_name"
                                    defaultValue={
                                        obligation?.counterparty_name ?? ''
                                    }
                                    placeholder="Contoh: Budi atau Bank ABC"
                                    maxLength={120}
                                    required
                                    error={errors.counterparty_name}
                                />
                            </div>

                            <TextField
                                label="Nominal awal"
                                name="original_amount"
                                type="number"
                                min={1}
                                step={1}
                                defaultValue={obligation?.original_amount ?? ''}
                                placeholder="Contoh: 5000000"
                                required
                                error={errors.original_amount}
                            />

                            <div className="grid gap-4 sm:grid-cols-2">
                                <TextField
                                    label="Tanggal mulai"
                                    name="started_on"
                                    type="date"
                                    defaultValue={
                                        obligation?.started_on ??
                                        defaultStartedOn ??
                                        ''
                                    }
                                    required
                                    error={errors.started_on}
                                />
                                <TextField
                                    label="Jatuh tempo (opsional)"
                                    name="due_on"
                                    type="date"
                                    defaultValue={obligation?.due_on ?? ''}
                                    error={errors.due_on}
                                />
                            </div>

                            <TextAreaField
                                label="Catatan (opsional)"
                                name="note"
                                defaultValue={obligation?.note ?? ''}
                                maxLength={500}
                                placeholder="Perjanjian, tujuan, atau keterangan lain"
                                error={errors.note}
                            />

                            <div className="flex items-start gap-3 rounded-2xl border border-primary/10 bg-primary-soft/60 p-3.5 dark:border-border dark:bg-background/60">
                                <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                <p className="text-xs leading-5 font-light text-muted-foreground">
                                    Pembayaran dicatat dari halaman detail dan
                                    otomatis memengaruhi saldo akun keuangan.
                                </p>
                            </div>

                            <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
                                <ButtonLink
                                    href={
                                        isEditing
                                            ? show.url(obligation.id)
                                            : index.url()
                                    }
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
                                        : 'Buat catatan'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </CardContent>
        </Card>
    );
}
