<?php

use App\Services\TurnstileVerifier;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    config()->set([
        'services.turnstile.enabled' => true,
        'services.turnstile.site_key' => 'test-site-key',
        'services.turnstile.secret_key' => 'test-secret-key',
        'services.turnstile.allowed_hostnames' => ['tamerin.test'],
    ]);

    Http::preventStrayRequests();
});

test('auth pages receive the public turnstile site key', function (string $routeName, string $component) {
    $this->get(route($routeName))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component($component)
            ->where('turnstileSiteKey', 'test-site-key'));
})->with([
    'login' => ['login', 'auth/login'],
    'registration' => ['register', 'auth/register'],
]);

test('turnstile is required before login credentials are checked', function () {
    $this->post(route('login.store'), [
        'email' => 'rizki@example.com',
        'password' => 'password',
    ])->assertInvalid(['cf-turnstile-response']);

    Http::assertNothingSent();
});

test('valid turnstile responses are accepted', function () {
    Http::fake([
        'https://challenges.cloudflare.com/turnstile/v0/siteverify' => Http::response([
            'success' => true,
            'hostname' => 'tamerin.test',
            'action' => 'login',
        ]),
    ]);

    $verified = app(TurnstileVerifier::class)->verify(
        token: 'valid-token',
        expectedAction: 'login',
        ipAddress: '203.0.113.10',
    );

    expect($verified)->toBeTrue();

    Http::assertSent(fn (Request $request): bool => $request->isForm()
        && $request['secret'] === 'test-secret-key'
        && $request['response'] === 'valid-token'
        && $request['remoteip'] === '203.0.113.10');
});

test('turnstile responses with an unexpected action are rejected', function () {
    Http::fake([
        'https://challenges.cloudflare.com/turnstile/v0/siteverify' => Http::response([
            'success' => true,
            'hostname' => 'tamerin.test',
            'action' => 'register',
        ]),
    ]);

    expect(app(TurnstileVerifier::class)->verify('token', 'login', null))->toBeFalse();
});

test('turnstile responses from an unexpected hostname are rejected', function () {
    Http::fake([
        'https://challenges.cloudflare.com/turnstile/v0/siteverify' => Http::response([
            'success' => true,
            'hostname' => 'malicious.example',
            'action' => 'login',
        ]),
    ]);

    expect(app(TurnstileVerifier::class)->verify('token', 'login', null))->toBeFalse();
});

test('turnstile verification fails closed when cloudflare cannot be reached', function () {
    Http::fake([
        'https://challenges.cloudflare.com/turnstile/v0/siteverify' => Http::failedConnection(),
    ]);

    expect(app(TurnstileVerifier::class)->verify('token', 'login', null))->toBeFalse();
});

test('invalid turnstile tokens are returned as validation errors', function () {
    Http::fake([
        'https://challenges.cloudflare.com/turnstile/v0/siteverify' => Http::response([
            'success' => false,
            'error-codes' => ['invalid-input-response'],
        ]),
    ]);

    $this->post(route('login.store'), [
        'email' => 'rizki@example.com',
        'password' => 'password',
        'cf-turnstile-response' => 'invalid-token',
    ])->assertInvalid(['cf-turnstile-response']);
});
