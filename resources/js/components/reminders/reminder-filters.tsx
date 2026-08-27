import type { FormEvent } from 'react';

import { SelectField, TextField } from '@/components/form-controls';
import type { ManualReminderFilters, SelectOption } from '@/types';

export default function ReminderFilters({
    filters,
    statusOptions,
    dueFilterOptions,
    onFilter,
}: {
    filters: ManualReminderFilters;
    statusOptions: SelectOption[];
    dueFilterOptions: SelectOption[];
    onFilter: (key: keyof ManualReminderFilters, value: string) => void;
}) {
    const search = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        onFilter('search', formData.get('search')?.toString() ?? '');
    };

    return (
        <div className="grid gap-3 rounded-[22px] border border-border bg-surface p-4 shadow-[var(--control-shadow)] md:grid-cols-3">
            <SelectField
                label="Status"
                name="status"
                value={filters.status ?? ''}
                onChange={(event) => onFilter('status', event.target.value)}
            >
                <option value="">Semua status</option>
                {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </SelectField>
            <SelectField
                label="Jatuh tempo"
                name="due_filter"
                value={filters.due_filter ?? ''}
                onChange={(event) => onFilter('due_filter', event.target.value)}
            >
                <option value="">Semua tanggal</option>
                {dueFilterOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </SelectField>
            <form onSubmit={search}>
                <TextField
                    label="Cari judul"
                    name="search"
                    defaultValue={filters.search ?? ''}
                    placeholder="Tekan Enter untuk mencari"
                />
            </form>
        </div>
    );
}
