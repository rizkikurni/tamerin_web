<?php

namespace App\Http\Controllers\Settings;

use App\Actions\Settings\UpdateUserPreference;
use App\Enums\ThemeMode;
use App\Enums\ThemePreset;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateUserPreferenceRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserPreferenceController extends Controller
{
    public function edit(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();
        $preference = $user->preference;

        return Inertia::render('settings/preferences', [
            'preferences' => [
                'theme_mode' => $preference?->theme_mode->value ?? ThemeMode::System->value,
                'theme_preset' => $preference?->theme_preset->value ?? ThemePreset::Ocean->value,
                'primary_hex' => $preference?->primary_hex,
                'secondary_hex' => $preference?->secondary_hex,
                'accent_hex' => $preference?->accent_hex,
                'timezone' => $preference->timezone ?? 'Asia/Jakarta',
            ],
            'themeModes' => array_column(ThemeMode::cases(), 'value'),
            'themePresets' => array_column(ThemePreset::cases(), 'value'),
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
