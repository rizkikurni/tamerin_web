<?php

namespace App\Actions\Telegram;

use App\Models\User;

class DisconnectTelegram
{
    public function handle(User $user): void
    {
        $connection = $user->telegramConnection;

        if ($connection === null) {
            return;
        }

        $connection->update([
            'telegram_chat_id' => null,
            'telegram_user_id' => null,
            'telegram_username' => null,
            'telegram_first_name' => null,
            'link_token_hash' => null,
            'link_token_expires_at' => null,
            'pending_draft' => null,
            'linked_at' => null,
        ]);
    }
}
