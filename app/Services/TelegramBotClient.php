<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * @phpstan-type InlineKeyboardButton array{text: string, callback_data?: string, url?: string}
 * @phpstan-type InlineKeyboard list<list<InlineKeyboardButton>>
 */
final class TelegramBotClient
{
    public function isConfigured(): bool
    {
        $token = config('services.telegram.bot_token');

        return is_string($token) && trim($token) !== '';
    }

    public function botUsername(): string
    {
        $username = config('services.telegram.bot_username');

        if (! is_string($username) || trim($username) === '') {
            return 'tamerin_finance_bot';
        }

        return ltrim(trim($username), '@');
    }

    /**
     * @param  InlineKeyboard|null  $inlineKeyboard
     */
    public function sendMessage(
        string $chatId,
        string $text,
        ?array $inlineKeyboard = null,
    ): bool {
        $payload = [
            'chat_id' => $chatId,
            'text' => $text,
            'parse_mode' => 'HTML',
            'disable_web_page_preview' => true,
        ];

        if ($inlineKeyboard !== null && $inlineKeyboard !== []) {
            $payload['reply_markup'] = [
                'inline_keyboard' => $inlineKeyboard,
            ];
        }

        $response = $this->post('sendMessage', $payload);

        return $response !== null && $response->successful() && $response->json('ok') === true;
    }

    /**
     * @param  InlineKeyboard|null  $inlineKeyboard
     */
    public function editMessageText(
        string $chatId,
        int $messageId,
        string $text,
        ?array $inlineKeyboard = null,
    ): bool {
        $payload = [
            'chat_id' => $chatId,
            'message_id' => $messageId,
            'text' => $text,
            'parse_mode' => 'HTML',
            'disable_web_page_preview' => true,
            'reply_markup' => [
                'inline_keyboard' => $inlineKeyboard ?? [],
            ],
        ];

        $response = $this->post('editMessageText', $payload);

        return $response !== null && $response->successful() && $response->json('ok') === true;
    }

    public function answerCallbackQuery(string $callbackQueryId, ?string $text = null): bool
    {
        $payload = [
            'callback_query_id' => $callbackQueryId,
        ];

        if ($text !== null && $text !== '') {
            $payload['text'] = $text;
        }

        $response = $this->post('answerCallbackQuery', $payload);

        return $response !== null && $response->successful() && $response->json('ok') === true;
    }

    /**
     * @return array{ok: bool, description: string}
     */
    public function setWebhook(string $webhookUrl, string $secretToken): array
    {
        $response = $this->post('setWebhook', [
            'url' => $webhookUrl,
            'secret_token' => $secretToken,
            'allowed_updates' => ['message', 'callback_query'],
        ]);

        if ($response === null) {
            return [
                'ok' => false,
                'description' => 'Tidak dapat menghubungi server Telegram atau token belum dikonfigurasi.',
            ];
        }

        $description = $response->json('description');

        return [
            'ok' => $response->successful() && $response->json('ok') === true,
            'description' => is_string($description) ? $description : 'Status webhook diperbarui.',
        ];
    }

    /**
     * @return array{ok: bool, description: string}
     */
    public function deleteWebhook(): array
    {
        $response = $this->post('deleteWebhook', [
            'drop_pending_updates' => false,
        ]);

        if ($response === null) {
            return [
                'ok' => false,
                'description' => 'Tidak dapat menghubungi server Telegram atau token belum dikonfigurasi.',
            ];
        }

        $description = $response->json('description');

        return [
            'ok' => $response->successful() && $response->json('ok') === true,
            'description' => is_string($description) ? $description : 'Webhook dihapus.',
        ];
    }

    /**
     * @param  list<array{command: string, description: string}>  $commands
     */
    public function setMyCommands(array $commands): bool
    {
        $response = $this->post('setMyCommands', [
            'commands' => $commands,
        ]);

        return $response !== null && $response->successful() && $response->json('ok') === true;
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function getUpdates(?int $offset = null, int $timeout = 8): array
    {
        if (! $this->isConfigured()) {
            return [];
        }

        $payload = [
            'timeout' => max(0, min(25, $timeout)),
            'allowed_updates' => ['message', 'callback_query'],
        ];

        if ($offset !== null) {
            $payload['offset'] = $offset;
        }

        try {
            $response = $this->client(max(10, $timeout + 5), withRetry: false)
                ->post('getUpdates', $payload);
        } catch (ConnectionException) {
            return [];
        }

        if (! $response->successful() || $response->json('ok') !== true) {
            return [];
        }

        $result = $response->json('result');

        if (! is_array($result)) {
            return [];
        }

        /** @var list<array<string, mixed>> $updates */
        $updates = array_values(array_filter($result, 'is_array'));

        return $updates;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function post(string $method, array $payload): ?Response
    {
        if (! $this->isConfigured()) {
            return null;
        }

        try {
            $response = $this->client()->post($method, $payload);
        } catch (ConnectionException $exception) {
            report($exception);

            return null;
        }

        if (! $response->successful() || $response->json('ok') !== true) {
            Log::warning('Telegram Bot API returned an error response.', [
                'method' => $method,
                'status' => $response->status(),
                'description' => $response->json('description'),
            ]);
        }

        return $response;
    }

    private function client(int $timeout = 8, bool $withRetry = true): PendingRequest
    {
        $baseUrl = rtrim((string) config('services.telegram.api_base_url', 'https://api.telegram.org'), '/');
        $token = trim((string) config('services.telegram.bot_token'));

        $request = Http::baseUrl("{$baseUrl}/bot{$token}")
            ->acceptJson()
            ->asJson()
            ->connectTimeout(4)
            ->timeout($timeout);

        if ($withRetry) {
            $request = $request->retry(
                2,
                250,
                fn (Throwable $exception): bool => $exception instanceof ConnectionException,
                throw: false,
            );
        }

        return $request;
    }
}
