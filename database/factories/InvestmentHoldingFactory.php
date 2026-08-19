<?php

namespace Database\Factories;

use App\Enums\InvestmentHoldingStatus;
use App\Enums\InvestmentInstrumentType;
use App\Models\InvestmentHolding;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InvestmentHolding>
 */
class InvestmentHoldingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->words(2, true),
            'instrument_type' => fake()->randomElement(InvestmentInstrumentType::cases()),
            'acquisition_cost' => fake()->numberBetween(0, 500_000_000),
            'acquired_on' => fake()->dateTimeBetween('-10 years')->format('Y-m-d'),
            'units' => fake()->optional()->randomFloat(8, 0.00000001, 1_000_000),
            'status' => InvestmentHoldingStatus::Active,
            'last_valuation_at' => null,
            'archived_at' => null,
        ];
    }

    public function archived(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => InvestmentHoldingStatus::Archived,
            'archived_at' => now(),
        ]);
    }
}
