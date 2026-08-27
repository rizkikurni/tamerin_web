<?php

namespace App\Queries\Assets;

use App\Enums\AssetStatus;
use App\Models\Asset;
use App\Models\User;

class AssetSummaryQuery
{
    /** @return array{totalCurrentValue: int, totalAcquisitionCost: int, activeCount: int, oldestValuedOn: string|null} */
    public function get(User $user): array
    {
        $summary = Asset::query()
            ->whereBelongsTo($user)
            ->where('status', AssetStatus::Active)
            ->toBase()
            ->selectRaw('COALESCE(SUM(current_value), 0) AS total_current_value')
            ->selectRaw('COALESCE(SUM(acquisition_cost), 0) AS total_acquisition_cost')
            ->selectRaw('COUNT(*) AS active_count')
            ->selectRaw('MIN(valued_on) AS oldest_valued_on')
            ->first();

        return [
            'totalCurrentValue' => (int) ($summary->total_current_value ?? 0),
            'totalAcquisitionCost' => (int) ($summary->total_acquisition_cost ?? 0),
            'activeCount' => (int) ($summary->active_count ?? 0),
            'oldestValuedOn' => $summary?->oldest_valued_on === null
                ? null
                : (string) $summary->oldest_valued_on,
        ];
    }
}
