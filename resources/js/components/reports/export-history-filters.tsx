import { router } from '@inertiajs/react';
import { RotateCcw, Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

import { SelectField } from '@/components/form-controls';
import Button from '@/components/ui/button';
import { index } from '@/routes/reports/exports';
import type { ExportAuditFilters, SelectOption } from '@/types';

type ExportHistoryFiltersProps = {
    filters: ExportAuditFilters;
    reportOptions: SelectOption[];
    formatOptions: SelectOption[];
};

export default function ExportHistoryFilters({
    filters,
    reportOptions,
    formatOptions,
}: ExportHistoryFiltersProps) {
    const [values, setValues] = useState({
        report_type: filters.report_type ?? '',
        format: filters.format ?? '',
    });

    const applyFilters = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        router.get(
            index.url(),
            Object.fromEntries(
                Object.entries(values).filter(([, value]) => value !== ''),
            ),
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <form
            onSubmit={applyFilters}
            className="flex flex-col gap-4 lg:flex-row lg:items-end"
        >
            <div className="grid flex-1 gap-4 sm:grid-cols-2">
                <SelectField
                    label="Jenis laporan"
                    name="report_type"
                    value={values.report_type}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            report_type: event.target.value,
                        }))
                    }
                >
                    <option value="">Semua laporan</option>
                    {reportOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </SelectField>
                <SelectField
                    label="Format"
                    name="format"
                    value={values.format}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            format: event.target.value,
                        }))
                    }
                >
                    <option value="">Semua format</option>
                    {formatOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </SelectField>
            </div>
            <div className="flex justify-end gap-2">
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                        router.get(index.url(), {}, { replace: true })
                    }
                >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                </Button>
                <Button type="submit" size="sm" variant="outline">
                    <Search className="h-4 w-4" />
                    Terapkan
                </Button>
            </div>
        </form>
    );
}
