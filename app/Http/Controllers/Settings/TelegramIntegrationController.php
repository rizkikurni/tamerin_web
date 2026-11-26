<?php

namespace App\Http\Controllers\Settings;

use App\Actions\Telegram\DisconnectTelegram;
use App\Actions\Telegram\GenerateTelegramLinkToken;
use App\Actions\Telegram\UpdateTelegramSettings;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateTelegramSettingsRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TelegramIntegrationController extends Controller
{
    public function generateLinkToken(
        Request $request,
        GenerateTelegramLinkToken $action,
    ): RedirectResponse {
        /** @var User $user */
        $user = $request->user();
        $linkData = $action->handle($user);

        return to_route('preferences.edit')
            ->with('status', 'Link penghubung Telegram berhasil dibuat (berlaku 15 menit).')
            ->with('telegram_link', $linkData);
    }

    public function update(
        UpdateTelegramSettingsRequest $request,
        UpdateTelegramSettings $action,
    ): RedirectResponse {
        /** @var User $user */
        $user = $request->user();

        $action->handle($user, $request->telegramSettingsData());

        return to_route('preferences.edit')
            ->with('status', 'Pengaturan integrasi Telegram berhasil disimpan.');
    }

    public function destroy(
        Request $request,
        DisconnectTelegram $action,
    ): RedirectResponse {
        /** @var User $user */
        $user = $request->user();

        $action->handle($user);

        return to_route('preferences.edit')
            ->with('status', 'Sambungan akun Telegram telah diputuskan.');
    }
}
