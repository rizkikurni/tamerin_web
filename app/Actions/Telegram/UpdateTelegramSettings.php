<?php

namespace App\Actions\Telegram;

use App\Enums\FinancialAccountStatus;
use App\Models\FinancialAccount;
use App\Models\TelegramConnection;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class UpdateTelegramSettings
{
    /**
     * @param  array{default_account_id: string|null, daily_reminder_enabled: bool}  $data
     */
    public function handle(User $user, array $data): TelegramConnection
    {
        $defaultAccountId = $data['default_account_id'];

        if ($defaultAccountId !== null) {
            $exists = FinancialAccount::query()
                ->whereKey($defaultAccountId)
                ->whereBelongsTo($user)
                ->where('status', FinancialAccountStatus::Active)
                ->whereNull('archived_at')
                ->exists();

            if (! $exists) {
                throw ValidationException::withMessages([
                    'default_account_id' => 'Akun default tidak valid atau sudah diarsipkan.',
                ]);
            }
        }

        return TelegramConnection::query()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'default_account_id' => $defaultAccountId,
                'daily_reminder_enabled' => $data['daily_reminder_enabled'],
            ],
        );
    }
}
