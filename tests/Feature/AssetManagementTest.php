<?php

use App\Enums\AssetStatus;
use App\Enums\AssetType;
use App\Models\Asset;
use App\Models\User;
use Illuminate\Support\Collection;
use Inertia\Testing\AssertableInertia as Assert;

test('asset routes require authentication', function () {
    $asset = Asset::factory()->create();

    $this->get(route('assets.index'))->assertRedirect(route('login'));
    $this->get(route('assets.create'))->assertRedirect(route('login'));
    $this->get(route('assets.show', $asset))->assertRedirect(route('login'));
    $this->post(route('assets.store'))->assertRedirect(route('login'));
    $this->patch(route('assets.update', $asset))->assertRedirect(route('login'));
    $this->patch(route('assets.archive', $asset))->assertRedirect(route('login'));
});

test('asset index is owner scoped and returns active summary', function () {
    $user = User::factory()->create();
    $vehicle = Asset::factory()->for($user)->create([
        'name' => 'Motor',
        'asset_type' => AssetType::Vehicle,
        'acquisition_cost' => 20_000_000,
        'current_value' => 15_000_000,
        'valued_on' => '2026-08-01',
    ]);
    Asset::factory()->archived()->for($user)->create([
        'current_value' => 50_000_000,
        'acquisition_cost' => 45_000_000,
    ]);
    $otherAsset = Asset::factory()->create();

    $this->actingAs($user)
        ->get(route('assets.index', [
            'asset_type' => AssetType::Vehicle->value,
            'status' => AssetStatus::Active->value,
        ]))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('assets/index')
            ->where('filters.asset_type', 'vehicle')
            ->where('filters.status', 'active')
            ->has('assets.data', 1)
            ->where('assets.data.0.id', $vehicle->id)
            ->where('assets.data.0.estimated_difference', -5_000_000)
            ->where('summary.totalCurrentValue', 15_000_000)
            ->where('summary.totalAcquisitionCost', 20_000_000)
            ->where('summary.activeCount', 1)
            ->where('summary.oldestValuedOn', '2026-08-01')
            ->where('assets.data', fn (Collection $items): bool => $items->doesntContain('id', $otherAsset->id)));
});

test('users can create and update an asset', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('assets.store'), [
            'name' => 'Laptop Kerja',
            'asset_type' => AssetType::Electronics->value,
            'acquired_on' => null,
            'acquisition_cost' => null,
            'current_value' => 12_000_000,
            'valued_on' => '2026-08-27',
            'note' => 'Kondisi sangat baik',
        ])
        ->assertRedirect();

    $asset = Asset::query()->sole();

    expect($asset)
        ->user_id->toBe($user->id)
        ->status->toBe(AssetStatus::Active)
        ->acquired_on->toBeNull()
        ->acquisition_cost->toBeNull();

    $this->actingAs($user)
        ->patch(route('assets.update', $asset), [
            'name' => 'Laptop Kerja Utama',
            'asset_type' => AssetType::Electronics->value,
            'acquired_on' => '2025-01-10',
            'acquisition_cost' => 15_000_000,
            'current_value' => 10_000_000,
            'valued_on' => '2026-08-28',
            'note' => null,
        ])
        ->assertRedirect(route('assets.show', $asset));

    expect($asset->refresh())
        ->name->toBe('Laptop Kerja Utama')
        ->current_value->toBe(10_000_000)
        ->note->toBeNull();
});

test('asset values cannot be negative', function (array $overrides, array $errors) {
    $payload = [
        'name' => 'Aset',
        'asset_type' => AssetType::Other->value,
        'acquired_on' => null,
        'acquisition_cost' => null,
        'current_value' => 1_000_000,
        'valued_on' => '2026-08-27',
        'note' => null,
        ...$overrides,
    ];

    $this->actingAs(User::factory()->create())
        ->post(route('assets.store'), $payload)
        ->assertInvalid($errors);
})->with([
    'negative acquisition cost' => [['acquisition_cost' => -1], ['acquisition_cost']],
    'negative current value' => [['current_value' => -1], ['current_value']],
]);

test('users cannot access another users asset', function () {
    $user = User::factory()->create();
    $asset = Asset::factory()->create();

    $this->actingAs($user)->get(route('assets.show', $asset))->assertForbidden();
    $this->actingAs($user)->get(route('assets.edit', $asset))->assertForbidden();
    $this->actingAs($user)->patch(route('assets.archive', $asset))->assertForbidden();
});

test('archiving an asset keeps the record instead of deleting it', function () {
    $user = User::factory()->create();
    $asset = Asset::factory()->for($user)->create();

    $this->actingAs($user)
        ->patch(route('assets.archive', $asset))
        ->assertRedirect(route('assets.index'));

    expect($asset->refresh())
        ->status->toBe(AssetStatus::Archived)
        ->archived_at->not->toBeNull()
        ->and(Asset::query()->whereKey($asset->id)->exists())->toBeTrue();
});
