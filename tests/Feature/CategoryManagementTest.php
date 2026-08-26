<?php

use App\Enums\CategoryType;
use App\Models\Category;
use App\Models\User;
use Illuminate\Support\Collection;
use Inertia\Testing\AssertableInertia as Assert;

test('users only see their own categories including archived history', function () {
    $user = User::factory()->create();
    $activeCategory = Category::factory()->for($user)->create();
    $archivedCategory = Category::factory()->for($user)->archived()->create();
    $otherCategory = Category::factory()->create();

    $this->actingAs($user)
        ->get(route('categories.index'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('categories/index')
            ->has('categories.data', 2)
            ->where('categories.data', fn (Collection $categories): bool => $categories->contains('id', $activeCategory->id)
                && $categories->contains('id', $archivedCategory->id)
                && $categories->doesntContain('id', $otherCategory->id)));
});

test('users can create a category', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('categories.store'), [
            'name' => 'Kebutuhan Rumah',
            'type' => CategoryType::Expense->value,
            'color_token' => 'rose',
            'icon' => 'house',
        ])
        ->assertRedirect(route('categories.index'))
        ->assertSessionHas('status', 'category-created');

    $category = Category::query()->sole();

    expect($category)
        ->user_id->toBe($user->id)
        ->name->toBe('Kebutuhan Rumah')
        ->type->toBe(CategoryType::Expense)
        ->is_system->toBeFalse()
        ->archived_at->toBeNull();
});

test('category names must be unique per user and type', function () {
    $user = User::factory()->create();
    Category::factory()->for($user)->expense()->create(['name' => 'Makanan']);

    $payload = [
        'name' => 'Makanan',
        'type' => CategoryType::Expense->value,
        'color_token' => null,
        'icon' => null,
    ];

    $this->actingAs($user)
        ->post(route('categories.store'), $payload)
        ->assertInvalid(['name']);

    $this->actingAs($user)
        ->post(route('categories.store'), [
            ...$payload,
            'type' => CategoryType::Income->value,
        ])
        ->assertRedirect(route('categories.index'));

    $otherUser = User::factory()->create();

    $this->actingAs($otherUser)
        ->post(route('categories.store'), $payload)
        ->assertRedirect(route('categories.index'));
});

test('users can update their own active category', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create();

    $this->actingAs($user)
        ->patch(route('categories.update', $category), [
            'name' => 'Transportasi',
            'type' => CategoryType::Expense->value,
            'color_token' => 'blue',
            'icon' => 'car',
        ])
        ->assertRedirect(route('categories.index'))
        ->assertSessionHas('status', 'category-updated');

    expect($category->refresh())
        ->name->toBe('Transportasi')
        ->type->toBe(CategoryType::Expense)
        ->color_token->toBe('blue')
        ->icon->toBe('car');
});

test('users cannot read or update another users category', function () {
    $user = User::factory()->create();
    $otherCategory = Category::factory()->create();

    $this->actingAs($user)
        ->get(route('categories.edit', $otherCategory))
        ->assertForbidden();

    $this->actingAs($user)
        ->patch(route('categories.update', $otherCategory), [
            'name' => 'Tidak Boleh Berubah',
            'type' => CategoryType::Expense->value,
            'color_token' => null,
            'icon' => null,
        ])
        ->assertForbidden();

    expect($otherCategory->refresh()->name)->not->toBe('Tidak Boleh Berubah');
});

test('users can archive a category once and archived categories are excluded from active choices', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create();

    $this->actingAs($user)
        ->patch(route('categories.archive', $category))
        ->assertRedirect(route('categories.index'))
        ->assertSessionHas('status', 'category-archived');

    expect($category->refresh()->archived_at)
        ->not->toBeNull()
        ->and(Category::query()->active()->pluck('id'))
        ->not->toContain($category->id);

    $this->actingAs($user)
        ->patch(route('categories.archive', $category))
        ->assertForbidden();
});
