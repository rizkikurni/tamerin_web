<?php

namespace App\Actions\Reports;

interface ReportFileGenerator
{
    /**
     * @param  array<string, mixed>  $report
     * @param  array<string, string|null>  $filters
     */
    public function generate(array $report, array $filters, string $fileName): GeneratedReportFile;
}
