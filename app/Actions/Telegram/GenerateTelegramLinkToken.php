<?php

namespace App\Actions\Telegram;

use App\Models\TelegramConnection;
use App\Models\User;
use App\Services\TelegramBotClient;
use Illuminate\Support\Str;

class GenerateTelegramLinkToken
{
    public function __construct(private TelegramBotClient $botClient) {}

    /**
     * @return array{token: string, connect_url: string, expires_at: string}
     */
    public function handle(User $user): array
    {
        $token = Str::random(32);
        $expiresAt = now()->addMinutes(15);

        TelegramConnection::query()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'link_token_hash' => hash('sha256', $token),
                'link_token_expires_at' => $expiresAt,
            ],
        );

        $botUsername = $this->botClient->botUsername();

        return [
            'token' => $token,
            'connect_url' => "https://t.me/{$botUsername}?start={$token}",
            'expires_at' => $expiresAt->toISOString(),
        ];
    }
}
