<?php

namespace Database\Factories;

use App\Enums\InvestmentValuationStatus;
use App\Models\InvestmentHolding;
use App\Models\InvestmentValuation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InvestmentValuation>
 */
class InvestmentValuationFactory extends Factory
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
            'investment_holding_id' => fn (array $attributes): string => InvestmentHolding::factory()->create([
                'user_id' => $attributes['user_id'],
            ])->id,
            'valued_on' => fake()->dateTimeBetween('-1 year')->format('Y-m-d'),
            'value' => fake()->numberBetween(0, 750_000_000),
            'note' => fake()->optional()->sentence(),
            'status' => InvestmentValuationStatus::Active,
        ];
    }

    public function voided(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => InvestmentValuationStatus::Voided,
        ]);
    }
}
