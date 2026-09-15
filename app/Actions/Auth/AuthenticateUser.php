<?php

namespace App\Actions\Auth;

use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class AuthenticateUser
{
    private const int MAX_ATTEMPTS = 5;

    private const int DECAY_SECONDS = 60;

    /**
     * @param  array{email: string, password: string}  $credentials
     *
     * @throws ThrottleRequestsException|ValidationException
     */
    public function handle(array $credentials, bool $remember, string $throttleKey): void
    {
        $this->ensureIsNotRateLimited($throttleKey);

        if (! Auth::attempt($credentials, $remember)) {
            RateLimiter::hit($throttleKey, self::DECAY_SECONDS);

            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        RateLimiter::clear($throttleKey);
    }

    /**
     * @throws ThrottleRequestsException
     */
    private function ensureIsNotRateLimited(string $throttleKey): void
    {
        if (! RateLimiter::tooManyAttempts($throttleKey, self::MAX_ATTEMPTS)) {
            return;
        }

        $seconds = RateLimiter::availableIn($throttleKey);

        throw new ThrottleRequestsException(
            message: __('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => (int) ceil($seconds / 60),
            ]),
            headers: [
                'Retry-After' => (string) $seconds,
                'X-RateLimit-Reset' => (string) (time() + $seconds),
            ],
        );
    }
}
