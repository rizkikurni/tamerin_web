<?php

namespace App\Actions\Categories;

use App\Models\Category;

class UpdateCategory
{
    /** @param array{name: string, type: string, color_token: string|null, icon: string|null} $data */
    public function handle(Category $category, array $data): Category
    {
        $category->update($data);

        return $category->refresh();
    }
}
