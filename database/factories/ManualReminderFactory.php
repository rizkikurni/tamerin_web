<?php

namespace Database\Factories;

use App\Enums\ManualReminderStatus;
use App\Models\ManualReminder;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ManualReminder>
 */
class ManualReminderFactory extends Factory
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
            'title' => fake()->sentence(4),
            'due_on' => fake()->boolean(70)
                ? fake()->dateTimeBetween('now', '+1 year')->format('Y-m-d')
                : null,
            'note' => fake()->optional()->sentence(),
            'status' => ManualReminderStatus::Active,
        ];
    }

    public function dismissed(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => ManualReminderStatus::Dismissed,
        ]);
    }

    public function done(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => ManualReminderStatus::Done,
        ]);
    }
}
