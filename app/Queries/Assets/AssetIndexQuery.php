<?php

namespace App\Queries\Assets;

use App\Models\Asset;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

class AssetIndexQuery
{
    /**
     * @param  array{asset_type: string|null, status: string|null}  $filters
     * @return LengthAwarePaginator<int, array<string, mixed>>
     */
    public function paginate(User $user, array $filters): LengthAwarePaginator
    {
        return Asset::query()
            ->whereBelongsTo($user)
            ->when(
                $filters['asset_type'],
                fn (Builder $query, string $type): Builder => $query->where('asset_type', $type),
            )
            ->when(
                $filters['status'],
                fn (Builder $query, string $status): Builder => $query->where('status', $status),
            )
            ->orderBy('valued_on')
            ->latest('created_at')
            ->paginate(12)
            ->withQueryString()
            ->through($this->item(...));
    }

    /** @return array<string, mixed> */
    public function item(Asset $asset): array
    {
        return [
            'id' => $asset->id,
            'name' => $asset->name,
            'asset_type' => $asset->asset_type->value,
            'acquired_on' => $asset->acquired_on?->toDateString(),
            'acquisition_cost' => $asset->acquisition_cost,
            'current_value' => $asset->current_value,
            'valued_on' => $asset->valued_on->toDateString(),
            'note' => $asset->note,
            'status' => $asset->status->value,
            'archived_at' => $asset->archived_at?->toISOString(),
            'estimated_difference' => $asset->acquisition_cost === null
                ? null
                : $asset->current_value - $asset->acquisition_cost,
        ];
    }
}
