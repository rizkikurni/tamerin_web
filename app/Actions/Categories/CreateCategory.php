<?php

namespace App\Actions\Categories;

use App\Models\Category;
use App\Models\User;

class CreateCategory
{
    /** @param array{name: string, type: string, color_token: string|null, icon: string|null} $data */
    public function handle(User $user, array $data): Category
    {
        return $user->categories()->create([
            ...$data,
            'is_system' => false,
            'archived_at' => null,
        ]);
    }
}
