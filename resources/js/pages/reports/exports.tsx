import { Head } from '@inertiajs/react';
import { FileClock, Filter, History } from 'lucide-react';

import ExportHistoryFilters from '@/components/reports/export-history-filters';
import { ButtonLink } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import EmptyState from '@/components/ui/empty-state';
import Pagination from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { index as reportsIndex } from '@/routes/reports';
import { index } from '@/routes/reports/exports';
import type {
    ExportAuditFilters,
    ExportAuditListItem,
    PaginatedData,
    SelectOption,
} from '@/types';

const reportLabels: Record<string, string> = {
    transactions: 'Transaksi',
    cash_flow: 'Arus Kas',
    budgets: 'Budget',
    savings: 'Tabungan',
    investments: 'Investasi',
    net_worth: 'Kekayaan Bersih',
    obligations: 'Utang & Piutang',
};

type ExportHistoryProps = {
    exports: PaginatedData<ExportAuditListItem>;
    filters: ExportAuditFilters;
    reportOptions: SelectOption[];
    formatOptions: SelectOption[];
};

export default function ExportHistory({
    exports,
    filters,
    reportOptions,
    formatOptions,
}: ExportHistoryProps) {
    return (
        <AppLayout
            title="Riwayat Export"
            description="Catatan read-only untuk file laporan yang berhasil dibuat."
            breadcrumbs={[
                { label: 'Keuangan' },
                { label: 'Laporan', href: reportsIndex.url() },
                { label: 'Riwayat Export' },
            ]}
            currentPath={index.url()}
            headerActions={
                <ButtonLink
                    href={reportsIndex.url()}
                    variant="outline"
                    size="sm"
                    className="rounded-full px-4"
                >
                    Kembali ke Laporan
                </ButtonLink>
            }
        >
            <Head title="Riwayat Export" />

            <div className="mx-auto grid max-w-7xl gap-5">
                <Card variant="navbar">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                                <Filter className="h-4 w-4" />
                            </div>
                            <div>
                                <h2 className="text-sm font-medium text-foreground">
                                    Filter riwayat
                                </h2>
                                <p className="mt-0.5 text-xs font-light text-muted-foreground">
                                    Saring berdasarkan jenis laporan dan format
                                    file.
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ExportHistoryFilters
                            filters={filters}
                            reportOptions={reportOptions}
                            formatOptions={formatOptions}
                        />
                    </CardContent>
                </Card>

                <Card variant="navbar">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                                <History className="h-4 w-4" />
                            </div>
                            <div>
                                <h2 className="text-base font-medium text-foreground">
                                    File yang berhasil dibuat
                                </h2>
                                <p className="mt-0.5 text-xs font-light text-muted-foreground">
                                    {exports.total} catatan milik akun Anda.
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {exports.data.length === 0 ? (
                            <EmptyState
                                icon={
                                    <FileClock className="h-7 w-7 text-primary" />
                                }
                                title="Belum ada riwayat export"
                                description="Riwayat akan dicatat hanya setelah file laporan berhasil dibuat."
                            />
                        ) : (
                            <div className="grid gap-4">
                                <div className="overflow-x-auto rounded-2xl border border-border">
                                    <table className="w-full min-w-[760px] text-left text-sm">
                                        <thead className="bg-surface-muted text-xs text-muted-foreground">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">
                                                    Nama file
                                                </th>
                                                <th className="px-4 py-3 font-medium">
                                                    Laporan
                                                </th>
                                                <th className="px-4 py-3 font-medium">
                                                    Format
                                                </th>
                                                <th className="px-4 py-3 font-medium">
                                                    Jumlah baris
                                                </th>
                                                <th className="px-4 py-3 font-medium">
                                                    Dibuat
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {exports.data.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    className="transition-colors hover:bg-surface-muted/60"
                                                >
                                                    <td className="max-w-xs truncate px-4 py-3 font-medium text-foreground">
                                                        {item.file_name}
                                                    </td>
                                                    <td className="px-4 py-3 text-foreground">
                                                        {reportLabels[
                                                            item.report_type
                                                        ] ?? item.report_type}
                                                    </td>
                                                    <td className="px-4 py-3 text-foreground uppercase">
                                                        {item.format}
                                                    </td>
                                                    <td className="px-4 py-3 text-foreground">
                                                        {new Intl.NumberFormat(
                                                            'id-ID',
                                                        ).format(
                                                            item.row_count,
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-muted-foreground">
                                                        {new Intl.DateTimeFormat(
                                                            'id-ID',
                                                            {
                                                                dateStyle:
                                                                    'medium',
                                                                timeStyle:
                                                                    'short',
                                                            },
                                                        ).format(
                                                            new Date(
                                                                item.generated_at,
                                                            ),
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                                    <p className="text-xs font-light text-muted-foreground">
                                        Menampilkan {exports.from}–{exports.to}{' '}
                                        dari {exports.total} catatan
                                    </p>
                                    <Pagination links={exports.links} />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
