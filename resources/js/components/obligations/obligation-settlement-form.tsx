import { Form } from '@inertiajs/react';
import { Landmark, Plus } from 'lucide-react';

import {
    SelectField,
    TextAreaField,
    TextField,
} from '@/components/form-controls';
import Button from '@/components/ui/button';
import { store } from '@/routes/obligations/settlements';
import type { ObligationKind, SelectOption } from '@/types';

export default function ObligationSettlementForm({
    obligationId,
    kind,
    outstandingAmount,
    accountOptions,
    defaultDate,
    idempotencyKey,
}: {
    obligationId: string;
    kind: ObligationKind;
    outstandingAmount: number;
    accountOptions: SelectOption[];
    defaultDate: string;
    idempotencyKey: string;
}) {
    return (
        <Form
            {...store.form(obligationId)}
            resetOnSuccess
            className="grid gap-4"
        >
            {({ errors, processing }) => (
                <>
                    <input
                        type="hidden"
                        name="idempotency_key"
                        value={idempotencyKey}
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <TextField
                            label="Nominal"
                            name="amount"
                            type="number"
                            min={1}
                            max={outstandingAmount}
                            step={1}
                            placeholder="Nominal pembayaran"
                            required
                            error={errors.amount}
                        />
                        <TextField
                            label="Tanggal"
                            name="settled_on"
                            type="date"
                            defaultValue={defaultDate}
                            required
                            error={errors.settled_on}
                        />
                    </div>
                    <SelectField
                        label="Akun keuangan"
                        name="account_id"
                        defaultValue=""
                        required
                        error={errors.account_id}
                    >
                        <option value="" disabled>
                            Pilih akun
                        </option>
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
                        placeholder="Keterangan pembayaran"
                        error={errors.note}
                    />
                    <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary-soft/50 p-3.5">
                        <Landmark className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <p className="text-xs leading-5 font-light text-muted-foreground">
                            {kind === 'debt'
                                ? 'Pembayaran utang membuat transaksi pengeluaran dan mengurangi saldo akun.'
                                : 'Penerimaan piutang membuat transaksi pemasukan dan menambah saldo akun.'}
                        </p>
                    </div>
                    <div className="flex justify-end border-t border-border pt-4">
                        <Button
                            type="submit"
                            size="sm"
                            loading={processing}
                            disabled={accountOptions.length === 0}
                        >
                            <Plus className="h-4 w-4" />
                            Catat pembayaran
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}
