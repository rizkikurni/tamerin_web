<?php

namespace App\Actions\Categories;

use App\Models\Category;
use DomainException;

class ArchiveCategory
{
    public function handle(Category $category): Category
    {
        if ($category->archived_at !== null) {
            throw new DomainException('Kategori sudah diarsipkan.');
        }

        $category->update(['archived_at' => now()]);

        return $category->refresh();
    }
}
