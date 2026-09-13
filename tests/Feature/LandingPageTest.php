<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('landing page can be rendered for guests', function () {
    $this->get(route('home'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
            ->where('auth.user', null));
});

test('landing page can be rendered for authenticated users', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('home'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
            ->where('auth.user.id', $user->id));
});

test('guests are redirected from application pages to the landing page', function (string $routeName) {
    $this->get(route($routeName))->assertRedirect(route('home'));
})->with([
    'dashboard' => 'dashboard',
    'transactions' => 'transactions.index',
    'reports' => 'reports.index',
    'profile' => 'profile.edit',
]);
