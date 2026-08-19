<?php

use App\Enums\ThemeMode;
use App\Enums\ThemePreset;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

test('registration screen can be rendered', function () {
    $this->get(route('register'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page->component('auth/register'));
});

test('new users can register with default preferences', function () {
    $response = $this->post(route('register.store'), [
        'name' => 'Rizki Tamerin',
        'email' => 'rizki@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertRedirect(route('profile.edit'));
    $this->assertAuthenticated();

    $user = User::query()->where('email', 'rizki@example.com')->firstOrFail();

    expect($user->name)->toBe('Rizki Tamerin')
        ->and(Hash::check('password', $user->password))->toBeTrue()
        ->and($user->preference)->not->toBeNull()
        ->and($user->preference?->theme_mode)->toBe(ThemeMode::System)
        ->and($user->preference?->theme_preset)->toBe(ThemePreset::Ocean)
        ->and($user->preference?->timezone)->toBe('Asia/Jakarta');
});

test('registration validates unique email and password confirmation', function () {
    User::factory()->create(['email' => 'rizki@example.com']);

    $this->post(route('register.store'), [
        'name' => 'Rizki Tamerin',
        'email' => 'rizki@example.com',
        'password' => 'password',
        'password_confirmation' => 'different-password',
    ])->assertInvalid(['email', 'password']);

    $this->assertGuest();
});
