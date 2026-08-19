<?php

namespace Database\Factories;

use App\Models\Budget;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Budget>
 */
class BudgetFactory extends Factory
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
            'category_id' => fn (array $attributes): string => Category::factory()->expense()->create([
                'user_id' => $attributes['user_id'],
            ])->id,
            'period_start' => now()->startOfMonth()->toDateString(),
            'amount' => fake()->numberBetween(100_000, 20_000_000),
        ];
    }
}
