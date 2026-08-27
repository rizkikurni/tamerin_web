import { Head, router, usePage } from '@inertiajs/react';
import { AlertTriangle, CalendarClock, HandCoins, Plus } from 'lucide-react';
import type { FormEvent } from 'react';

import SummaryCard from '@/components/dashboard/summary-card';
import {
    SelectField,
    StatusMessage,
    TextField,
} from '@/components/form-controls';
import ObligationCard from '@/components/obligations/obligation-card';
import { ButtonLink } from '@/components/ui/button';
import EmptyState from '@/components/ui/empty-state';
import Pagination from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { formatRupiah } from '@/lib/formatters';
import { create, index } from '@/routes/obligations';
import type {
    ObligationFilters,
    ObligationListItem,
    ObligationSummary,
    PaginatedData,
    SelectOption,
} from '@/types';

type Props = {
    obligations: PaginatedData<ObligationListItem>;
    summary: ObligationSummary;
    filters: ObligationFilters;
    kindOptions: SelectOption[];
    statusOptions: SelectOption[];
    dueFilterOptions: SelectOption[];
};

export default function ObligationIndex({
    obligations,
    summary,
    filters,
    kindOptions,
    statusOptions,
    dueFilterOptions,
}: Props) {
    const { flash } = usePage().props;
    const hasFilter = Object.values(filters).some(Boolean);

    const applyFilter = (key: keyof ObligationFilters, value: string) => {
        router.get(
            index.url(),
            { ...filters, [key]: value || undefined },
            { preserveState: true, preserveScroll: true },
        );
    };

    const search = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        applyFilter('search', data.get('search')?.toString() ?? '');
    };

    return (
        <AppLayout
            title="Utang & Piutang"
            description="Pantau kewajiban, tagihan, jatuh tempo, dan pembayaran."
            breadcrumbs={[{ label: 'Kekayaan' }, { label: 'Utang & Piutang' }]}
            currentPath={index.url()}
            headerActions={
                <ButtonLink
                    href={create.url()}
                    size="sm"
                    className="rounded-full px-4"
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Tambah Catatan</span>
                </ButtonLink>
            }
        >
            <Head title="Utang & Piutang" />

            <div className="mx-auto grid max-w-6xl gap-5">
                <StatusMessage message={flash.status} />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Total Utang Berjalan"
                        value={formatRupiah(summary.totalDebt)}
                        comparison="Sisa yang perlu dibayar"
                        icon={<HandCoins className="h-5 w-5 text-danger" />}
                        iconBg="bg-danger/10"
                    />
                    <SummaryCard
                        title="Total Piutang Berjalan"
                        value={formatRupiah(summary.totalReceivable)}
                        comparison="Sisa yang perlu ditagih"
                        icon={<HandCoins className="h-5 w-5 text-success" />}
                        iconBg="bg-success/10"
                    />
                    <SummaryCard
                        title="Jatuh Tempo 7 Hari"
                        value={summary.dueSoonCount.toString()}
                        comparison="Perlu segera ditindaklanjuti"
                        icon={
                            <CalendarClock className="h-5 w-5 text-warning" />
                        }
                        iconBg="bg-warning/10"
                    />
                    <SummaryCard
                        title="Terlambat"
                        value={summary.overdueCount.toString()}
                        comparison="Sudah melewati jatuh tempo"
                        icon={<AlertTriangle className="h-5 w-5 text-danger" />}
                        iconBg="bg-danger/10"
                    />
                </div>

                <div className="grid gap-3 rounded-[22px] border border-border bg-surface p-4 shadow-[var(--control-shadow)] lg:grid-cols-4">
                    <SelectField
                        label="Jenis"
                        name="kind"
                        value={filters.kind ?? ''}
                        onChange={(event) =>
                            applyFilter('kind', event.target.value)
                        }
                    >
                        <option value="">Semua jenis</option>
                        {kindOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </SelectField>
                    <SelectField
                        label="Status"
                        name="status"
                        value={filters.status ?? ''}
                        onChange={(event) =>
                            applyFilter('status', event.target.value)
                        }
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
                        onChange={(event) =>
                            applyFilter('due_filter', event.target.value)
                        }
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
                            label="Cari pihak"
                            name="search"
                            defaultValue={filters.search ?? ''}
                            placeholder="Tekan Enter untuk mencari"
                        />
                    </form>
                </div>

                {obligations.data.length === 0 ? (
                    <EmptyState
                        icon={<HandCoins className="h-7 w-7 text-primary" />}
                        title={
                            hasFilter
                                ? 'Tidak ada catatan yang cocok'
                                : 'Belum ada utang atau piutang'
                        }
                        description={
                            hasFilter
                                ? 'Ubah atau reset filter untuk melihat catatan lain.'
                                : 'Tambahkan catatan pertama untuk mulai memantau kewajiban.'
                        }
                        action={
                            hasFilter ? (
                                <ButtonLink href={index.url()} variant="ghost">
                                    Reset filter
                                </ButtonLink>
                            ) : (
                                <ButtonLink href={create.url()}>
                                    <Plus className="h-4 w-4" />
                                    Tambah catatan
                                </ButtonLink>
                            )
                        }
                    />
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-2">
                            {obligations.data.map((obligation) => (
                                <ObligationCard
                                    key={obligation.id}
                                    obligation={obligation}
                                />
                            ))}
                        </div>
                        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                            <p className="text-xs font-light text-muted-foreground">
                                Menampilkan {obligations.from}–{obligations.to}{' '}
                                dari {obligations.total} catatan
                            </p>
                            <Pagination links={obligations.links} />
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
