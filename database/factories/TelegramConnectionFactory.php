<?php

namespace Database\Factories;

use App\Models\TelegramConnection;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TelegramConnection>
 */
class TelegramConnectionFactory extends Factory
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
            'telegram_chat_id' => (string) fake()->unique()->numberBetween(100_000_000, 999_999_999),
            'telegram_user_id' => (string) fake()->numberBetween(100_000_000, 999_999_999),
            'telegram_username' => fake()->userName(),
            'telegram_first_name' => fake()->firstName(),
            'default_account_id' => null,
            'link_token_hash' => null,
            'link_token_expires_at' => null,
            'pending_draft' => null,
            'daily_reminder_enabled' => true,
            'last_daily_reminder_sent_on' => null,
            'last_update_id' => null,
            'linked_at' => now(),
        ];
    }

    public function unlinked(): static
    {
        return $this->state(fn (array $attributes): array => [
            'telegram_chat_id' => null,
            'telegram_user_id' => null,
            'telegram_username' => null,
            'telegram_first_name' => null,
            'linked_at' => null,
        ]);
    }
}
