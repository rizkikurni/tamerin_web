<?php

namespace Database\Factories;

use App\Models\FinancialAccount;
use App\Models\Obligation;
use App\Models\ObligationSettlement;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ObligationSettlement>
 */
class ObligationSettlementFactory extends Factory
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
            'obligation_id' => fn (array $attributes): string => Obligation::factory()->create([
                'user_id' => $attributes['user_id'],
            ])->id,
            'account_id' => fn (array $attributes): string => FinancialAccount::factory()->create([
                'user_id' => $attributes['user_id'],
            ])->id,
            'amount' => fake()->numberBetween(10_000, 100_000),
            'settled_on' => fake()->dateTimeBetween('-1 year')->format('Y-m-d'),
            'transaction_id' => fn (array $attributes): string => Transaction::factory()->expense()->create([
                'user_id' => $attributes['user_id'],
                'created_by' => $attributes['user_id'],
                'account_id' => $attributes['account_id'],
                'amount' => $attributes['amount'],
                'transacted_on' => $attributes['settled_on'],
            ])->id,
            'note' => fake()->optional()->sentence(),
            'idempotency_key' => null,
        ];
    }

    public function receivable(): static
    {
        return $this->state(fn (array $attributes): array => [
            'obligation_id' => fn (array $evaluatedAttributes): string => Obligation::factory()->receivable()->create([
                'user_id' => $evaluatedAttributes['user_id'],
            ])->id,
            'transaction_id' => fn (array $evaluatedAttributes): string => Transaction::factory()->income()->create([
                'user_id' => $evaluatedAttributes['user_id'],
                'created_by' => $evaluatedAttributes['user_id'],
                'account_id' => $evaluatedAttributes['account_id'],
                'amount' => $evaluatedAttributes['amount'],
                'transacted_on' => $evaluatedAttributes['settled_on'],
            ])->id,
        ]);
    }

    public function withIdempotencyKey(): static
    {
        return $this->state(fn (array $attributes): array => [
            'idempotency_key' => (string) Str::uuid(),
        ]);
    }
}
