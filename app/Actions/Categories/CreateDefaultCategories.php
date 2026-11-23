<?php

namespace App\Actions\Categories;

use App\Enums\CategoryType;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class CreateDefaultCategories
{
    /**
     * @return Collection<int, Category>
     */
    public function handle(User $user): Collection
    {
        return $user->categories()->createMany($this->definitions());
    }

    /**
     * @return list<array{
     *     name: string,
     *     type: CategoryType,
     *     color_token: string,
     *     icon: string,
     *     is_system: bool,
     *     archived_at: null
     * }>
     */
    public function definitions(): array
    {
        return [
            [
                'name' => 'Gaji',
                'type' => CategoryType::Income,
                'color_token' => 'green',
                'icon' => 'briefcase-business',
                'is_system' => true,
                'archived_at' => null,
            ],
            [
                'name' => 'Pemasukan Lainnya',
                'type' => CategoryType::Income,
                'color_token' => 'blue',
                'icon' => 'circle-dollar-sign',
                'is_system' => true,
                'archived_at' => null,
            ],
            [
                'name' => 'Makanan & Minuman',
                'type' => CategoryType::Expense,
                'color_token' => 'amber',
                'icon' => 'utensils',
                'is_system' => true,
                'archived_at' => null,
            ],
            [
                'name' => 'Transportasi',
                'type' => CategoryType::Expense,
                'color_token' => 'blue',
                'icon' => 'car',
                'is_system' => true,
                'archived_at' => null,
            ],
            [
                'name' => 'Belanja',
                'type' => CategoryType::Expense,
                'color_token' => 'violet',
                'icon' => 'shopping-cart',
                'is_system' => true,
                'archived_at' => null,
            ],
            [
                'name' => 'Tagihan & Rumah',
                'type' => CategoryType::Expense,
                'color_token' => 'rose',
                'icon' => 'house',
                'is_system' => true,
                'archived_at' => null,
            ],
        ];
    }
}
