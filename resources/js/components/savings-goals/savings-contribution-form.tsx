import { Form } from '@inertiajs/react';
import { ArrowRightLeft, Landmark, Plus } from 'lucide-react';

import {
    SelectField,
    TextAreaField,
    TextField,
} from '@/components/form-controls';
import Button, { ButtonLink } from '@/components/ui/button';
import { store } from '@/routes/savings-goals/contributions';
import { create as createTransaction } from '@/routes/transactions';
import type { SelectOption } from '@/types';

export default function SavingsContributionForm({
    goalId,
    accountOptions,
    defaultDate,
}: {
    goalId: string;
    accountOptions: SelectOption[];
    defaultDate: string;
}) {
    return (
        <Form {...store.form(goalId)} resetOnSuccess className="grid gap-4">
            {({ errors, processing }) => (
                <>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <TextField
                            label="Nominal setoran"
                            name="amount"
                            type="number"
                            min={1}
                            step={1}
                            placeholder="Contoh: 500000"
                            required
                            error={errors.amount}
                        />
                        <TextField
                            label="Tanggal setoran"
                            name="contributed_on"
                            type="date"
                            defaultValue={defaultDate}
                            required
                            error={errors.contributed_on}
                        />
                    </div>

                    <SelectField
                        label="Akun konteks (opsional)"
                        name="account_id"
                        defaultValue=""
                        error={errors.account_id}
                    >
                        <option value="">Tanpa akun konteks</option>
                        {accountOptions.map((account) => (
                            <option key={account.value} value={account.value}>
                                {account.label}
                            </option>
                        ))}
                    </SelectField>

                    <TextAreaField
                        label="Catatan (opsional)"
                        name="note"
                        maxLength={500}
                        placeholder="Tambahkan keterangan setoran"
                        error={errors.note}
                    />

                    <div className="grid gap-3 rounded-2xl border border-primary/20 bg-primary-soft/50 p-3.5 sm:grid-cols-[1fr_auto] sm:items-center">
                        <div className="flex items-start gap-3">
                            <Landmark className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <p className="text-xs leading-5 font-light text-muted-foreground">
                                Akun hanya menjadi konteks pencatatan. Setoran
                                ini tidak mengurangi saldo akun secara otomatis.
                            </p>
                        </div>
                        <ButtonLink
                            href={createTransaction.url()}
                            variant="outline"
                            size="sm"
                        >
                            <ArrowRightLeft className="h-4 w-4" />
                            Buat transfer
                        </ButtonLink>
                    </div>

                    <div className="flex justify-end border-t border-border pt-4">
                        <Button type="submit" size="sm" loading={processing}>
                            <Plus className="h-4 w-4" />
                            Catat setoran
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}
