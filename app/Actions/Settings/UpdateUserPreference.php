<?php

namespace App\Actions\Settings;

use App\Models\User;
use App\Models\UserPreference;

class UpdateUserPreference
{
    /**
     * @param  array{
     *     theme_mode: string,
     *     theme_preset: string,
     *     primary_hex: string|null,
     *     secondary_hex: string|null,
     *     accent_hex: string|null,
     *     timezone: string
     * }  $data
     */
    public function handle(User $user, array $data): UserPreference
    {
        return $user->preference()->updateOrCreate([], $data);
    }
}
