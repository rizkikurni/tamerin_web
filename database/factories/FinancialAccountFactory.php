<?php

namespace Database\Factories;

use App\Enums\FinancialAccountStatus;
use App\Enums\FinancialAccountType;
use App\Models\FinancialAccount;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FinancialAccount>
 */
class FinancialAccountFactory extends Factory
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
            'name' => fake()->unique()->words(2, true),
            'type' => fake()->randomElement(FinancialAccountType::cases()),
            'opening_balance' => fake()->numberBetween(0, 50_000_000),
            'opened_on' => fake()->dateTimeBetween('-5 years')->format('Y-m-d'),
            'status' => FinancialAccountStatus::Active,
            'archived_at' => null,
        ];
    }

    public function archived(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => FinancialAccountStatus::Archived,
            'archived_at' => now(),
        ]);
    }
}
