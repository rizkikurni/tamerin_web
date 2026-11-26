<?php

namespace App\Actions\Telegram;

use App\Actions\ManualReminders\CompleteManualReminder;
use App\Actions\ManualReminders\CreateManualReminder;
use App\Actions\ManualReminders\DismissManualReminder;
use App\Actions\Transactions\RecordTransaction;
use App\Actions\Transactions\VoidTransaction;
use App\Enums\BudgetUsageStatus;
use App\Enums\CategoryType;
use App\Enums\ManualReminderStatus;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\Category;
use App\Models\FinancialAccount;
use App\Models\ManualReminder;
use App\Models\TelegramConnection;
use App\Models\Transaction;
use App\Models\User;
use App\Queries\Budgets\BudgetUsageQuery;
use App\Queries\Dashboard\DashboardSummaryQuery;
use App\Queries\Dashboard\SystemReminderQuery;
use App\Services\TelegramBotClient;
use App\Services\TelegramMessageParser;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * @phpstan-import-type InlineKeyboard from TelegramBotClient
 */
class HandleTelegramUpdate
{
    public function __construct(
        private TelegramBotClient $botClient,
        private TelegramMessageParser $messageParser,
        private RecordTransaction $recordTransaction,
        private VoidTransaction $voidTransaction,
        private CreateManualReminder $createManualReminder,
        private CompleteManualReminder $completeManualReminder,
        private DismissManualReminder $dismissManualReminder,
        private DashboardSummaryQuery $dashboardSummaryQuery,
        private BudgetUsageQuery $budgetUsageQuery,
        private SystemReminderQuery $systemReminderQuery,
        private DisconnectTelegram $disconnectTelegram,
    ) {}

    /**
     * @param  array<string, mixed>  $update
     */
    public function handle(array $update): void
    {
        $updateId = isset($update['update_id']) && is_numeric($update['update_id'])
            ? (int) $update['update_id']
            : 0;

        if (isset($update['callback_query']) && is_array($update['callback_query'])) {
            $this->handleCallbackQuery($updateId, $update['callback_query']);

            return;
        }

        if (isset($update['message']) && is_array($update['message'])) {
            $this->handleMessage($updateId, $update['message']);
        }
    }

    /**
     * @param  array<string, mixed>  $message
     */
    private function handleMessage(int $updateId, array $message): void
    {
        $chat = isset($message['chat']) && is_array($message['chat']) ? $message['chat'] : null;
        $chatId = isset($chat['id']) && (is_int($chat['id']) || is_string($chat['id']))
            ? (string) $chat['id']
            : null;

        if ($chatId === null) {
            return;
        }

        $text = isset($message['text']) && is_string($message['text'])
            ? trim($message['text'])
            : '';

        if ($text === '') {
            return;
        }

        $from = isset($message['from']) && is_array($message['from']) ? $message['from'] : [];

        if (preg_match('/^\/start(?:@\S+)?\s+([A-Za-z0-9_-]{16,64})$/', $text, $matches) === 1) {
            $this->linkAccountWithToken($chatId, $from, $matches[1], $updateId);

            return;
        }

        $connection = TelegramConnection::query()
            ->where('telegram_chat_id', $chatId)
            ->whereNotNull('linked_at')
            ->with('user.preference')
            ->first();

        if ($connection === null) {
            $this->botClient->sendMessage(
                $chatId,
                "👋 <b>Halo! Akun Telegram ini belum terhubung ke Tamerin.</b>\n\n"
                .'Buka aplikasi web Tamerin → <b>Pengaturan → Preferensi → Integrasi Telegram</b>, lalu klik tombol <b>Hubungkan Telegram</b>.',
            );

            return;
        }

        if ($updateId > 0 && $connection->last_update_id !== null && $updateId <= $connection->last_update_id) {
            return;
        }

        if ($updateId > 0) {
            $connection->update(['last_update_id' => $updateId]);
        }

        $user = $connection->user;
        $command = $this->extractCommand($text);

        if ($command !== null) {
            $this->dispatchCommand($connection, $user, $chatId, $command, $text);

            return;
        }

        $this->handleQuickTransactionMessage($connection, $user, $chatId, $text, $updateId);
    }

    /**
     * @param  array<string, mixed>  $from
     */
    private function linkAccountWithToken(
        string $chatId,
        array $from,
        string $rawToken,
        int $updateId,
    ): void {
        $tokenHash = hash('sha256', $rawToken);

        $connection = TelegramConnection::query()
            ->where('link_token_hash', $tokenHash)
            ->where('link_token_expires_at', '>', now())
            ->with('user')
            ->first();

        if ($connection === null) {
            $this->botClient->sendMessage(
                $chatId,
                "⚠️ <b>Kode tautan tidak valid atau sudah kedaluwarsa.</b>\n"
                .'Silakan buat link baru di menu <b>Pengaturan → Preferensi</b> pada web Tamerin.',
            );

            return;
        }

        $telegramUserId = isset($from['id']) && (is_int($from['id']) || is_string($from['id']))
            ? (string) $from['id']
            : null;
        $username = isset($from['username']) && is_string($from['username'])
            ? $from['username']
            : null;
        $firstName = isset($from['first_name']) && is_string($from['first_name'])
            ? $from['first_name']
            : null;

        DB::transaction(function () use ($connection, $chatId, $telegramUserId, $username, $firstName, $updateId): void {
            TelegramConnection::query()
                ->where('telegram_chat_id', $chatId)
                ->whereKeyNot($connection->id)
                ->update([
                    'telegram_chat_id' => null,
                    'telegram_user_id' => null,
                    'telegram_username' => null,
                    'telegram_first_name' => null,
                    'linked_at' => null,
                    'pending_draft' => null,
                ]);

            $connection->update([
                'telegram_chat_id' => $chatId,
                'telegram_user_id' => $telegramUserId,
                'telegram_username' => $username,
                'telegram_first_name' => $firstName,
                'link_token_hash' => null,
                'link_token_expires_at' => null,
                'pending_draft' => null,
                'last_update_id' => $updateId > 0 ? $updateId : $connection->last_update_id,
                'linked_at' => now(),
            ]);
        });

        $this->botClient->sendMessage(
            $chatId,
            '✅ <b>Berhasil terhubung ke akun Tamerin milik '.e($connection->user->name)."!</b>\n\n"
            .$this->helpMessageText(),
        );
    }

    private function dispatchCommand(
        TelegramConnection $connection,
        User $user,
        string $chatId,
        string $command,
        string $fullText,
    ): void {
        match ($command) {
            '/start', '/bantuan', '/help' => $this->botClient->sendMessage($chatId, $this->helpMessageText()),
            '/saldo' => $this->sendAccountBalances($user, $chatId),
            '/ringkasan' => $this->sendCycleSummary($user, $chatId),
            '/budget' => $this->sendBudgetStatus($user, $chatId),
            '/pengingat' => $this->sendActiveReminders($user, $chatId),
            '/ingat' => $this->createQuickReminder($user, $chatId, $fullText),
            '/batal' => $this->cancelPendingDraft($connection, $chatId),
            '/putus', '/unlink' => $this->unlinkFromBot($user, $chatId),
            default => $this->botClient->sendMessage(
                $chatId,
                'Perintah tidak dikenali. Ketik /bantuan untuk melihat daftar perintah dan contoh pencatatan cepat.',
            ),
        };
    }

    private function handleQuickTransactionMessage(
        TelegramConnection $connection,
        User $user,
        string $chatId,
        string $text,
        int $updateId,
    ): void {
        $accounts = FinancialAccount::query()
            ->whereBelongsTo($user)
            ->active()
            ->whereNull('archived_at')
            ->orderBy('name')
            ->get();

        if ($accounts->isEmpty()) {
            $this->botClient->sendMessage(
                $chatId,
                '⚠️ Anda belum memiliki Akun Keuangan aktif. Buat akun terlebih dahulu di web Tamerin.',
            );

            return;
        }

        $categories = Category::query()
            ->whereBelongsTo($user)
            ->active()
            ->orderBy('name')
            ->get();

        $parsed = $this->messageParser->parseTransaction(
            $text,
            $accounts,
            $categories,
            $connection->default_account_id,
        );

        if ($parsed === null) {
            $this->botClient->sendMessage(
                $chatId,
                "💡 Format belum dikenali.\n\n"
                ."<b>Contoh cepat:</b>\n"
                ."• <code>13rb warteg</code>\n"
                ."• <code>- 25k bensin @bri</code>\n"
                ."• <code>+ 5jt gaji @bca</code>\n"
                ."• <code>tf 200rb bri ke gopay</code>\n\n"
                .'Ketik /bantuan untuk panduan lengkap.',
            );

            return;
        }

        $draft = [
            'type' => $parsed['type']->value,
            'amount' => $parsed['amount'],
            'note' => $parsed['note'],
            'account_id' => $parsed['account_id'],
            'destination_account_id' => $parsed['destination_account_id'],
            'category_id' => $parsed['category_id'],
            'update_id' => $updateId > 0 ? (string) $updateId : uniqid('tg_', true),
        ];

        $this->advanceOrCommitDraft($connection, $user, $chatId, null, $draft, $accounts, $categories);
    }

    /**
     * @param  array<string, mixed>  $draft
     * @param  Collection<int, FinancialAccount>  $accounts
     * @param  Collection<int, Category>  $categories
     */
    private function advanceOrCommitDraft(
        TelegramConnection $connection,
        User $user,
        string $chatId,
        ?int $editMessageId,
        array $draft,
        Collection $accounts,
        Collection $categories,
    ): void {
        $type = TransactionType::tryFrom((string) ($draft['type'] ?? 'expense')) ?? TransactionType::Expense;
        $amount = (int) ($draft['amount'] ?? 0);
        $note = isset($draft['note']) && is_string($draft['note']) ? $draft['note'] : null;
        $accountId = isset($draft['account_id']) && is_string($draft['account_id']) ? $draft['account_id'] : null;
        $destinationId = isset($draft['destination_account_id']) && is_string($draft['destination_account_id'])
            ? $draft['destination_account_id']
            : null;
        $categoryId = isset($draft['category_id']) && is_string($draft['category_id']) ? $draft['category_id'] : null;

        if ($accountId === null) {
            $connection->update(['pending_draft' => $draft]);
            $prompt = $this->draftHeaderText($type, $amount, $note)."\n\nPilih <b>Akun Keuangan</b>:";
            $keyboard = $this->buildAccountKeyboard($accounts, 'acc');
            $this->replyOrEdit($chatId, $editMessageId, $prompt, $keyboard);

            return;
        }

        if ($type === TransactionType::Transfer && $destinationId === null) {
            $eligibleDestinations = $accounts
                ->filter(fn (FinancialAccount $account): bool => $account->id !== $accountId)
                ->values();

            if ($eligibleDestinations->isEmpty()) {
                $connection->update(['pending_draft' => null]);
                $this->replyOrEdit(
                    $chatId,
                    $editMessageId,
                    '⚠️ Transfer membutuhkan minimal 2 Akun Keuangan aktif.',
                );

                return;
            }

            if ($eligibleDestinations->count() === 1) {
                /** @var FinancialAccount $onlyDestination */
                $onlyDestination = $eligibleDestinations->first();
                $draft['destination_account_id'] = $onlyDestination->id;
                $destinationId = $onlyDestination->id;
            } else {
                $connection->update(['pending_draft' => $draft]);
                $originName = $accounts->firstWhere('id', $accountId)->name ?? 'Akun Asal';
                $prompt = $this->draftHeaderText($type, $amount, $note)
                    ."\nAkun Asal: <b>".e($originName)."</b>\n\nPilih <b>Akun Tujuan</b>:";
                $keyboard = $this->buildAccountKeyboard($eligibleDestinations, 'dst');
                $this->replyOrEdit($chatId, $editMessageId, $prompt, $keyboard);

                return;
            }
        }

        if ($type !== TransactionType::Transfer && $categoryId === null) {
            $expectedCategoryType = $type === TransactionType::Income
                ? CategoryType::Income
                : CategoryType::Expense;
            $eligibleCategories = $categories
                ->filter(fn (Category $category): bool => $category->type === $expectedCategoryType)
                ->values();

            if ($eligibleCategories->isEmpty()) {
                $connection->update(['pending_draft' => null]);
                $this->replyOrEdit(
                    $chatId,
                    $editMessageId,
                    '⚠️ Anda belum memiliki Kategori aktif untuk jenis transaksi ini.',
                );

                return;
            }

            $connection->update(['pending_draft' => $draft]);
            $accountName = $accounts->firstWhere('id', $accountId)->name ?? 'Akun';
            $prompt = $this->draftHeaderText($type, $amount, $note)
                ."\nAkun: <b>".e($accountName)."</b>\n\nPilih <b>Kategori</b>:";
            $keyboard = $this->buildCategoryKeyboard($eligibleCategories);
            $this->replyOrEdit($chatId, $editMessageId, $prompt, $keyboard);

            return;
        }

        try {
            $transaction = $this->recordTransaction->handle($user, [
                'type' => $type->value,
                'amount' => $amount,
                'transacted_on' => Carbon::today()->toDateString(),
                'account_id' => $accountId,
                'destination_account_id' => $type === TransactionType::Transfer ? $destinationId : null,
                'category_id' => $type === TransactionType::Transfer ? null : $categoryId,
                'note' => $note,
                'idempotency_key' => 'tg:'.substr((string) ($draft['update_id'] ?? uniqid()), 0, 56),
            ]);
        } catch (ValidationException $exception) {
            $connection->update(['pending_draft' => null]);
            $firstError = (string) collect($exception->errors())->flatten()->first();
            $this->replyOrEdit($chatId, $editMessageId, '⚠️ '.e($firstError));

            return;
        }

        $connection->update(['pending_draft' => null]);
        $transaction->load(['account', 'destinationAccount', 'category']);

        $receipt = $this->buildTransactionReceipt($user, $transaction);
        $actionRow = [
            [
                'text' => '↩️ Batalkan Transaksi',
                'callback_data' => "void:{$transaction->id}",
            ],
        ];
        $detailUrl = route('transactions.show', $transaction);

        if ($this->isPublicHttpsUrl($detailUrl)) {
            $actionRow[] = [
                'text' => '🔗 Detail Web',
                'url' => $detailUrl,
            ];
        }

        $keyboard = [$actionRow];

        $this->replyOrEdit($chatId, $editMessageId, $receipt, $keyboard);
    }

    /**
     * @param  array<string, mixed>  $callbackQuery
     */
    private function handleCallbackQuery(int $updateId, array $callbackQuery): void
    {
        $callbackId = isset($callbackQuery['id']) && is_string($callbackQuery['id'])
            ? $callbackQuery['id']
            : null;
        $data = isset($callbackQuery['data']) && is_string($callbackQuery['data'])
            ? $callbackQuery['data']
            : '';
        $message = isset($callbackQuery['message']) && is_array($callbackQuery['message'])
            ? $callbackQuery['message']
            : [];
        $chat = isset($message['chat']) && is_array($message['chat']) ? $message['chat'] : [];
        $chatId = isset($chat['id']) && (is_int($chat['id']) || is_string($chat['id']))
            ? (string) $chat['id']
            : null;
        $messageId = isset($message['message_id']) && is_numeric($message['message_id'])
            ? (int) $message['message_id']
            : null;

        if ($callbackId === null || $chatId === null || $data === '') {
            return;
        }

        $connection = TelegramConnection::query()
            ->where('telegram_chat_id', $chatId)
            ->whereNotNull('linked_at')
            ->with('user.preference')
            ->first();

        if ($connection === null) {
            $this->botClient->answerCallbackQuery($callbackId, 'Akun Telegram belum terhubung.');

            return;
        }

        if ($updateId > 0) {
            $connection->update(['last_update_id' => $updateId]);
        }

        $user = $connection->user;

        if ($data === 'draft:cancel') {
            $connection->update(['pending_draft' => null]);
            $this->botClient->answerCallbackQuery($callbackId, 'Pencatatan dibatalkan.');
            $this->replyOrEdit($chatId, $messageId, '❌ Pencatatan transaksi dibatalkan.');

            return;
        }

        if (str_starts_with($data, 'acc:') || str_starts_with($data, 'dst:') || str_starts_with($data, 'cat:')) {
            $this->handleDraftSelectionCallback($connection, $user, $callbackId, $chatId, $messageId, $data);

            return;
        }

        if (str_starts_with($data, 'void:')) {
            $transactionId = substr($data, 5);
            $this->handleVoidCallback($user, $callbackId, $chatId, $messageId, $transactionId, $updateId);

            return;
        }

        if (str_starts_with($data, 'rdone:') || str_starts_with($data, 'rskip:')) {
            $action = str_starts_with($data, 'rdone:') ? 'done' : 'skip';
            $reminderId = substr($data, 6);
            $this->handleReminderCallback($user, $callbackId, $chatId, $messageId, $reminderId, $action);
        }
    }

    private function handleDraftSelectionCallback(
        TelegramConnection $connection,
        User $user,
        string $callbackId,
        string $chatId,
        ?int $messageId,
        string $data,
    ): void {
        $draft = $connection->pending_draft;

        if (! is_array($draft)) {
            $this->botClient->answerCallbackQuery($callbackId, 'Draft ini sudah selesai diproses.');
            if ($messageId !== null) {
                $this->botClient->editMessageText(
                    $chatId,
                    $messageId,
                    'ℹ️ <i>Draft transaksi ini sudah selesai diproses atau kedaluwarsa.</i>',
                );
            }

            return;
        }

        [$prefix, $selectedId] = explode(':', $data, 2);

        if ($prefix === 'acc') {
            $draft['account_id'] = $selectedId;
        } elseif ($prefix === 'dst') {
            $draft['destination_account_id'] = $selectedId;
        } elseif ($prefix === 'cat') {
            $draft['category_id'] = $selectedId;
        }

        $accounts = FinancialAccount::query()
            ->whereBelongsTo($user)
            ->active()
            ->whereNull('archived_at')
            ->orderBy('name')
            ->get();

        $categories = Category::query()
            ->whereBelongsTo($user)
            ->active()
            ->orderBy('name')
            ->get();

        $this->botClient->answerCallbackQuery($callbackId);
        $this->advanceOrCommitDraft($connection, $user, $chatId, $messageId, $draft, $accounts, $categories);
    }

    private function handleVoidCallback(
        User $user,
        string $callbackId,
        string $chatId,
        ?int $messageId,
        string $transactionId,
        int $updateId,
    ): void {
        $transaction = Transaction::query()
            ->whereBelongsTo($user)
            ->whereKey($transactionId)
            ->with(['account', 'destinationAccount', 'category'])
            ->first();

        if ($transaction === null) {
            $this->botClient->answerCallbackQuery($callbackId, 'Transaksi tidak ditemukan.');

            return;
        }

        if ($transaction->obligationSettlement()->exists()) {
            $this->botClient->answerCallbackQuery(
                $callbackId,
                'Transaksi pelunasan utang/piutang tidak dapat dibatalkan langsung.',
            );

            return;
        }

        if ($transaction->status === TransactionStatus::Voided) {
            $this->botClient->answerCallbackQuery($callbackId, 'Transaksi ini sudah dibatalkan.');

            return;
        }

        $this->voidTransaction->handle(
            $transaction,
            $user,
            'Dibatalkan melalui Telegram Bot',
            'tg-void:'.($updateId > 0 ? $updateId : uniqid()),
        );

        $this->botClient->answerCallbackQuery($callbackId, 'Transaksi berhasil dibatalkan.');
        $this->replyOrEdit(
            $chatId,
            $messageId,
            "🚫 <b>Transaksi Dibatalkan</b>\n"
            .'Nominal: <s>'.$this->formatRupiah($transaction->amount)."</s>\n"
            .'Catatan: '.e($transaction->note ?? 'Tanpa catatan')."\n"
            .'<i>Saldo akun sudah dikembalikan otomatis.</i>',
        );
    }

    private function handleReminderCallback(
        User $user,
        string $callbackId,
        string $chatId,
        ?int $messageId,
        string $reminderId,
        string $action,
    ): void {
        $reminder = ManualReminder::query()
            ->whereBelongsTo($user)
            ->whereKey($reminderId)
            ->first();

        if ($reminder === null) {
            $this->botClient->answerCallbackQuery($callbackId, 'Pengingat tidak ditemukan.');

            return;
        }

        if ($action === 'done') {
            $this->completeManualReminder->handle($reminder);
            $this->botClient->answerCallbackQuery($callbackId, 'Pengingat ditandai selesai!');
            $this->replyOrEdit(
                $chatId,
                $messageId,
                '✅ <b>Pengingat selesai:</b> '.e($reminder->title),
            );

            return;
        }

        $this->dismissManualReminder->handle($reminder);
        $this->botClient->answerCallbackQuery($callbackId, 'Pengingat diabaikan.');
        $this->replyOrEdit(
            $chatId,
            $messageId,
            '⏭️ <b>Pengingat diabaikan:</b> '.e($reminder->title),
        );
    }

    private function sendAccountBalances(User $user, string $chatId): void
    {
        $period = $user->currentFinancialPeriod();
        $data = $this->dashboardSummaryQuery->handle($user, $period);

        $lines = [
            '🏦 <b>Saldo Akun Keuangan Aktif</b>',
            '',
        ];

        if ($data['accounts'] === []) {
            $lines[] = '<i>Belum ada akun keuangan aktif.</i>';
        } else {
            foreach ($data['accounts'] as $account) {
                $lines[] = '• <b>'.e($account['name']).'</b>: '.$this->formatRupiah($account['balance']);
            }
        }

        $lines[] = '';
        $lines[] = '💰 <b>Total Saldo: '.$this->formatRupiah($data['summary']['totalBalance']).'</b>';

        $this->botClient->sendMessage($chatId, implode("\n", $lines));
    }

    private function sendCycleSummary(User $user, string $chatId): void
    {
        $period = $user->currentFinancialPeriod();
        $range = $user->financialCycleRange($period);
        $data = $this->dashboardSummaryQuery->handle($user, $period);
        $summary = $data['summary'];
        $netPrefix = $summary['netCashFlow'] >= 0 ? '+' : '-';

        $text = implode("\n", [
            '📊 <b>Ringkasan Siklus Berjalan</b>',
            '🗓️ Periode: <b>'.e($range['label']).'</b>',
            '',
            '📈 Pemasukan: <b>'.$this->formatRupiah($summary['income']).'</b>',
            '📉 Pengeluaran: <b>'.$this->formatRupiah($summary['expense']).'</b>',
            '⚖️ Arus Kas Bersih: <b>'.$netPrefix.$this->formatRupiah(abs($summary['netCashFlow'])).'</b>',
            '',
            '💰 Total Saldo Kas: <b>'.$this->formatRupiah($summary['totalBalance']).'</b>',
        ]);

        $this->botClient->sendMessage($chatId, $text);
    }

    private function sendBudgetStatus(User $user, string $chatId): void
    {
        $period = $user->currentFinancialPeriod();
        $range = $user->financialCycleRange($period);
        $budgets = $this->budgetUsageQuery->reportItems($user, $period);

        if ($budgets === []) {
            $this->botClient->sendMessage(
                $chatId,
                '🎯 <b>Budget Siklus '.e($range['label'])."</b>\n\n"
                .'<i>Belum ada budget bulanan yang diatur pada siklus ini.</i>',
            );

            return;
        }

        $lines = [
            '🎯 <b>Status Budget ('.e($range['label']).')</b>',
            '',
        ];

        foreach ($budgets as $budget) {
            $icon = match ($budget['status']) {
                BudgetUsageStatus::Over => '🔴',
                BudgetUsageStatus::Warning => '🟡',
                default => '🟢',
            };
            $remainingLabel = $budget['remaining'] >= 0
                ? 'Sisa '.$this->formatRupiah($budget['remaining'])
                : 'Lewat '.$this->formatRupiah(abs($budget['remaining']));

            $lines[] = "{$icon} <b>".e($budget['category']['name'])."</b> ({$budget['percentage']}%)";
            $lines[] = '   '.$this->formatRupiah($budget['spent']).' / '.$this->formatRupiah($budget['amount'])." • {$remainingLabel}";
        }

        $this->botClient->sendMessage($chatId, implode("\n", $lines));
    }

    private function sendActiveReminders(User $user, string $chatId): void
    {
        $today = Carbon::today();
        $manualReminders = ManualReminder::query()
            ->whereBelongsTo($user)
            ->where('status', ManualReminderStatus::Active)
            ->orderByRaw('due_on IS NULL, due_on ASC')
            ->limit(5)
            ->get();

        $systemReminders = $this->systemReminderQuery->get($user, $today, 4);

        if ($manualReminders->isEmpty() && $systemReminders === []) {
            $this->botClient->sendMessage(
                $chatId,
                "🔔 <b>Tidak ada pengingat aktif saat ini.</b>\n"
                .'Tambah cepat dengan mengetik: <code>/ingat besok bayar wifi</code>',
            );

            return;
        }

        foreach ($manualReminders as $reminder) {
            $dueLabel = $reminder->due_on !== null
                ? '🗓️ '.$reminder->due_on->format('d M Y')
                : '📌 Tanpa batas tanggal';

            $this->botClient->sendMessage(
                $chatId,
                '🔔 <b>'.e($reminder->title)."</b>\n<i>{$dueLabel}</i>",
                [
                    [
                        ['text' => '✅ Selesai', 'callback_data' => "rdone:{$reminder->id}"],
                        ['text' => '⏭️ Abaikan', 'callback_data' => "rskip:{$reminder->id}"],
                    ],
                ],
            );
        }

        if ($systemReminders !== []) {
            $lines = ['⚡ <b>Perhatian Otomatis Sistem</b>', ''];

            foreach ($systemReminders as $item) {
                $lines[] = '• <b>'.e($item['title']).'</b>: '.e($item['message']);
            }

            $this->botClient->sendMessage($chatId, implode("\n", $lines));
        }
    }

    private function createQuickReminder(User $user, string $chatId, string $fullText): void
    {
        $parsed = $this->messageParser->parseReminder($fullText, Carbon::today());

        if ($parsed === null) {
            $this->botClient->sendMessage(
                $chatId,
                "💡 Contoh membuat pengingat:\n"
                ."• <code>/ingat besok bayar internet</code>\n"
                ."• <code>/ingat hari ini cek tagihan listrik</code>\n"
                .'• <code>/ingat 2026-12-01 bayar kos</code>',
            );

            return;
        }

        $reminder = $this->createManualReminder->handle($user, [
            'title' => $parsed['title'],
            'due_on' => $parsed['due_on'],
            'note' => 'Dibuat melalui Telegram Bot',
        ]);

        $dueLabel = $reminder->due_on !== null
            ? $reminder->due_on->format('d M Y')
            : 'Tanpa tanggal jatuh tempo';

        $this->botClient->sendMessage(
            $chatId,
            "✅ <b>Pengingat Tersimpan</b>\n"
            .'Judul: <b>'.e($reminder->title)."</b>\n"
            ."Tanggal: {$dueLabel}",
            [
                [
                    ['text' => '✅ Tandai Selesai', 'callback_data' => "rdone:{$reminder->id}"],
                ],
            ],
        );
    }

    private function cancelPendingDraft(TelegramConnection $connection, string $chatId): void
    {
        $connection->update(['pending_draft' => null]);
        $this->botClient->sendMessage($chatId, '✅ Draft pencatatan yang tertunda sudah dibersihkan.');
    }

    private function unlinkFromBot(User $user, string $chatId): void
    {
        $this->disconnectTelegram->handle($user);
        $this->botClient->sendMessage(
            $chatId,
            '🔌 Sambungan akun Telegram dengan Tamerin telah diputuskan. Anda dapat menghubungkannya kembali kapan saja dari menu Pengaturan Web.',
        );
    }

    private function buildTransactionReceipt(User $user, Transaction $transaction): string
    {
        $typeLabel = match ($transaction->type) {
            TransactionType::Income => '✅ <b>Pemasukan Tercatat</b>',
            TransactionType::Expense => '✅ <b>Pengeluaran Tercatat</b>',
            TransactionType::Transfer => '✅ <b>Transfer Tercatat</b>',
        };

        $amountPrefix = match ($transaction->type) {
            TransactionType::Income => '+',
            TransactionType::Expense => '-',
            TransactionType::Transfer => '',
        };

        $lines = [
            $typeLabel,
            'Nominal: <b>'.$amountPrefix.$this->formatRupiah($transaction->amount).'</b>',
        ];

        if ($transaction->type === TransactionType::Transfer) {
            $origin = $transaction->account->name ?? '-';
            $destination = $transaction->destinationAccount->name ?? '-';
            $lines[] = 'Alur: <b>'.e($origin).' → '.e($destination).'</b>';
        } else {
            $lines[] = 'Akun: <b>'.e($transaction->account->name ?? '-').'</b>';
            $lines[] = 'Kategori: <b>'.e($transaction->category->name ?? '-').'</b>';
        }

        if ($transaction->note !== null && $transaction->note !== '') {
            $lines[] = 'Catatan: '.e($transaction->note);
        }

        if ($transaction->type === TransactionType::Expense && $transaction->category_id !== null) {
            $period = $user->currentFinancialPeriod($transaction->transacted_on);
            $budgetItems = $this->budgetUsageQuery->reportItems($user, $period, $transaction->category_id);

            if (isset($budgetItems[0])) {
                $budget = $budgetItems[0];
                $remainingText = $budget['remaining'] >= 0
                    ? 'Sisa '.$this->formatRupiah($budget['remaining'])
                    : 'Lewat '.$this->formatRupiah(abs($budget['remaining']));
                $lines[] = '';
                $lines[] = "🎯 Budget {$budget['percentage']}% • <b>{$remainingText}</b>";
            }
        }

        return implode("\n", $lines);
    }

    /**
     * @param  Collection<int, FinancialAccount>  $accounts
     * @return InlineKeyboard
     */
    private function buildAccountKeyboard(Collection $accounts, string $prefix): array
    {
        $buttons = $accounts
            ->take(10)
            ->map(fn (FinancialAccount $account): array => [
                'text' => '🏦 '.$account->name,
                'callback_data' => "{$prefix}:{$account->id}",
            ])
            ->values()
            ->all();

        $rows = array_chunk($buttons, 2);
        $rows[] = [['text' => '❌ Batal', 'callback_data' => 'draft:cancel']];

        return $rows;
    }

    /**
     * @param  Collection<int, Category>  $categories
     * @return InlineKeyboard
     */
    private function buildCategoryKeyboard(Collection $categories): array
    {
        $buttons = $categories
            ->take(12)
            ->map(fn (Category $category): array => [
                'text' => '🏷️ '.$category->name,
                'callback_data' => "cat:{$category->id}",
            ])
            ->values()
            ->all();

        $rows = array_chunk($buttons, 2);
        $rows[] = [['text' => '❌ Batal', 'callback_data' => 'draft:cancel']];

        return $rows;
    }

    private function draftHeaderText(TransactionType $type, int $amount, ?string $note): string
    {
        $label = match ($type) {
            TransactionType::Income => 'Pemasukan',
            TransactionType::Expense => 'Pengeluaran',
            TransactionType::Transfer => 'Transfer',
        };

        $lines = [
            "📝 <b>Draft {$label}: ".$this->formatRupiah($amount).'</b>',
        ];

        if ($note !== null && $note !== '') {
            $lines[] = 'Catatan: '.e($note);
        }

        return implode("\n", $lines);
    }

    /**
     * @param  InlineKeyboard|null  $keyboard
     */
    private function replyOrEdit(
        string $chatId,
        ?int $editMessageId,
        string $text,
        ?array $keyboard = null,
    ): void {
        if ($editMessageId !== null && $this->botClient->editMessageText($chatId, $editMessageId, $text, $keyboard)) {
            return;
        }

        $this->botClient->sendMessage($chatId, $text, $keyboard);
    }

    private function isPublicHttpsUrl(string $url): bool
    {
        if (! str_starts_with($url, 'https://')) {
            return false;
        }

        $host = parse_url($url, PHP_URL_HOST);

        if (! is_string($host) || $host === '') {
            return false;
        }

        $lowerHost = strtolower($host);

        return ! in_array($lowerHost, ['localhost', '127.0.0.1', '::1'], true)
            && ! str_ends_with($lowerHost, '.local')
            && ! str_ends_with($lowerHost, '.test');
    }

    private function extractCommand(string $text): ?string
    {
        if (preg_match('/^(\/[a-z_]+)(?:@\S+)?(?:\s|$)/i', $text, $matches) !== 1) {
            return null;
        }

        return strtolower($matches[1]);
    }

    private function helpMessageText(): string
    {
        return implode("\n", [
            '🤖 <b>Panduan Cepat Bot Tamerin</b>',
            '',
            '<b>1. Catat Transaksi Langsung (Ketik Chat):</b>',
            '• Pengeluaran: <code>13rb warteg</code> atau <code>- 25k bensin @bri</code>',
            '• Pemasukan: <code>+ 5jt gaji @bca</code> atau <code>masuk 500rb bonus</code>',
            '• Transfer: <code>tf 200rb bri ke gopay</code>',
            '<i>(Jika akun/kategori belum disebut, bot akan menampilkan tombol pilihan)</i>',
            '',
            '<b>2. Perintah Cek & Pengingat:</b>',
            '• /saldo — Cek saldo semua akun aktif',
            '• /ringkasan — Ringkasan arus kas siklus berjalan',
            '• /budget — Status pemakaian budget kategori',
            '• /pengingat — Daftar pengingat aktif',
            '• <code>/ingat besok bayar wifi</code> — Buat pengingat baru',
            '• /batal — Batalkan draft transaksi',
        ]);
    }

    private function formatRupiah(int $amount): string
    {
        return 'Rp '.number_format($amount, 0, ',', '.');
    }
}
