import { router } from '@inertiajs/react';
import { RotateCcw, Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

import { SelectField, TextField } from '@/components/form-controls';
import Button from '@/components/ui/button';
import { index } from '@/routes/reports';
import type {
    ReportFilterOptions,
    ReportFilters,
    ReportType,
    SelectOption,
} from '@/types';

type ReportFiltersProps = {
    filters: ReportFilters;
    reportOptions: SelectOption[];
    filterOptions: ReportFilterOptions;
    statusOptions: SelectOption[];
};

export default function ReportFiltersForm({
    filters,
    reportOptions,
    filterOptions,
    statusOptions,
}: ReportFiltersProps) {
    const [values, setValues] = useState({
        report_type: filters.report_type,
        date_from: filters.date_from,
        date_to: filters.date_to,
        account_id: filters.account_id ?? '',
        category_id: filters.category_id ?? '',
        status: filters.status ?? '',
    });

    const applyFilters = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.get(
            index.url(),
            Object.fromEntries(
                Object.entries(values).filter(([, value]) => value !== ''),
            ),
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const resetFilters = () => {
        router.get(index.url(), {}, { replace: true });
    };

    return (
        <form onSubmit={applyFilters} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <SelectField
                    label="Jenis laporan"
                    name="report_type"
                    value={values.report_type}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            report_type: event.target.value as ReportType,
                            status: '',
                        }))
                    }
                >
                    {reportOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </SelectField>
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
                    {filterOptions.accounts.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
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
                    {filterOptions.categories.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
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
                    {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
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
