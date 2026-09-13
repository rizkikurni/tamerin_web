<?php

namespace App\Queries\Reports;

use App\Enums\ObligationKind;
use App\Enums\ObligationStatus;
use App\Models\Obligation;
use App\Models\User;
use App\Queries\Obligations\ObligationIndexQuery;
use Illuminate\Database\Eloquent\Builder;

class ObligationReportQuery
{
    public function __construct(private ObligationIndexQuery $obligationIndexQuery) {}

    /** @param array{report_type: string, date_from: string, date_to: string, account_id: string|null, category_id: string|null, status: string|null} $filters
     * @return array<string, mixed>
     */
    public function get(User $user, array $filters, int $perPage = 15): array
    {
        $status = in_array($filters['status'], array_column(ObligationStatus::cases(), 'value'), true)
            ? $filters['status']
            : null;
        $summary = Obligation::query()
            ->whereBelongsTo($user)
            ->whereBetween('started_on', [$filters['date_from'], $filters['date_to']])
            ->when($status, fn ($query, string $value) => $query->where('status', $value))
            ->toBase()
            ->selectRaw('COALESCE(SUM(original_amount), 0) AS original_amount')
            ->selectRaw('COALESCE(SUM(outstanding_amount), 0) AS outstanding_amount')
            ->selectRaw('COUNT(CASE WHEN status = ? THEN 1 END) AS settled_count', [ObligationStatus::Settled->value])
            ->selectRaw('COALESCE(SUM(CASE WHEN kind = ? THEN outstanding_amount ELSE 0 END), 0) AS debt_outstanding', [ObligationKind::Debt->value])
            ->selectRaw('COALESCE(SUM(CASE WHEN kind = ? THEN outstanding_amount ELSE 0 END), 0) AS receivable_outstanding', [ObligationKind::Receivable->value])
            ->first();

        $details = Obligation::query()
            ->whereBelongsTo($user)
            ->whereBetween('started_on', [$filters['date_from'], $filters['date_to']])
            ->when(
                $status,
                fn (Builder $query, string $value): Builder => $query->where('status', $value),
            )
            ->orderByRaw('due_on ASC NULLS LAST')
            ->latest('created_at')
            ->paginate($perPage)
            ->withQueryString()
            ->through($this->obligationIndexQuery->item(...));

        return [
            'type' => 'obligations',
            'title' => 'Laporan Utang & Piutang',
            'summary' => [
                'original_amount' => (int) ($summary->original_amount ?? 0),
                'outstanding_amount' => (int) ($summary->outstanding_amount ?? 0),
                'debt_outstanding' => (int) ($summary->debt_outstanding ?? 0),
                'receivable_outstanding' => (int) ($summary->receivable_outstanding ?? 0),
                'settled_count' => (int) ($summary->settled_count ?? 0),
            ],
            'columns' => [
                ['key' => 'counterparty_name', 'label' => 'Pihak', 'format' => 'text'],
                ['key' => 'kind', 'label' => 'Jenis', 'format' => 'status'],
                ['key' => 'original_amount', 'label' => 'Nominal Awal', 'format' => 'currency'],
                ['key' => 'outstanding_amount', 'label' => 'Outstanding', 'format' => 'currency'],
                ['key' => 'due_on', 'label' => 'Jatuh Tempo', 'format' => 'date'],
                ['key' => 'status', 'label' => 'Status', 'format' => 'status'],
            ],
            'details' => $details,
            'chart' => [],
        ];
    }
}
