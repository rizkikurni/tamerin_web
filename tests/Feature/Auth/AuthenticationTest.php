<?php

use App\Actions\Auth\AuthenticateUser;
use App\Models\User;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
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

test('all login requests are broadly rate limited by ip address', function () {
    foreach (range(1, 30) as $attempt) {
        $this->post(route('login.store'))->assertInvalid(['email', 'password']);
    }

    $this->post(route('login.store'))->assertTooManyRequests();
});

test('successful authentication clears previous failed login attempts', function () {
    $user = User::factory()->create();

    foreach (range(1, 4) as $attempt) {
        $this->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'wrong-password',
        ])->assertInvalid(['email']);
    }

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect(route('dashboard'));

    $this->post(route('logout'))->assertRedirect(route('login'));

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

test('failed authentication attempts are counted before authentication is blocked', function () {
    Auth::shouldReceive('attempt')->times(5)->andReturnFalse();

    $action = app(AuthenticateUser::class);
    $credentials = [
        'email' => 'rizki@example.com',
        'password' => 'wrong-password',
    ];
    $throttleKey = 'login-failures:test-failed-attempts';

    foreach (range(1, 5) as $attempt) {
        try {
            $action->handle($credentials, false, $throttleKey);
        } catch (ValidationException $exception) {
            expect($exception->errors())->toHaveKey('email');
        }
    }

    expect(RateLimiter::attempts($throttleKey))->toBe(5)
        ->and(fn () => $action->handle($credentials, false, $throttleKey))
        ->toThrow(ThrottleRequestsException::class);
});

test('successful authentication clears its failed attempt counter', function () {
    Auth::shouldReceive('attempt')->once()->andReturnTrue();

    $action = app(AuthenticateUser::class);
    $credentials = [
        'email' => 'rizki@example.com',
        'password' => 'password',
    ];
    $throttleKey = 'login-failures:test-successful-attempt';

    foreach (range(1, 4) as $attempt) {
        RateLimiter::hit($throttleKey, 60);
    }

    $action->handle($credentials, false, $throttleKey);

    expect(RateLimiter::attempts($throttleKey))->toBe(0);
});
