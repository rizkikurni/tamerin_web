import Badge from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import EmptyState from '@/components/ui/empty-state';
import Pagination from '@/components/ui/pagination';
import { formatDate, formatRupiah } from '@/lib/formatters';
import type { FinancialReport, ReportColumn } from '@/types';

const statusLabels: Record<string, string> = {
    income: 'Pemasukan',
    expense: 'Pengeluaran',
    transfer: 'Transfer',
    posted: 'Aktif',
    voided: 'Dibatalkan',
    active: 'Aktif',
    archived: 'Diarsipkan',
    completed: 'Selesai',
    open: 'Berjalan',
    settled: 'Lunas',
    debt: 'Utang',
    receivable: 'Piutang',
    safe: 'Aman',
    warning: 'Peringatan',
    reached: 'Tercapai',
    over: 'Melebihi',
};

function nestedValue(row: Record<string, unknown>, key: string): unknown {
    return key.split('.').reduce<unknown>((value, part) => {
        if (typeof value !== 'object' || value === null) {
            return null;
        }

        return (value as Record<string, unknown>)[part];
    }, row);
}

function displayValue(value: unknown, column: ReportColumn) {
    if (value === null || value === undefined || value === '') {
        return <span className="text-muted-foreground">—</span>;
    }

    if (column.format === 'currency') {
        return formatRupiah(Number(value));
    }

    if (column.format === 'date') {
        return formatDate(String(value));
    }

    if (column.format === 'number') {
        return new Intl.NumberFormat('id-ID').format(Number(value));
    }

    if (column.format === 'percentage') {
        return `${Number(value).toLocaleString('id-ID')}%`;
    }

    if (column.format === 'status') {
        const status = String(value);
        const variant = ['voided', 'over'].includes(status)
            ? 'danger'
            : ['warning', 'reached'].includes(status)
              ? 'warning'
              : ['posted', 'active', 'completed', 'settled', 'safe'].includes(
                      status,
                  )
                ? 'success'
                : 'muted';

        return (
            <Badge variant={variant}>{statusLabels[status] ?? status}</Badge>
        );
    }

    return String(value);
}

export default function ReportTable({ report }: { report: FinancialReport }) {
    const { details } = report;

    return (
        <Card variant="navbar">
            <CardHeader>
                <div>
                    <h2 className="text-base font-medium text-foreground">
                        Detail laporan
                    </h2>
                    <p className="mt-0.5 text-xs font-light text-muted-foreground">
                        {details.total} baris sesuai filter yang diterapkan.
                    </p>
                </div>
            </CardHeader>
            <CardContent>
                {details.data.length === 0 ? (
                    <EmptyState
                        title="Tidak ada data laporan"
                        description="Belum ada data yang cocok dengan periode dan filter ini."
                    />
                ) : (
                    <div className="grid gap-4">
                        <div className="overflow-x-auto rounded-2xl border border-border">
                            <table className="w-full min-w-[720px] text-left text-sm">
                                <thead className="bg-surface-muted text-xs text-muted-foreground">
                                    <tr>
                                        {report.columns.map((column) => (
                                            <th
                                                key={column.key}
                                                className="px-4 py-3 font-medium"
                                            >
                                                {column.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {details.data.map((row, rowIndex) => (
                                        <tr
                                            key={String(row.id ?? rowIndex)}
                                            className="transition-colors hover:bg-surface-muted/60"
                                        >
                                            {report.columns.map((column) => (
                                                <td
                                                    key={column.key}
                                                    className="px-4 py-3 whitespace-nowrap text-foreground"
                                                >
                                                    {displayValue(
                                                        nestedValue(
                                                            row,
                                                            column.key,
                                                        ),
                                                        column,
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                            <p className="text-xs font-light text-muted-foreground">
                                Menampilkan {details.from}–{details.to} dari{' '}
                                {details.total} data
                            </p>
                            <Pagination links={details.links} />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
