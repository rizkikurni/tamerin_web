<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTelegramSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'default_account_id' => ['nullable', 'string', 'max:36'],
            'daily_reminder_enabled' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array{default_account_id: string|null, daily_reminder_enabled: bool}
     */
    public function telegramSettingsData(): array
    {
        $accountId = $this->input('default_account_id');

        return [
            'default_account_id' => is_string($accountId) && trim($accountId) !== ''
                ? trim($accountId)
                : null,
            'daily_reminder_enabled' => $this->boolean('daily_reminder_enabled'),
        ];
    }
}
