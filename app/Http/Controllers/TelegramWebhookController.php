<?php

namespace App\Http\Controllers;

use App\Actions\Telegram\HandleTelegramUpdate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TelegramWebhookController extends Controller
{
    public function __invoke(Request $request, HandleTelegramUpdate $action): JsonResponse
    {
        $configuredSecret = config('services.telegram.webhook_secret');
        $providedSecret = $request->header('X-Telegram-Bot-Api-Secret-Token');

        if (! is_string($configuredSecret) || $configuredSecret === '' ||
            ! is_string($providedSecret) || ! hash_equals($configuredSecret, $providedSecret)) {
            return response()->json(['ok' => false, 'message' => 'Forbidden.'], 403);
        }

        /** @var array<string, mixed> $payload */
        $payload = $request->all();

        $action->handle($payload);

        return response()->json(['ok' => true]);
    }
}
