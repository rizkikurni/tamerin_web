<?php

namespace App\Http\Requests;

use App\Models\Asset;

class UpdateAssetRequest extends StoreAssetRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $asset = $this->route('asset');

        return $asset instanceof Asset
            && ($this->user()?->can('update', $asset) ?? false);
    }
}
