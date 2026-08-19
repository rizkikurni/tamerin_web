<?php

namespace Database\Factories;

use App\Enums\AssetStatus;
use App\Enums\AssetType;
use App\Models\Asset;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Asset>
 */
class AssetFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $acquisitionCost = fake()->numberBetween(0, 1_000_000_000);

        return [
            'user_id' => User::factory(),
            'name' => fake()->words(2, true),
            'asset_type' => fake()->randomElement(AssetType::cases()),
            'acquired_on' => fake()->boolean(70)
                ? fake()->dateTimeBetween('-15 years')->format('Y-m-d')
                : null,
            'acquisition_cost' => fake()->optional()->passthrough($acquisitionCost),
            'current_value' => fake()->numberBetween(0, max($acquisitionCost, 1)),
            'valued_on' => fake()->dateTimeBetween('-1 year')->format('Y-m-d'),
            'note' => fake()->optional()->sentence(),
            'status' => AssetStatus::Active,
            'archived_at' => null,
        ];
    }

    public function archived(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => AssetStatus::Archived,
            'archived_at' => now(),
        ]);
    }
}
