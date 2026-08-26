<?php

namespace App\Http\Controllers;

use App\Actions\Categories\CreateCategory;
use App\Actions\Categories\UpdateCategory;
use App\Enums\CategoryType;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Category::class);

        /** @var User $user */
        $user = $request->user();

        $categories = $user->categories()
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Category $category): array => [
                'id' => $category->id,
                'name' => $category->name,
                'type' => $category->type->value,
                'color_token' => $category->color_token,
                'icon' => $category->icon,
                'is_system' => $category->is_system,
                'archived_at' => $category->archived_at?->toISOString(),
            ]);

        return Inertia::render('categories/index', ['categories' => $categories]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Category::class);

        return Inertia::render('categories/create', $this->formOptions());
    }

    public function store(StoreCategoryRequest $request, CreateCategory $action): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        $action->handle($user, $request->categoryData());

        return to_route('categories.index')->with('status', 'category-created');
    }

    public function edit(Category $category): Response
    {
        Gate::authorize('update', $category);

        return Inertia::render('categories/edit', [
            'category' => [
                'id' => $category->id,
                'name' => $category->name,
                'type' => $category->type->value,
                'color_token' => $category->color_token,
                'icon' => $category->icon,
            ],
            ...$this->formOptions(),
        ]);
    }

    public function update(
        UpdateCategoryRequest $request,
        Category $category,
        UpdateCategory $action,
    ): RedirectResponse {
        $action->handle($category, $request->categoryData());

        return to_route('categories.index')->with('status', 'category-updated');
    }

    /**
     * @return array{
     *     categoryTypes: list<array{value: string, label: string}>,
     *     colorOptions: list<array{value: string, label: string}>,
     *     iconOptions: list<array{value: string, label: string}>
     * }
     */
    private function formOptions(): array
    {
        return [
            'categoryTypes' => [
                ['value' => CategoryType::Income->value, 'label' => 'Pemasukan'],
                ['value' => CategoryType::Expense->value, 'label' => 'Pengeluaran'],
            ],
            'colorOptions' => [
                ['value' => 'blue', 'label' => 'Biru'],
                ['value' => 'green', 'label' => 'Hijau'],
                ['value' => 'violet', 'label' => 'Ungu'],
                ['value' => 'amber', 'label' => 'Kuning'],
                ['value' => 'rose', 'label' => 'Merah muda'],
            ],
            'iconOptions' => [
                ['value' => 'wallet', 'label' => 'Dompet'],
                ['value' => 'shopping-cart', 'label' => 'Belanja'],
                ['value' => 'utensils', 'label' => 'Makanan'],
                ['value' => 'car', 'label' => 'Transportasi'],
                ['value' => 'briefcase-business', 'label' => 'Pekerjaan'],
                ['value' => 'house', 'label' => 'Rumah'],
                ['value' => 'heart-pulse', 'label' => 'Kesehatan'],
                ['value' => 'graduation-cap', 'label' => 'Pendidikan'],
                ['value' => 'gift', 'label' => 'Hadiah'],
                ['value' => 'circle-dollar-sign', 'label' => 'Keuangan'],
            ],
        ];
    }
}
