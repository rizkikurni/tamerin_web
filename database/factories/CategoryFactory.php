<?php

namespace Database\Factories;

use App\Enums\CategoryType;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
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
            'type' => CategoryType::Expense,
            'color_token' => fake()->optional()->randomElement(['blue', 'green', 'violet', 'amber', 'rose']),
            'icon' => fake()->optional()->randomElement(['wallet', 'shopping-cart', 'utensils', 'car', 'briefcase-business']),
            'is_system' => false,
            'archived_at' => null,
        ];
    }

    public function income(): static
    {
        return $this->state(fn (array $attributes): array => [
            'type' => CategoryType::Income,
        ]);
    }

    public function expense(): static
    {
        return $this->state(fn (array $attributes): array => [
            'type' => CategoryType::Expense,
        ]);
    }

    public function archived(): static
    {
        return $this->state(fn (array $attributes): array => [
            'archived_at' => now(),
        ]);
    }
}
