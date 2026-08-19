<?php

namespace Database\Factories;

use App\Enums\ThemeMode;
use App\Enums\ThemePreset;
use App\Models\User;
use App\Models\UserPreference;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserPreference>
 */
class UserPreferenceFactory extends Factory
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
            'theme_mode' => fake()->randomElement(ThemeMode::cases()),
            'theme_preset' => fake()->randomElement(ThemePreset::cases()),
            'primary_hex' => fake()->optional()->hexColor(),
            'secondary_hex' => fake()->optional()->hexColor(),
            'accent_hex' => fake()->optional()->hexColor(),
            'timezone' => 'Asia/Jakarta',
        ];
    }
}
