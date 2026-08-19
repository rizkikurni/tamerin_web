<?php

namespace App\Http\Requests\Settings;

use App\Enums\ThemeMode;
use App\Enums\ThemePreset;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserPreferenceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'theme_mode' => ['required', Rule::enum(ThemeMode::class)],
            'theme_preset' => ['required', Rule::enum(ThemePreset::class)],
            'primary_hex' => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'secondary_hex' => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'accent_hex' => ['nullable', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'timezone' => ['required', 'string', 'timezone'],
        ];
    }

    /**
     * @return array{
     *     theme_mode: string,
     *     theme_preset: string,
     *     primary_hex: string|null,
     *     secondary_hex: string|null,
     *     accent_hex: string|null,
     *     timezone: string
     * }
     */
    public function preferenceData(): array
    {
        return [
            'theme_mode' => $this->string('theme_mode')->toString(),
            'theme_preset' => $this->string('theme_preset')->toString(),
            'primary_hex' => $this->nullableString('primary_hex'),
            'secondary_hex' => $this->nullableString('secondary_hex'),
            'accent_hex' => $this->nullableString('accent_hex'),
            'timezone' => $this->string('timezone')->toString(),
        ];
    }

    private function nullableString(string $key): ?string
    {
        return $this->filled($key)
            ? $this->string($key)->toString()
            : null;
    }
}
