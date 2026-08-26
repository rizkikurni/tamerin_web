import { Form, Link } from '@inertiajs/react';
import { Save } from 'lucide-react';

import { SelectField, TextField } from '@/components/form-controls';
import Button from '@/components/ui/button';
import type { FinancialAccountFormData, SelectOption } from '@/types';

type FinancialAccountFormProps = {
    form: { action: string; method: 'post' };
    accountTypes: SelectOption[];
    cancelUrl: string;
    account?: FinancialAccountFormData;
    submitLabel: string;
};

export default function FinancialAccountForm({
    form,
    accountTypes,
    cancelUrl,
    account,
    submitLabel,
}: FinancialAccountFormProps) {
    return (
        <Form {...form} className="grid gap-5">
            {({ errors, processing }) => (
                <>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <TextField
                            label="Nama akun"
                            name="name"
                            defaultValue={account?.name ?? ''}
                            placeholder="Contoh: Rekening utama"
                            maxLength={80}
                            autoFocus
                            required
                            error={errors.name}
                        />
                        <SelectField
                            label="Tipe akun"
                            name="type"
                            defaultValue={account?.type ?? ''}
                            required
                            error={errors.type}
                        >
                            <option value="" disabled>
                                Pilih tipe akun
                            </option>
                            {accountTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </SelectField>
                        <TextField
                            label="Saldo awal"
                            name="opening_balance"
                            type="number"
                            inputMode="numeric"
                            step="1"
                            defaultValue={account?.opening_balance ?? 0}
                            required
                            error={errors.opening_balance}
                        />
                        <TextField
                            label="Tanggal dibuka"
                            name="opened_on"
                            type="date"
                            defaultValue={account?.opened_on ?? ''}
                            required
                            error={errors.opened_on}
                        />
                    </div>

                    <p className="rounded-2xl bg-primary-soft px-4 py-3 text-xs leading-5 font-light text-primary">
                        Saldo awal menjadi titik mulai pencatatan. Nilai ini
                        bukan saldo berjalan setelah transaksi dicatat.
                    </p>

                    <div className="flex justify-end gap-2 border-t border-border pt-5">
                        <Link
                            href={cancelUrl}
                            className="inline-flex h-9 items-center justify-center rounded-xl px-3 text-sm font-medium text-foreground transition hover:bg-surface-muted"
                        >
                            Batal
                        </Link>
                        <Button type="submit" size="sm" loading={processing}>
                            <Save className="h-4 w-4" />
                            {submitLabel}
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}
