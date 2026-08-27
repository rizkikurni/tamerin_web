<?php

namespace App\Actions\Assets;

use App\Enums\AssetStatus;
use App\Models\Asset;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ArchiveAsset
{
    public function handle(Asset $asset): Asset
    {
        return DB::transaction(function () use ($asset): Asset {
            $lockedAsset = Asset::query()
                ->whereKey($asset->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedAsset->status === AssetStatus::Archived) {
                throw ValidationException::withMessages([
                    'asset' => 'Aset ini sudah diarsipkan.',
                ]);
            }

            $lockedAsset->update([
                'status' => AssetStatus::Archived,
                'archived_at' => now(),
            ]);

            return $lockedAsset->refresh();
        });
    }
}
