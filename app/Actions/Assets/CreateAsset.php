<?php

namespace App\Actions\Assets;

use App\Enums\AssetStatus;
use App\Models\Asset;
use App\Models\User;

class CreateAsset
{
    /** @param array{name: string, asset_type: string, acquired_on: string|null, acquisition_cost: int|null, current_value: int, valued_on: string, note: string|null} $data */
    public function handle(User $user, array $data): Asset
    {
        return $user->assets()->create([
            ...$data,
            'status' => AssetStatus::Active,
            'archived_at' => null,
        ]);
    }
}
