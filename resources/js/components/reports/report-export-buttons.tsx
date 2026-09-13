import { FileSpreadsheet, FileText } from 'lucide-react';

import Button from '@/components/ui/button';
import { store } from '@/routes/reports/exports';
import type { ReportFilters } from '@/types';

type ReportExportButtonsProps = {
    csrfToken: string;
    filters: ReportFilters;
};

const formats = [
    { value: 'pdf', label: 'PDF', icon: FileText },
    { value: 'xlsx', label: 'XLSX', icon: FileSpreadsheet },
] as const;

export default function ReportExportButtons({
    csrfToken,
    filters,
}: ReportExportButtonsProps) {
    return (
        <div className="flex items-center gap-2">
            {formats.map((format) => {
                const Icon = format.icon;

                return (
                    <form key={format.value} action={store.url()} method="post">
                        <input type="hidden" name="_token" value={csrfToken} />
                        <input
                            type="hidden"
                            name="format"
                            value={format.value}
                        />
                        {Object.entries(filters).map(([name, value]) =>
                            value === null ? null : (
                                <input
                                    key={name}
                                    type="hidden"
                                    name={name}
                                    value={value}
                                />
                            ),
                        )}
                        <Button
                            type="submit"
                            size="sm"
                            variant={
                                format.value === 'pdf' ? 'primary' : 'outline'
                            }
                            className="rounded-full px-4"
                        >
                            <Icon className="h-4 w-4" />
                            <span className="hidden sm:inline">
                                {format.label}
                            </span>
                        </Button>
                    </form>
                );
            })}
        </div>
    );
}
