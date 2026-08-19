<?php

namespace Database\Factories;

use App\Enums\ObligationKind;
use App\Enums\ObligationStatus;
use App\Models\Obligation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Obligation>
 */
class ObligationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $originalAmount = fake()->numberBetween(500_000, 500_000_000);

        return [
            'user_id' => User::factory(),
            'kind' => ObligationKind::Debt,
            'counterparty_name' => fake()->name(),
            'original_amount' => $originalAmount,
            'outstanding_amount' => $originalAmount,
            'started_on' => fake()->dateTimeBetween('-5 years')->format('Y-m-d'),
            'due_on' => fake()->boolean(70)
                ? fake()->dateTimeBetween('now', '+2 years')->format('Y-m-d')
                : null,
            'status' => ObligationStatus::Open,
            'settled_at' => null,
            'archived_at' => null,
            'note' => fake()->optional()->sentence(),
        ];
    }

    public function receivable(): static
    {
        return $this->state(fn (array $attributes): array => [
            'kind' => ObligationKind::Receivable,
        ]);
    }

    public function settled(): static
    {
        return $this->state(fn (array $attributes): array => [
            'outstanding_amount' => 0,
            'status' => ObligationStatus::Settled,
            'settled_at' => now(),
            'archived_at' => null,
        ]);
    }

    public function archived(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => ObligationStatus::Archived,
            'archived_at' => now(),
        ]);
    }
}
