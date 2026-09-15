<?php

namespace App\Http\Requests\Auth;

use App\Rules\ValidTurnstileToken;
use App\Services\TurnstileVerifier;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(TurnstileVerifier $turnstileVerifier): array
    {
        return [
            'email' => ['required', 'string', 'lowercase', 'email'],
            'password' => ['required', 'string'],
            'remember' => ['sometimes', 'boolean'],
            'cf-turnstile-response' => config('services.turnstile.enabled')
                ? [
                    'required',
                    'string',
                    'max:2048',
                    new ValidTurnstileToken($turnstileVerifier, 'login', $this->ip()),
                ]
                : ['nullable'],
        ];
    }

    /**
     * @return array{email: string, password: string}
     */
    public function credentials(): array
    {
        return [
            'email' => $this->string('email')->toString(),
            'password' => $this->string('password')->toString(),
        ];
    }

    public function throttleKey(): string
    {
        return 'login-failures:'.hash('sha256', $this->string('email')->toString().'|'.($this->ip() ?? 'unknown'));
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'email' => Str::lower($this->string('email')->toString()),
        ]);
    }
}
