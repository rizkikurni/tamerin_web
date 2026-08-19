<?php

namespace Database\Factories;

use App\Enums\SavingsGoalStatus;
use App\Models\SavingsGoal;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SavingsGoal>
 */
class SavingsGoalFactory extends Factory
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
            'name' => fake()->words(3, true),
            'target_amount' => fake()->numberBetween(1_000_000, 500_000_000),
            'target_date' => fake()->boolean(70)
                ? fake()->dateTimeBetween('+1 month', '+5 years')->format('Y-m-d')
                : null,
            'status' => SavingsGoalStatus::Active,
            'completed_at' => null,
            'archived_at' => null,
        ];
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => SavingsGoalStatus::Completed,
            'completed_at' => now(),
            'archived_at' => null,
        ]);
    }

    public function archived(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => SavingsGoalStatus::Archived,
            'archived_at' => now(),
        ]);
    }
}
