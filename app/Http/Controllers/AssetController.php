<?php

namespace App\Http\Controllers;

use App\Actions\Assets\CreateAsset;
use App\Actions\Assets\UpdateAsset;
use App\Enums\AssetStatus;
use App\Enums\AssetType;
use App\Http\Requests\IndexAssetRequest;
use App\Http\Requests\StoreAssetRequest;
use App\Http\Requests\UpdateAssetRequest;
use App\Models\Asset;
use App\Models\User;
use App\Queries\Assets\AssetIndexQuery;
use App\Queries\Assets\AssetSummaryQuery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class AssetController extends Controller
{
    public function index(
        IndexAssetRequest $request,
        AssetIndexQuery $query,
        AssetSummaryQuery $summaryQuery,
    ): Response {
        Gate::authorize('viewAny', Asset::class);

        /** @var User $user */
        $user = $request->user();
        $filters = $request->filters();

        return Inertia::render('assets/index', [
            'assets' => $query->paginate($user, $filters),
            'summary' => $summaryQuery->get($user),
            'filters' => $filters,
            'assetTypeOptions' => $this->assetTypeOptions(),
            'statusOptions' => $this->statusOptions(),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Asset::class);

        return Inertia::render('assets/create', [
            'assetTypeOptions' => $this->assetTypeOptions(),
            'defaultValuedOn' => today()->toDateString(),
        ]);
    }

    public function store(
        StoreAssetRequest $request,
        CreateAsset $action,
    ): RedirectResponse {
        /** @var User $user */
        $user = $request->user();
        $asset = $action->handle($user, $request->assetData());

        return to_route('assets.show', $asset)
            ->with('status', 'asset-created');
    }

    public function show(Asset $asset, AssetIndexQuery $query): Response
    {
        Gate::authorize('view', $asset);

        return Inertia::render('assets/show', [
            'asset' => $query->item($asset),
            'permissions' => [
                'canEdit' => Gate::allows('update', $asset),
                'canArchive' => Gate::allows('archive', $asset),
            ],
        ]);
    }

    public function edit(Asset $asset, AssetIndexQuery $query): Response
    {
        Gate::authorize('update', $asset);

        return Inertia::render('assets/edit', [
            'asset' => $query->item($asset),
            'assetTypeOptions' => $this->assetTypeOptions(),
        ]);
    }

    public function update(
        UpdateAssetRequest $request,
        Asset $asset,
        UpdateAsset $action,
    ): RedirectResponse {
        $action->handle($asset, $request->assetData());

        return to_route('assets.show', $asset)
            ->with('status', 'asset-updated');
    }

    /** @return list<array{value: string, label: string}> */
    private function assetTypeOptions(): array
    {
        return [
            ['value' => AssetType::Vehicle->value, 'label' => 'Kendaraan'],
            ['value' => AssetType::Electronics->value, 'label' => 'Elektronik'],
            ['value' => AssetType::Property->value, 'label' => 'Properti'],
            ['value' => AssetType::Jewelry->value, 'label' => 'Perhiasan'],
            ['value' => AssetType::Other->value, 'label' => 'Lainnya'],
        ];
    }

    /** @return list<array{value: string, label: string}> */
    private function statusOptions(): array
    {
        return [
            ['value' => AssetStatus::Active->value, 'label' => 'Aktif'],
            ['value' => AssetStatus::Archived->value, 'label' => 'Diarsipkan'],
        ];
    }
}
