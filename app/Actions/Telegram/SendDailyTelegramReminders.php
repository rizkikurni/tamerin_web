<?php

namespace App\Actions\Telegram;

use App\Enums\ManualReminderStatus;
use App\Models\ManualReminder;
use App\Models\TelegramConnection;
use App\Models\User;
use App\Queries\Dashboard\SystemReminderQuery;
use App\Services\TelegramBotClient;
use Illuminate\Support\Carbon;

class SendDailyTelegramReminders
{
    public function __construct(
        private TelegramBotClient $botClient,
        private SystemReminderQuery $systemReminderQuery,
    ) {}

    public function handle(): int
    {
        if (! $this->botClient->isConfigured()) {
            return 0;
        }

        $today = Carbon::today();
        $sentCount = 0;

        $connections = TelegramConnection::query()
            ->whereNotNull('telegram_chat_id')
            ->whereNotNull('linked_at')
            ->where('daily_reminder_enabled', true)
            ->where(function ($query) use ($today): void {
                $query->whereNull('last_daily_reminder_sent_on')
                    ->orWhereDate('last_daily_reminder_sent_on', '<', $today->toDateString());
            })
            ->with('user.preference')
            ->get();

        foreach ($connections as $connection) {
            /** @var User|null $user */
            $user = $connection->user;
            $chatId = $connection->telegram_chat_id;

            if ($user === null || $chatId === null) {
                continue;
            }

            $message = $this->buildDigestMessage($user, $today);

            if ($message === null) {
                continue;
            }

            if ($this->botClient->sendMessage($chatId, $message)) {
                $connection->update([
                    'last_daily_reminder_sent_on' => $today->toDateString(),
                ]);
                $sentCount++;
            }
        }

        return $sentCount;
    }

    private function buildDigestMessage(User $user, Carbon $today): ?string
    {
        $manualReminders = ManualReminder::query()
            ->whereBelongsTo($user)
            ->where('status', ManualReminderStatus::Active)
            ->whereNotNull('due_on')
            ->whereDate('due_on', '<=', $today->toDateString())
            ->orderBy('due_on')
            ->limit(5)
            ->get();

        $systemReminders = array_values(array_filter(
            $this->systemReminderQuery->get($user, $today, 5),
            fn (array $reminder): bool => in_array($reminder['priority'], ['high', 'medium'], true),
        ));

        if ($manualReminders->isEmpty() && $systemReminders === []) {
            return null;
        }

        $lines = [
            '🔔 <b>Pengingat Keuangan Hari Ini</b>',
            '',
        ];

        if ($manualReminders->isNotEmpty()) {
            $lines[] = '<b>Pengingat Pribadi:</b>';

            foreach ($manualReminders as $reminder) {
                $dueLabel = $reminder->due_on !== null && $reminder->due_on->lt($today)
                    ? 'Terlambat ('.$reminder->due_on->format('d M Y').')'
                    : 'Hari ini';
                $lines[] = '• '.e($reminder->title).' — <i>'.$dueLabel.'</i>';
            }

            $lines[] = '';
        }

        if ($systemReminders !== []) {
            $lines[] = '<b>Perhatian Sistem:</b>';

            foreach ($systemReminders as $item) {
                $icon = $item['priority'] === 'high' ? '🔴' : '🟡';
                $lines[] = "{$icon} <b>".e($item['title']).'</b>: '.e($item['message']);
            }

            $lines[] = '';
        }

        $lines[] = 'Ketik /pengingat untuk menindaklanjuti langsung dari chat.';

        return implode("\n", $lines);
    }
}
