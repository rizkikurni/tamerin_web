<?php

namespace Database\Factories;

use App\Enums\SavingsContributionStatus;
use App\Models\SavingsContribution;
use App\Models\SavingsGoal;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SavingsContribution>
 */
class SavingsContributionFactory extends Factory
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
            'savings_goal_id' => fn (array $attributes): string => SavingsGoal::factory()->create([
                'user_id' => $attributes['user_id'],
            ])->id,
            'account_id' => null,
            'amount' => fake()->numberBetween(10_000, 10_000_000),
            'contributed_on' => fake()->dateTimeBetween('-1 year')->format('Y-m-d'),
            'note' => fake()->optional()->sentence(),
            'status' => SavingsContributionStatus::Active,
            'voided_at' => null,
            'void_reason' => null,
        ];
    }

    public function voided(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => SavingsContributionStatus::Voided,
            'voided_at' => now(),
            'void_reason' => fake()->sentence(),
        ]);
    }
}
