<?php

namespace App\Actions\Settings;

use App\Models\User;

class UpdateProfile
{
    /**
     * @param  array{name: string, email: string}  $data
     */
    public function handle(User $user, array $data): User
    {
        $user->fill($data);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return $user;
    }
}
