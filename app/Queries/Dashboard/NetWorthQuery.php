<?php

namespace App\Queries\Dashboard;

use App\Enums\AssetStatus;
use App\Enums\InvestmentHoldingStatus;
use App\Enums\InvestmentValuationStatus;
use App\Enums\ObligationKind;
use App\Enums\ObligationStatus;
use App\Models\Asset;
use App\Models\InvestmentHolding;
use App\Models\InvestmentValuation;
use App\Models\Obligation;
use App\Models\User;

class NetWorthQuery
{
    /**
     * @return array{
     *     total: int,
     *     accountBalance: int,
     *     investments: int,
     *     assets: int,
     *     receivables: int,
     *     debts: int,
     *     updatedAt: string
     * }
     */
    public function calculate(User $user, int $accountBalance): array
    {
        $holdingIdColumn = (new InvestmentHolding)->qualifyColumn('id');
        $latestValuation = InvestmentValuation::query()
            ->whereBelongsTo($user)
            ->where('status', InvestmentValuationStatus::Active)
            ->whereColumn('investment_holding_id', $holdingIdColumn)
            ->latest('valued_on')
            ->limit(1);

        $holdings = InvestmentHolding::query()
            ->whereBelongsTo($user)
            ->where('status', InvestmentHoldingStatus::Active)
            ->select(['id', 'last_valuation_at'])
            ->addSelect([
                'latest_value' => (clone $latestValuation)->select('value'),
                'latest_valued_on' => (clone $latestValuation)->select('valued_on'),
            ])
            ->get();

        $investments = (int) $holdings->sum(
            fn (InvestmentHolding $holding): int => (int) $holding->getAttribute('latest_value'),
        );

        $assetTotals = Asset::query()
            ->whereBelongsTo($user)
            ->where('status', AssetStatus::Active)
            ->selectRaw('COALESCE(SUM(current_value), 0) AS total')
            ->selectRaw('MAX(valued_on) AS latest_valued_on')
            ->toBase()
            ->first();

        $obligationTotals = Obligation::query()
            ->whereBelongsTo($user)
            ->where('status', ObligationStatus::Open)
            ->selectRaw(
                'COALESCE(SUM(CASE WHEN kind = ? THEN outstanding_amount ELSE 0 END), 0) AS receivables',
                [ObligationKind::Receivable->value],
            )
            ->selectRaw(
                'COALESCE(SUM(CASE WHEN kind = ? THEN outstanding_amount ELSE 0 END), 0) AS debts',
                [ObligationKind::Debt->value],
            )
            ->toBase()
            ->first();

        $assets = (int) data_get($assetTotals, 'total', 0);
        $receivables = (int) data_get($obligationTotals, 'receivables', 0);
        $debts = (int) data_get($obligationTotals, 'debts', 0);
        $latestInvestmentDate = $holdings
            ->pluck('latest_valued_on')
            ->filter()
            ->max();
        $updatedAt = collect([
            $latestInvestmentDate,
            data_get($assetTotals, 'latest_valued_on'),
        ])->filter()->max() ?? today()->toDateString();

        return [
            'total' => $accountBalance + $investments + $assets + $receivables - $debts,
            'accountBalance' => $accountBalance,
            'investments' => $investments,
            'assets' => $assets,
            'receivables' => $receivables,
            'debts' => $debts,
            'updatedAt' => (string) $updatedAt,
        ];
    }
}
