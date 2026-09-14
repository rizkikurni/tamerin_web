<?php

namespace App\Actions\Auth;

use App\Enums\ThemeMode;
use App\Enums\ThemePreset;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RegisterUser
{
    /**
     * @param  array{name: string, email: string, password: string}  $data
     */
    public function handle(array $data): User
    {
        return DB::transaction(function () use ($data): User {
            $user = User::query()->create($data);

            $user->preference()->create([
                'theme_mode' => ThemeMode::System,
                'theme_preset' => ThemePreset::Violet,
                'primary_hex' => null,
                'secondary_hex' => null,
                'accent_hex' => null,
                'timezone' => 'Asia/Jakarta',
            ]);

            return $user;
        });
    }
}
