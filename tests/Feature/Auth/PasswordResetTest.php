<?php

use App\Models\User;
use Illuminate\Auth\Events\PasswordReset as PasswordResetEvent;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Inertia\Testing\AssertableInertia as Assert;

test('forgot password screen can be rendered', function () {
    $this->get(route('password.request'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page->component('auth/forgot-password'));
});

test('password reset links can be requested', function () {
    $user = User::factory()->create();
    Notification::fake();

    $this->post(route('password.email'), [
        'email' => $user->email,
    ])->assertSessionHas('status');

    Notification::assertSentTo($user, ResetPassword::class);
});

test('password reset screen can be rendered', function () {
    $user = User::factory()->create();
    $token = Password::createToken($user);

    $this->get(route('password.reset', [
        'token' => $token,
        'email' => $user->email,
    ]))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('auth/reset-password')
            ->where('token', $token)
            ->where('email', $user->email));
});

test('passwords can be reset with a valid token', function () {
    $user = User::factory()->create();
    $token = Password::createToken($user);
    Event::fake();

    $this->post(route('password.store'), [
        'token' => $token,
        'email' => $user->email,
        'password' => 'new-password',
        'password_confirmation' => 'new-password',
    ])->assertRedirect(route('login'));

    expect(Hash::check('new-password', $user->refresh()->password))->toBeTrue();
    Event::assertDispatched(PasswordResetEvent::class);
});

test('passwords cannot be reset with an invalid token', function () {
    $user = User::factory()->create();

    $this->post(route('password.store'), [
        'token' => 'invalid-token',
        'email' => $user->email,
        'password' => 'new-password',
        'password_confirmation' => 'new-password',
    ])->assertInvalid(['email']);
});

test('password reset link requests are rate limited', function () {
    $user = User::factory()->create();
    Notification::fake();

    foreach (range(1, 3) as $attempt) {
        $this->post(route('password.email'), [
            'email' => $user->email,
        ])->assertRedirect();
    }

    $this->post(route('password.email'), [
        'email' => $user->email,
    ])->assertTooManyRequests();
});
