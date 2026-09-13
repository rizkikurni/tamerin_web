import { Head } from '@inertiajs/react';
import { FileClock, Filter } from 'lucide-react';

import CashFlowChart from '@/components/dashboard/cash-flow-chart';
import ReportExportButtons from '@/components/reports/report-export-buttons';
import ReportFiltersForm from '@/components/reports/report-filters';
import ReportSummary from '@/components/reports/report-summary';
import ReportTable from '@/components/reports/report-table';
import { ButtonLink } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { index } from '@/routes/reports';
import { index as exportsIndex } from '@/routes/reports/exports';
import type {
    FinancialReport,
    ReportFilterOptions,
    ReportFilters,
    SelectOption,
} from '@/types';

type ReportsIndexProps = {
    report: FinancialReport;
    filters: ReportFilters;
    reportOptions: SelectOption[];
    filterOptions: ReportFilterOptions;
    statusOptions: SelectOption[];
    csrfToken: string;
};

export default function ReportsIndex({
    report,
    filters,
    reportOptions,
    filterOptions,
    statusOptions,
    csrfToken,
}: ReportsIndexProps) {
    return (
        <AppLayout
            title="Laporan"
            description="Tinjau ringkasan dan detail kondisi keuangan berdasarkan periode."
            breadcrumbs={[{ label: 'Keuangan' }, { label: 'Laporan' }]}
            currentPath={index.url()}
            headerActions={
                <div className="flex items-center gap-2">
                    <ButtonLink
                        href={exportsIndex.url()}
                        variant="outline"
                        size="sm"
                        className="rounded-full px-4"
                    >
                        <FileClock className="h-4 w-4" />
                        <span className="hidden sm:inline">Riwayat Export</span>
                    </ButtonLink>
                    <ReportExportButtons
                        csrfToken={csrfToken}
                        filters={filters}
                    />
                </div>
            }
        >
            <Head title="Laporan" />

            <div className="mx-auto grid max-w-7xl gap-5">
                <Card variant="navbar">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                                <Filter className="h-4 w-4" />
                            </div>
                            <div>
                                <h2 className="text-sm font-medium text-foreground">
                                    Filter laporan
                                </h2>
                                <p className="mt-0.5 text-xs font-light text-muted-foreground">
                                    Pilih jenis, periode, akun, kategori, dan
                                    status.
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ReportFiltersForm
                            filters={filters}
                            reportOptions={reportOptions}
                            filterOptions={filterOptions}
                            statusOptions={statusOptions}
                        />
                    </CardContent>
                </Card>

                <div>
                    <h2 className="text-xl font-medium text-foreground">
                        {report.title}
                    </h2>
                    <p className="mt-1 text-sm font-light text-muted-foreground">
                        Periode {filters.date_from} sampai {filters.date_to}
                    </p>
                </div>

                <ReportSummary summary={report.summary} />

                {report.type === 'cash_flow' && (
                    <CashFlowChart data={report.chart} />
                )}

                <ReportTable report={report} />
            </div>
        </AppLayout>
    );
}
