<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use App\Rules\ValidTurnstileToken;
use App\Services\TurnstileVerifier;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class RegisterUserRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique(User::class)],
            'password' => ['required', 'confirmed', Password::defaults()],
            'cf-turnstile-response' => config('services.turnstile.enabled')
                ? [
                    'required',
                    'string',
                    'max:2048',
                    new ValidTurnstileToken($turnstileVerifier, 'register', $this->ip()),
                ]
                : ['nullable'],
        ];
    }

    /**
     * @return array{name: string, email: string, password: string}
     */
    public function registrationData(): array
    {
        return [
            'name' => $this->string('name')->toString(),
            'email' => $this->string('email')->toString(),
            'password' => $this->string('password')->toString(),
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'email' => Str::lower($this->string('email')->toString()),
        ]);
    }
}
