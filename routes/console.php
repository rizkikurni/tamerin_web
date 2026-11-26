<?php

use App\Actions\Telegram\HandleTelegramUpdate;
use App\Actions\Telegram\SendDailyTelegramReminders;
use App\Services\TelegramBotClient;
use Illuminate\Console\Command;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function (): void {
    /** @var Command $this */
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('telegram:webhook {--url=} {--delete}', function (TelegramBotClient $botClient): int {
    /** @var Command $this */
    if (! $botClient->isConfigured()) {
        $this->error('TELEGRAM_BOT_TOKEN belum diatur di .env.');

        return Command::FAILURE;
    }

    if ((bool) $this->option('delete')) {
        $result = $botClient->deleteWebhook();
        $this->info($result['description']);

        return $result['ok'] ? Command::SUCCESS : Command::FAILURE;
    }

    $secret = config('services.telegram.webhook_secret');

    if (! is_string($secret) || trim($secret) === '') {
        $this->error('TELEGRAM_WEBHOOK_SECRET belum diatur di .env.');

        return Command::FAILURE;
    }

    $customUrl = $this->option('url');
    $webhookUrl = is_string($customUrl) && trim($customUrl) !== ''
        ? trim($customUrl)
        : route('webhooks.telegram');

    $result = $botClient->setWebhook($webhookUrl, $secret);

    if (! $result['ok']) {
        $this->error("Gagal mendaftarkan webhook: {$result['description']}");

        return Command::FAILURE;
    }

    $botClient->setMyCommands([
        ['command' => 'saldo', 'description' => 'Cek saldo semua akun aktif'],
        ['command' => 'ringkasan', 'description' => 'Ringkasan pemasukan & pengeluaran siklus ini'],
        ['command' => 'budget', 'description' => 'Cek status pemakaian budget bulanan'],
        ['command' => 'pengingat', 'description' => 'Lihat daftar pengingat aktif'],
        ['command' => 'batal', 'description' => 'Batalkan draft pencatatan transaksi'],
        ['command' => 'bantuan', 'description' => 'Panduan format catat cepat & perintah bot'],
    ]);

    $this->info("Webhook aktif di {$webhookUrl}");

    return Command::SUCCESS;
})->purpose('Register or delete the Telegram Bot webhook and command menu');

Artisan::command('telegram:poll {--once}', function (
    TelegramBotClient $botClient,
    HandleTelegramUpdate $handler,
): int {
    /** @var Command $this */
    if (! $botClient->isConfigured()) {
        $this->error('TELEGRAM_BOT_TOKEN belum diatur di .env.');

        return Command::FAILURE;
    }

    $runOnce = (bool) $this->option('once');
    $offset = (int) Cache::get('telegram:poll_offset', 0);

    if (! $runOnce) {
        $botClient->deleteWebhook();
        $this->info('Menjalankan polling lokal @'.$botClient->botUsername().' (Tekan Ctrl+C untuk berhenti)...');
    }

    do {
        $updates = $botClient->getUpdates(
            offset: $offset > 0 ? $offset : null,
            timeout: $runOnce ? 0 : 8,
        );

        foreach ($updates as $update) {
            $handler->handle($update);

            if (isset($update['update_id']) && is_numeric($update['update_id'])) {
                $offset = ((int) $update['update_id']) + 1;
                Cache::forever('telegram:poll_offset', $offset);
            }
        }

        if (! $runOnce && $updates === []) {
            usleep(300_000);
        }
    } while (! $runOnce);

    return Command::SUCCESS;
})->purpose('Poll Telegram updates locally for development without a public webhook');

Artisan::command('telegram:send-reminders', function (SendDailyTelegramReminders $action): int {
    /** @var Command $this */
    $sentCount = $action->handle();
    $this->info("Berhasil mengirim {$sentCount} ringkasan pengingat ke Telegram.");

    return Command::SUCCESS;
})->purpose('Send daily due reminder digests to linked Telegram users');

Schedule::command('telegram:send-reminders')
    ->dailyAt('07:00')
    ->timezone('Asia/Jakarta')
    ->withoutOverlapping();
