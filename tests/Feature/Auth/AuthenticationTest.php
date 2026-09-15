<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('login screen can be rendered', function () {
    $this->get(route('login'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page->component('auth/login'));
});

test('users can authenticate', function () {
    $user = User::factory()->create();

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertRedirect(route('dashboard'));
    $this->assertAuthenticatedAs($user);
});

test('session id is regenerated after authentication', function () {
    $user = User::factory()->create();

    $this->withSession(['session-marker' => 'before-login']);
    $sessionIdBeforeLogin = session()->getId();

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect(route('dashboard'));

    expect(session()->getId())->not->toBe($sessionIdBeforeLogin);
});

test('users cannot authenticate with an invalid password', function () {
    $user = User::factory()->create();

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'wrong-password',
    ])->assertInvalid(['email']);

    $this->assertGuest();
});

test('authenticated users can logout', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('logout'))
        ->assertRedirect(route('login'));

    $this->assertGuest();
});

test('guests are redirected from protected settings pages', function (string $routeName) {
    $this->get(route($routeName))->assertRedirect(route('home'));
})->with([
    'profile' => 'profile.edit',
    'password' => 'password.edit',
    'preferences' => 'preferences.edit',
]);

test('login attempts are rate limited', function () {
    $user = User::factory()->create();

    foreach (range(1, 5) as $attempt) {
        $this->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'wrong-password',
        ])->assertInvalid(['email']);
    }

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'wrong-password',
    ])->assertTooManyRequests();
});
