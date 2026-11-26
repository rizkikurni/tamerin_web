<?php

namespace App\Http\Controllers\Settings;

use App\Actions\Settings\UpdateUserPreference;
use App\Enums\ThemeMode;
use App\Enums\ThemePreset;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateUserPreferenceRequest;
use App\Models\FinancialAccount;
use App\Models\User;
use App\Services\TelegramBotClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserPreferenceController extends Controller
{
    public function edit(Request $request, TelegramBotClient $botClient): Response
    {
        /** @var User $user */
        $user = $request->user();
        $preference = $user->preference;
        $connection = $user->telegramConnection;

        $accountOptions = FinancialAccount::query()
            ->whereBelongsTo($user)
            ->active()
            ->whereNull('archived_at')
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (FinancialAccount $account): array => [
                'value' => $account->id,
                'label' => $account->name,
            ])
            ->values()
            ->all();

        /** @var array{token: string, connect_url: string, expires_at: string}|null $flashLink */
        $flashLink = $request->session()->get('telegram_link');

        return Inertia::render('settings/preferences', [
            'preferences' => [
                'theme_mode' => $preference?->theme_mode->value ?? ThemeMode::System->value,
                'theme_preset' => $preference?->theme_preset->value ?? ThemePreset::Violet->value,
                'primary_hex' => $preference?->primary_hex,
                'secondary_hex' => $preference?->secondary_hex,
                'accent_hex' => $preference?->accent_hex,
                'timezone' => $preference->timezone ?? 'Asia/Jakarta',
                'financial_cycle_start_day' => $user->financialCycleStartDay(),
            ],
            'themeModes' => array_column(ThemeMode::cases(), 'value'),
            'themePresets' => array_column(ThemePreset::cases(), 'value'),
            'telegram' => [
                'configured' => $botClient->isConfigured(),
                'bot_username' => $botClient->botUsername(),
                'linked' => $connection?->isLinked() ?? false,
                'telegram_username' => $connection?->telegram_username,
                'telegram_first_name' => $connection?->telegram_first_name,
                'linked_at' => $connection?->linked_at?->toISOString(),
                'default_account_id' => $connection?->default_account_id,
                'daily_reminder_enabled' => $connection->daily_reminder_enabled ?? true,
                'link_token' => $flashLink['token'] ?? null,
                'connect_url' => $flashLink['connect_url'] ?? null,
                'link_expires_at' => $flashLink['expires_at'] ?? null,
            ],
            'accountOptions' => $accountOptions,
        ]);
    }

    public function update(
        UpdateUserPreferenceRequest $request,
        UpdateUserPreference $action,
    ): RedirectResponse {
        /** @var User $user */
        $user = $request->user();

        $action->handle($user, $request->preferenceData());

        return to_route('preferences.edit')->with('status', 'preferences-updated');
    }
}
