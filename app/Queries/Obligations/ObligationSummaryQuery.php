<?php

namespace App\Queries\Obligations;

use App\Enums\ObligationKind;
use App\Enums\ObligationStatus;
use App\Models\Obligation;
use App\Models\User;

class ObligationSummaryQuery
{
    /** @return array{totalDebt: int, totalReceivable: int, dueSoonCount: int, overdueCount: int} */
    public function get(User $user): array
    {
        $summary = Obligation::query()
            ->whereBelongsTo($user)
            ->where('status', ObligationStatus::Open)
            ->toBase()
            ->selectRaw(
                'COALESCE(SUM(CASE WHEN kind = ? THEN outstanding_amount ELSE 0 END), 0) AS total_debt',
                [ObligationKind::Debt->value],
            )
            ->selectRaw(
                'COALESCE(SUM(CASE WHEN kind = ? THEN outstanding_amount ELSE 0 END), 0) AS total_receivable',
                [ObligationKind::Receivable->value],
            )
            ->selectRaw(
                'COUNT(CASE WHEN due_on BETWEEN ? AND ? THEN 1 END) AS due_soon_count',
                [today()->toDateString(), today()->addDays(7)->toDateString()],
            )
            ->selectRaw(
                'COUNT(CASE WHEN due_on < ? THEN 1 END) AS overdue_count',
                [today()->toDateString()],
            )
            ->first();

        return [
            'totalDebt' => (int) ($summary->total_debt ?? 0),
            'totalReceivable' => (int) ($summary->total_receivable ?? 0),
            'dueSoonCount' => (int) ($summary->due_soon_count ?? 0),
            'overdueCount' => (int) ($summary->overdue_count ?? 0),
        ];
    }
}
