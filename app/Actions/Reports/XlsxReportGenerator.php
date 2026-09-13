<?php

namespace App\Actions\Reports;

use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;
use LogicException;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Throwable;

class XlsxReportGenerator implements ReportFileGenerator
{
    public function __construct(private ReportExportFormatter $formatter) {}

    /**
     * @param  array<string, mixed>  $report
     * @param  array<string, string|null>  $filters
     */
    public function generate(array $report, array $filters, string $fileName): GeneratedReportFile
    {
        $details = $report['details'] ?? null;

        if (! $details instanceof LengthAwarePaginator) {
            throw new LogicException('XLSX report details must be paginated.');
        }

        $columns = $this->formatter->columns($report['columns'] ?? []);
        $lastColumn = Coordinate::stringFromColumnIndex(max(count($columns), 1));
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle(Str::limit((string) ($report['title'] ?? 'Laporan'), 31, ''));
        $sheet->mergeCells("A1:{$lastColumn}1");
        $sheet->setCellValue('A1', (string) ($report['title'] ?? 'Laporan Keuangan'));
        $sheet->mergeCells("A2:{$lastColumn}2");
        $sheet->setCellValue('A2', 'Periode '.$filters['date_from'].' sampai '.$filters['date_to']);
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16);

        $summaryRow = 4;

        foreach (is_array($report['summary'] ?? null) ? $report['summary'] : [] as $key => $value) {
            $sheet->setCellValue("A{$summaryRow}", $this->formatter->summaryLabel((string) $key));
            $sheet->setCellValueExplicit("B{$summaryRow}", (float) $value, DataType::TYPE_NUMERIC);
            $sheet->getStyle("B{$summaryRow}")
                ->getNumberFormat()
                ->setFormatCode(NumberFormat::FORMAT_NUMBER_COMMA_SEPARATED1);
            $summaryRow++;
        }

        $headerRow = $summaryRow + 1;

        foreach ($columns as $columnIndex => $column) {
            $coordinate = Coordinate::stringFromColumnIndex($columnIndex + 1);
            $sheet->setCellValue("{$coordinate}{$headerRow}", $column['label']);
        }

        $sheet->getStyle("A{$headerRow}:{$lastColumn}{$headerRow}")
            ->getFont()
            ->setBold(true)
            ->getColor()
            ->setARGB('FFFFFFFF');
        $sheet->getStyle("A{$headerRow}:{$lastColumn}{$headerRow}")
            ->getFill()
            ->setFillType(Fill::FILL_SOLID)
            ->getStartColor()
            ->setARGB('FF3B82F6');

        foreach ($details->items() as $rowIndex => $row) {
            $sheetRow = $headerRow + $rowIndex + 1;

            foreach ($columns as $columnIndex => $column) {
                $coordinate = Coordinate::stringFromColumnIndex($columnIndex + 1).$sheetRow;
                $value = is_array($row) ? data_get($row, $column['key']) : null;

                if (in_array($column['format'], ['currency', 'number', 'percentage'], true) && is_numeric($value)) {
                    $sheet->setCellValueExplicit($coordinate, (float) $value, DataType::TYPE_NUMERIC);
                    $sheet->getStyle($coordinate)
                        ->getNumberFormat()
                        ->setFormatCode($column['format'] === 'percentage' ? '0.00"%"' : '#,##0');
                } else {
                    $displayValue = in_array($column['format'], ['date', 'status'], true)
                        ? $this->formatter->displayValue($value, $column['format'])
                        : ($value === null ? '' : (string) $value);
                    $sheet->setCellValueExplicit(
                        $coordinate,
                        $displayValue,
                        DataType::TYPE_STRING,
                    );
                }
            }
        }

        foreach (range(1, max(count($columns), 1)) as $columnIndex) {
            $sheet->getColumnDimension(Coordinate::stringFromColumnIndex($columnIndex))->setAutoSize(true);
        }

        $sheet->freezePane('A'.($headerRow + 1));
        $sheet->setAutoFilter("A{$headerRow}:{$lastColumn}{$headerRow}");
        $sheet->getPageSetup()
            ->setOrientation(PageSetup::ORIENTATION_LANDSCAPE)
            ->setFitToWidth(1)
            ->setFitToHeight(0);

        $contents = $this->write($spreadsheet);

        return new GeneratedReportFile(
            contents: $contents,
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            fileName: $fileName,
            rowCount: $details->total(),
        );
    }

    private function write(Spreadsheet $spreadsheet): string
    {
        $bufferLevel = ob_get_level();
        ob_start();

        try {
            (new Xlsx($spreadsheet))->save('php://output');
            $contents = ob_get_clean();

            if (! is_string($contents)) {
                throw new LogicException('XLSX output buffer could not be read.');
            }

            return $contents;
        } catch (Throwable $exception) {
            while (ob_get_level() > $bufferLevel) {
                ob_end_clean();
            }

            throw $exception;
        } finally {
            $spreadsheet->disconnectWorksheets();
        }
    }
}
