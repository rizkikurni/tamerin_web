import { Form } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { useMemo, useState } from 'react';

import {
    SelectField,
    TextAreaField,
    TextField,
} from '@/components/form-controls';
import Button, { ButtonLink } from '@/components/ui/button';
import type {
    SelectOption,
    TransactionAccountOption,
    TransactionCategoryOption,
    TransactionType,
} from '@/types';

type TransactionFormProps = {
    form: { action: string; method: 'post' };
    transactionTypes: SelectOption[];
    accounts: TransactionAccountOption[];
    categories: TransactionCategoryOption[];
    idempotencyKey: string;
    defaultDate: string;
    cancelUrl: string;
};

export default function TransactionForm({
    form,
    transactionTypes,
    accounts,
    categories,
    idempotencyKey,
    defaultDate,
    cancelUrl,
}: TransactionFormProps) {
    const [type, setType] = useState<TransactionType>('expense');
    const matchingCategories = useMemo(
        () => categories.filter((category) => category.type === type),
        [categories, type],
    );
    const isTransfer = type === 'transfer';
    const hasRequiredOptions =
        accounts.length > (isTransfer ? 1 : 0) &&
        (isTransfer || matchingCategories.length > 0);

    return (
        <Form {...form} className="grid gap-5">
            {({ errors, processing }) => (
                <>
                    <input
                        type="hidden"
                        name="idempotency_key"
                        value={idempotencyKey}
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                        <SelectField
                            label="Tipe transaksi"
                            name="type"
                            defaultValue={type}
                            onChange={(event) =>
                                setType(event.target.value as TransactionType)
                            }
                            required
                            error={errors.type}
                        >
                            {transactionTypes.map((transactionType) => (
                                <option
                                    key={transactionType.value}
                                    value={transactionType.value}
                                >
                                    {transactionType.label}
                                </option>
                            ))}
                        </SelectField>

                        <TextField
                            label="Nominal"
                            name="amount"
                            type="number"
                            inputMode="numeric"
                            min="1"
                            step="1"
                            placeholder="0"
                            required
                            error={errors.amount}
                        />

                        <TextField
                            label="Tanggal transaksi"
                            name="transacted_on"
                            type="date"
                            defaultValue={defaultDate}
                            required
                            error={errors.transacted_on}
                        />

                        <SelectField
                            label={isTransfer ? 'Akun asal' : 'Akun'}
                            name="account_id"
                            defaultValue=""
                            required
                            error={errors.account_id}
                        >
                            <option value="" disabled>
                                Pilih akun
                            </option>
                            {accounts.map((account) => (
                                <option key={account.id} value={account.id}>
                                    {account.name}
                                </option>
                            ))}
                        </SelectField>

                        {isTransfer ? (
                            <SelectField
                                label="Akun tujuan"
                                name="destination_account_id"
                                defaultValue=""
                                required
                                error={errors.destination_account_id}
                            >
                                <option value="" disabled>
                                    Pilih akun tujuan
                                </option>
                                {accounts.map((account) => (
                                    <option key={account.id} value={account.id}>
                                        {account.name}
                                    </option>
                                ))}
                            </SelectField>
                        ) : (
                            <SelectField
                                key={type}
                                label="Kategori"
                                name="category_id"
                                defaultValue=""
                                required
                                error={errors.category_id}
                            >
                                <option value="" disabled>
                                    Pilih kategori
                                </option>
                                {matchingCategories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </SelectField>
                        )}
                    </div>

                    <TextAreaField
                        label="Catatan (opsional)"
                        name="note"
                        maxLength={500}
                        placeholder="Tambahkan keterangan singkat transaksi"
                        error={errors.note}
                    />

                    {!hasRequiredOptions && (
                        <p className="rounded-2xl border border-warning/20 bg-warning/10 px-4 py-3 text-xs leading-5 font-light text-warning">
                            Data aktif belum mencukupi untuk tipe transaksi ini.
                            Tambahkan akun atau kategori yang sesuai terlebih
                            dahulu.
                        </p>
                    )}

                    <div className="flex justify-end gap-2 border-t border-border pt-5">
                        <ButtonLink href={cancelUrl} variant="ghost" size="sm">
                            Batal
                        </ButtonLink>
                        <Button
                            type="submit"
                            size="sm"
                            loading={processing}
                            disabled={!hasRequiredOptions}
                        >
                            <Save className="h-4 w-4" />
                            Catat Transaksi
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}
