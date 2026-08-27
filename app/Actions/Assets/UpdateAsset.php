<?php

namespace App\Actions\Assets;

use App\Models\Asset;

class UpdateAsset
{
    /** @param array{name: string, asset_type: string, acquired_on: string|null, acquisition_cost: int|null, current_value: int, valued_on: string, note: string|null} $data */
    public function handle(Asset $asset, array $data): Asset
    {
        $asset->update($data);

        return $asset->refresh();
    }
}
