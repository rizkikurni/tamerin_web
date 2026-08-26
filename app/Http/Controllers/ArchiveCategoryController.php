<?php

namespace App\Http\Controllers;

use App\Actions\Categories\ArchiveCategory;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

class ArchiveCategoryController extends Controller
{
    public function __invoke(Category $category, ArchiveCategory $action): RedirectResponse
    {
        Gate::authorize('archive', $category);
        $action->handle($category);

        return to_route('categories.index')->with('status', 'category-archived');
    }
}
