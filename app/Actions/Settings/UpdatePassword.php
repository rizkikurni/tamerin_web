<?php

namespace App\Actions\Settings;

use App\Models\User;

class UpdatePassword
{
    public function handle(User $user, string $password): User
    {
        $user->forceFill(['password' => $password])->save();

        return $user;
    }
}
