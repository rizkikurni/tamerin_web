<?php

namespace Database\Factories;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\Category;
use App\Models\FinancialAccount;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Transaction>
 */
class TransactionFactory extends Factory
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
            'type' => TransactionType::Expense,
            'amount' => fake()->numberBetween(1_000, 10_000_000),
            'transacted_on' => fake()->dateTimeBetween('-1 year')->format('Y-m-d'),
            'account_id' => fn (array $attributes): string => FinancialAccount::factory()->create([
                'user_id' => $attributes['user_id'],
            ])->id,
            'destination_account_id' => null,
            'category_id' => fn (array $attributes): string => Category::factory()->expense()->create([
                'user_id' => $attributes['user_id'],
            ])->id,
            'note' => fake()->optional()->sentence(),
            'status' => TransactionStatus::Posted,
            'voided_at' => null,
            'void_reason' => null,
            'idempotency_key' => null,
            'created_by' => fn (array $attributes): string => $attributes['user_id'],
        ];
    }

    public function income(): static
    {
        return $this->state(fn (array $attributes): array => [
            'type' => TransactionType::Income,
            'destination_account_id' => null,
            'category_id' => fn (array $evaluatedAttributes): string => Category::factory()->income()->create([
                'user_id' => $evaluatedAttributes['user_id'],
            ])->id,
        ]);
    }

    public function expense(): static
    {
        return $this->state(fn (array $attributes): array => [
            'type' => TransactionType::Expense,
            'destination_account_id' => null,
            'category_id' => fn (array $evaluatedAttributes): string => Category::factory()->expense()->create([
                'user_id' => $evaluatedAttributes['user_id'],
            ])->id,
        ]);
    }

    public function transfer(): static
    {
        return $this->state(fn (array $attributes): array => [
            'type' => TransactionType::Transfer,
            'destination_account_id' => fn (array $evaluatedAttributes): string => FinancialAccount::factory()->create([
                'user_id' => $evaluatedAttributes['user_id'],
            ])->id,
            'category_id' => null,
        ]);
    }

    public function voided(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => TransactionStatus::Voided,
            'voided_at' => now(),
            'void_reason' => fake()->sentence(),
        ]);
    }

    public function withIdempotencyKey(): static
    {
        return $this->state(fn (array $attributes): array => [
            'idempotency_key' => (string) Str::uuid(),
        ]);
    }
}
