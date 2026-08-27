<?php

namespace App\Http\Controllers;

use App\Actions\Assets\ArchiveAsset;
use App\Models\Asset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

class ArchiveAssetController extends Controller
{
    public function __invoke(Asset $asset, ArchiveAsset $action): RedirectResponse
    {
        Gate::authorize('archive', $asset);
        $action->handle($asset);

        return to_route('assets.index')
            ->with('status', 'asset-archived');
    }
}
