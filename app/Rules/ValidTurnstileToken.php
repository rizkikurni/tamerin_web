<?php

namespace App\Rules;

use App\Services\TurnstileVerifier;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Translation\PotentiallyTranslatedString;

final class ValidTurnstileToken implements ValidationRule
{
    public function __construct(
        private readonly TurnstileVerifier $verifier,
        private readonly string $expectedAction,
        private readonly ?string $ipAddress,
    ) {}

    /**
     * Run the validation rule.
     *
     * @param  Closure(string, ?string=): PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || ! $this->verifier->verify($value, $this->expectedAction, $this->ipAddress)) {
            $fail('Verifikasi keamanan gagal. Silakan coba lagi.');
        }
    }
}
