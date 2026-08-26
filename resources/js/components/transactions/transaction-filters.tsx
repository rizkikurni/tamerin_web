import { router } from '@inertiajs/react';
import { RotateCcw, Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

import { SelectField, TextField } from '@/components/form-controls';
import Button from '@/components/ui/button';
import { index } from '@/routes/transactions';
import type { TransactionFilterOptions, TransactionFilters } from '@/types';

type TransactionFiltersProps = {
    filters: TransactionFilters;
    options: TransactionFilterOptions;
};

export default function TransactionFiltersForm({
    filters,
    options,
}: TransactionFiltersProps) {
    const [values, setValues] = useState({
        date_from: filters.date_from ?? '',
        date_to: filters.date_to ?? '',
        type: filters.type ?? '',
        account_id: filters.account_id ?? '',
        category_id: filters.category_id ?? '',
        status: filters.status ?? '',
    });

    const applyFilters = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const query = Object.fromEntries(
            Object.entries(values).filter(([, value]) => value !== ''),
        );

        router.get(index.url(), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        setValues({
            date_from: '',
            date_to: '',
            type: '',
            account_id: '',
            category_id: '',
            status: '',
        });
        router.get(index.url(), {}, { replace: true });
    };

    return (
        <form onSubmit={applyFilters} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <TextField
                    label="Dari tanggal"
                    name="date_from"
                    type="date"
                    value={values.date_from}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            date_from: event.target.value,
                        }))
                    }
                />
                <TextField
                    label="Sampai tanggal"
                    name="date_to"
                    type="date"
                    value={values.date_to}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            date_to: event.target.value,
                        }))
                    }
                />
                <SelectField
                    label="Tipe"
                    name="type"
                    value={values.type}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            type: event.target.value,
                        }))
                    }
                >
                    <option value="">Semua tipe</option>
                    {options.types.map((type) => (
                        <option key={type.value} value={type.value}>
                            {type.label}
                        </option>
                    ))}
                </SelectField>
                <SelectField
                    label="Akun"
                    name="account_id"
                    value={values.account_id}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            account_id: event.target.value,
                        }))
                    }
                >
                    <option value="">Semua akun</option>
                    {options.accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                            {account.name}
                        </option>
                    ))}
                </SelectField>
                <SelectField
                    label="Kategori"
                    name="category_id"
                    value={values.category_id}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            category_id: event.target.value,
                        }))
                    }
                >
                    <option value="">Semua kategori</option>
                    {options.categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </SelectField>
                <SelectField
                    label="Status"
                    name="status"
                    value={values.status}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            status: event.target.value,
                        }))
                    }
                >
                    <option value="">Semua status</option>
                    {options.statuses.map((status) => (
                        <option key={status.value} value={status.value}>
                            {status.label}
                        </option>
                    ))}
                </SelectField>
            </div>

            <div className="flex justify-end gap-2 border-t border-border pt-4">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                </Button>
                <Button type="submit" variant="outline" size="sm">
                    <Search className="h-4 w-4" />
                    Terapkan Filter
                </Button>
            </div>
        </form>
    );
}
