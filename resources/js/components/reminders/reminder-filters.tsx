import { RotateCcw, Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

import { SelectField } from '@/components/form-controls';
import type { ManualReminderFilters, SelectOption } from '@/types';

export default function ReminderFilters({
    filters,
    statusOptions,
    dueFilterOptions,
    onFilter,
    onReset,
}: {
    filters: ManualReminderFilters;
    statusOptions: SelectOption[];
    dueFilterOptions: SelectOption[];
    onFilter: (key: keyof ManualReminderFilters, value: string) => void;
    onReset?: () => void;
}) {
    const [searchVal, setSearchVal] = useState(filters.search ?? '');

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onFilter('search', searchVal);
    };

    const hasFilter = Object.values(filters).some(Boolean);

    return (
        <div className="flex flex-col gap-3 rounded-[22px] border border-border bg-surface p-4 shadow-[var(--control-shadow)]">
            <div className="grid gap-3 sm:grid-cols-3">
                {/* Search Input */}
                <form
                    onSubmit={handleSearch}
                    className="grid min-w-0 gap-2 text-xs font-medium text-foreground-secondary"
                >
                    <label
                        htmlFor="reminder-search"
                        className="text-xs font-medium text-foreground-secondary"
                    >
                        Cari judul pengingat
                    </label>
                    <div className="relative">
                        <input
                            id="reminder-search"
                            type="text"
                            value={searchVal}
                            onChange={(e) => setSearchVal(e.target.value)}
                            placeholder="Ketik kata kunci & Enter..."
                            className="h-11 w-full rounded-[14px] border border-[var(--control-border)] bg-[var(--control-background)] pr-10 pl-3.5 text-sm font-normal text-foreground shadow-[var(--control-shadow)] backdrop-blur-sm transition-[border-color,background-color,box-shadow] duration-200 outline-none placeholder:font-light placeholder:text-muted-foreground hover:border-primary/35 hover:bg-surface-muted/80 hover:shadow-[var(--control-shadow-hover)] focus:border-primary/60 focus:bg-surface-muted focus:ring-2 focus:ring-primary/15"
                        />
                        <button
                            type="submit"
                            aria-label="Cari pengingat"
                            className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
                        >
                            <Search className="h-4 w-4" />
                        </button>
                    </div>
                </form>

                <SelectField
                    label="Status pengingat"
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
                    label="Batas jatuh tempo"
                    name="due_filter"
                    value={filters.due_filter ?? ''}
                    onChange={(event) =>
                        onFilter('due_filter', event.target.value)
                    }
                >
                    <option value="">Semua kondisi tanggal</option>
                    {dueFilterOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </SelectField>
            </div>

            {hasFilter && onReset && (
                <div className="flex justify-end border-t border-border/60 pt-2.5">
                    <button
                        type="button"
                        onClick={onReset}
                        className="inline-flex items-center gap-1 text-xs font-light text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <RotateCcw className="h-3 w-3" />
                        Reset semua filter
                    </button>
                </div>
            )}
        </div>
    );
}
