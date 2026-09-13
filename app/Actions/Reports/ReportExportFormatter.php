<?php

namespace App\Actions\Reports;

use Illuminate\Support\Carbon;
use Illuminate\Support\Number;
use Illuminate\Support\Str;

class ReportExportFormatter
{
    /** @return list<array{key: string, label: string, format: string}> */
    public function columns(mixed $columns): array
    {
        if (! is_array($columns)) {
            return [];
        }

        $normalizedColumns = collect($columns)
            ->filter(fn (mixed $column): bool => is_array($column))
            ->map(fn (array $column): array => [
                'key' => (string) ($column['key'] ?? ''),
                'label' => (string) ($column['label'] ?? ''),
                'format' => (string) ($column['format'] ?? 'text'),
            ])
            ->values()
            ->all();

        return array_values($normalizedColumns);
    }

    /** @return list<array{label: string, value: string}> */
    public function summaryRows(mixed $summary): array
    {
        if (! is_array($summary)) {
            return [];
        }

        $rows = collect($summary)
            ->map(fn (mixed $value, string $key): array => [
                'label' => $this->summaryLabel($key),
                'value' => $this->displayValue($value, $this->isCountSummary($key) ? 'number' : 'currency'),
            ])
            ->values()
            ->all();

        return array_values($rows);
    }

    public function displayValue(mixed $value, string $format): string
    {
        if ($value === null || $value === '') {
            return '—';
        }

        return match ($format) {
            'currency' => $this->formatCurrency((float) $value),
            'date' => Carbon::parse((string) $value)->translatedFormat('d M Y'),
            'number' => $this->formatNumber((float) $value),
            'percentage' => $this->formatNumber((float) $value, 2).'%',
            'status' => $this->statusLabel((string) $value),
            default => (string) $value,
        };
    }

    public function summaryLabel(string $key): string
    {
        return [
            'transaction_count' => 'Jumlah Transaksi',
            'income' => 'Pemasukan',
            'expense' => 'Pengeluaran',
            'transfer' => 'Transfer',
            'net_cash_flow' => 'Arus Kas Bersih',
            'allocated' => 'Total Budget',
            'spent' => 'Terpakai',
            'remaining' => 'Sisa',
            'over_budget_count' => 'Melebihi Budget',
            'total_target' => 'Total Target',
            'total_saved' => 'Total Terkumpul',
            'completed_count' => 'Target Selesai',
            'acquisition_cost' => 'Modal Investasi',
            'current_value' => 'Nilai Saat Ini',
            'profit_loss' => 'Untung / Rugi',
            'stale_count' => 'Perlu Diperbarui',
            'net_worth' => 'Kekayaan Bersih',
            'total_assets' => 'Total Aset',
            'debts' => 'Total Kewajiban',
            'original_amount' => 'Nominal Awal',
            'outstanding_amount' => 'Total Outstanding',
            'debt_outstanding' => 'Sisa Utang',
            'receivable_outstanding' => 'Sisa Piutang',
            'settled_count' => 'Sudah Lunas',
        ][$key] ?? Str::headline($key);
    }

    private function statusLabel(string $status): string
    {
        return [
            'income' => 'Pemasukan',
            'expense' => 'Pengeluaran',
            'transfer' => 'Transfer',
            'posted' => 'Aktif',
            'voided' => 'Dibatalkan',
            'active' => 'Aktif',
            'archived' => 'Diarsipkan',
            'completed' => 'Selesai',
            'open' => 'Berjalan',
            'settled' => 'Lunas',
            'debt' => 'Utang',
            'receivable' => 'Piutang',
            'safe' => 'Aman',
            'warning' => 'Peringatan',
            'reached' => 'Tercapai',
            'over' => 'Melebihi',
            'positive' => 'Menambah',
            'negative' => 'Mengurangi',
        ][$status] ?? Str::headline($status);
    }

    private function formatCurrency(float $value): string
    {
        $formatted = Number::currency($value, in: 'IDR', locale: 'id', precision: 0);

        return is_string($formatted) ? $formatted : 'Rp0';
    }

    private function formatNumber(float $value, ?int $maxPrecision = null): string
    {
        $formatted = Number::format($value, maxPrecision: $maxPrecision, locale: 'id');

        return is_string($formatted) ? $formatted : '0';
    }

    private function isCountSummary(string $key): bool
    {
        return in_array($key, [
            'transaction_count',
            'over_budget_count',
            'completed_count',
            'stale_count',
            'settled_count',
        ], true);
    }
}
