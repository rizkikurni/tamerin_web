<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

final class TurnstileVerifier
{
    public function verify(string $token, string $expectedAction, ?string $ipAddress): bool
    {
        $secretKey = config('services.turnstile.secret_key');
        $verifyUrl = config('services.turnstile.verify_url');
        $allowedHostnames = config('services.turnstile.allowed_hostnames');

        if (! is_string($secretKey) || $secretKey === '' ||
            ! is_string($verifyUrl) || $verifyUrl === '' ||
            ! is_array($allowedHostnames) || $allowedHostnames === []) {
            return false;
        }

        $payload = [
            'secret' => $secretKey,
            'response' => $token,
        ];

        if ($ipAddress !== null) {
            $payload['remoteip'] = $ipAddress;
        }

        try {
            $response = Http::asForm()
                ->acceptJson()
                ->connectTimeout(2)
                ->timeout(5)
                ->post($verifyUrl, $payload);
        } catch (ConnectionException $exception) {
            report($exception);

            return false;
        }

        if (! $response->successful() || $response->json('success') !== true) {
            return false;
        }

        $responseAction = $response->json('action');
        $responseHostname = $response->json('hostname');

        return is_string($responseAction)
            && hash_equals($expectedAction, $responseAction)
            && is_string($responseHostname)
            && in_array($responseHostname, $allowedHostnames, true);
    }
}
