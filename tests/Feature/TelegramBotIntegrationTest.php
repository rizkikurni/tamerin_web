<?php

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
use App\Models\UserPreference;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    $this->travelTo('2026-11-25 09:00:00');
    config()->set('inertia.ssr.enabled', false);
    config()->set('services.telegram.bot_token', '123456:test-bot-token');
    config()->set('services.telegram.bot_username', 'tamerin_finance_bot');
    config()->set('services.telegram.webhook_secret', 'test-webhook-secret');
    config()->set('services.telegram.api_base_url', 'https://api.telegram.org');

    Http::preventStrayRequests();
    Http::fake([
        'https://api.telegram.org/*' => Http::response(['ok' => true, 'result' => true]),
    ]);
});

test('webhook rejects requests without a valid secret token', function () {
    $this->postJson(route('webhooks.telegram'), ['update_id' => 1001])
        ->assertForbidden();

    $this->postJson(
        route('webhooks.telegram'),
        ['update_id' => 1001],
        ['X-Telegram-Bot-Api-Secret-Token' => 'wrong-secret'],
    )->assertForbidden();
});

test('user can generate a link token and connect their telegram account via start command', function () {
    $user = User::factory()->create(['name' => 'Rizki']);

    $response = $this->actingAs($user)
        ->post(route('telegram.link-token'))
        ->assertRedirect(route('preferences.edit'))
        ->assertSessionHas('telegram_link');

    /** @var array{token: string, connect_url: string} $linkData */
    $linkData = session('telegram_link');

    expect($linkData['connect_url'])->toStartWith('https://t.me/tamerin_finance_bot?start=');

    $this->postJson(
        route('webhooks.telegram'),
        [
            'update_id' => 2001,
            'message' => [
                'message_id' => 10,
                'from' => [
                    'id' => 555666777,
                    'username' => 'rizkikurni',
                    'first_name' => 'Rizki',
                ],
                'chat' => ['id' => 555666777],
                'text' => '/start '.$linkData['token'],
            ],
        ],
        ['X-Telegram-Bot-Api-Secret-Token' => 'test-webhook-secret'],
    )->assertSuccessful();

    $connection = TelegramConnection::query()->whereBelongsTo($user)->firstOrFail();

    expect($connection->isLinked())->toBeTrue()
        ->and($connection->telegram_chat_id)->toBe('555666777')
        ->and($connection->telegram_username)->toBe('rizkikurni')
        ->and($connection->link_token_hash)->toBeNull();

    Http::assertSent(fn (Request $request): bool => str_contains($request->url(), '/sendMessage')
        && str_contains((string) ($request['text'] ?? ''), 'Berhasil terhubung ke akun Tamerin milik Rizki'));
});

test('linked user can record quick expense and void it via inline callback', function () {
    $user = User::factory()->create();
    $account = FinancialAccount::factory()->for($user)->create([
        'name' => 'BRI',
        'opening_balance' => 1_000_000,
    ]);
    $category = Category::factory()->for($user)->create([
        'name' => 'Makanan & Minuman',
        'type' => CategoryType::Expense,
    ]);

    TelegramConnection::factory()->for($user)->create([
        'telegram_chat_id' => '777888999',
        'default_account_id' => $account->id,
    ]);

    $payload = [
        'update_id' => 3001,
        'message' => [
            'message_id' => 20,
            'from' => ['id' => 777888999, 'username' => 'rizki'],
            'chat' => ['id' => 777888999],
            'text' => '13rb warteg',
        ],
    ];

    $this->postJson(
        route('webhooks.telegram'),
        $payload,
        ['X-Telegram-Bot-Api-Secret-Token' => 'test-webhook-secret'],
    )->assertSuccessful();

    // Duplicate retry with the same update_id must be ignored idempotently.
    $this->postJson(
        route('webhooks.telegram'),
        $payload,
        ['X-Telegram-Bot-Api-Secret-Token' => 'test-webhook-secret'],
    )->assertSuccessful();

    expect(Transaction::query()->whereBelongsTo($user)->count())->toBe(1);

    $transaction = Transaction::query()->whereBelongsTo($user)->firstOrFail();

    expect($transaction->type)->toBe(TransactionType::Expense)
        ->and($transaction->amount)->toBe(13_000)
        ->and($transaction->account_id)->toBe($account->id)
        ->and($transaction->category_id)->toBe($category->id)
        ->and($transaction->note)->toBe('warteg')
        ->and($transaction->status)->toBe(TransactionStatus::Posted);

    $this->postJson(
        route('webhooks.telegram'),
        [
            'update_id' => 3002,
            'callback_query' => [
                'id' => 'cbq-1',
                'data' => "void:{$transaction->id}",
                'message' => [
                    'message_id' => 21,
                    'chat' => ['id' => 777888999],
                ],
            ],
        ],
        ['X-Telegram-Bot-Api-Secret-Token' => 'test-webhook-secret'],
    )->assertSuccessful();

    expect($transaction->fresh()?->status)->toBe(TransactionStatus::Voided);
});

test('interactive draft prompts for account and category buttons when ambiguous', function () {
    $user = User::factory()->create();
    $bri = FinancialAccount::factory()->for($user)->create(['name' => 'BRI']);
    FinancialAccount::factory()->for($user)->create(['name' => 'Cash']);
    $miscCategory = Category::factory()->for($user)->create([
        'name' => 'Lainnya',
        'type' => CategoryType::Expense,
    ]);
    Category::factory()->for($user)->create([
        'name' => 'Pendidikan',
        'type' => CategoryType::Expense,
    ]);

    $connection = TelegramConnection::factory()->for($user)->create([
        'telegram_chat_id' => '888111222',
        'default_account_id' => null,
    ]);

    $this->postJson(
        route('webhooks.telegram'),
        [
            'update_id' => 4001,
            'message' => [
                'message_id' => 30,
                'chat' => ['id' => 888111222],
                'text' => '50rb fotokopi buku',
            ],
        ],
        ['X-Telegram-Bot-Api-Secret-Token' => 'test-webhook-secret'],
    )->assertSuccessful();

    expect($connection->fresh()?->pending_draft)->not->toBeNull()
        ->and(Transaction::query()->whereBelongsTo($user)->count())->toBe(0);

    $this->postJson(
        route('webhooks.telegram'),
        [
            'update_id' => 4002,
            'callback_query' => [
                'id' => 'cbq-acc',
                'data' => "acc:{$bri->id}",
                'message' => [
                    'message_id' => 31,
                    'chat' => ['id' => 888111222],
                ],
            ],
        ],
        ['X-Telegram-Bot-Api-Secret-Token' => 'test-webhook-secret'],
    )->assertSuccessful();

    $this->postJson(
        route('webhooks.telegram'),
        [
            'update_id' => 4003,
            'callback_query' => [
                'id' => 'cbq-cat',
                'data' => "cat:{$miscCategory->id}",
                'message' => [
                    'message_id' => 31,
                    'chat' => ['id' => 888111222],
                ],
            ],
        ],
        ['X-Telegram-Bot-Api-Secret-Token' => 'test-webhook-secret'],
    )->assertSuccessful();

    $transaction = Transaction::query()->whereBelongsTo($user)->firstOrFail();

    expect($connection->fresh()?->pending_draft)->toBeNull()
        ->and($transaction->amount)->toBe(50_000)
        ->and($transaction->account_id)->toBe($bri->id)
        ->and($transaction->category_id)->toBe($miscCategory->id);

    Http::assertSent(function (Request $request): bool {
        if (! str_contains($request->url(), '/editMessageText')) {
            return false;
        }

        $text = (string) ($request['text'] ?? '');
        $markupJson = json_encode($request['reply_markup'] ?? []);

        return str_contains($text, 'Pengeluaran Tercatat')
            && is_string($markupJson)
            && ! str_contains($markupJson, 'localhost');
    });
});

test('bot supports transfer, cycle summary, quick reminder, and daily reminder command', function () {
    $user = User::factory()->create();
    UserPreference::factory()->for($user)->create([
        'financial_cycle_start_day' => 25,
    ]);
    $bri = FinancialAccount::factory()->for($user)->create([
        'name' => 'BRI',
        'opening_balance' => 2_000_000,
    ]);
    $gopay = FinancialAccount::factory()->for($user)->create([
        'name' => 'GoPay',
        'opening_balance' => 100_000,
    ]);

    $connection = TelegramConnection::factory()->for($user)->create([
        'telegram_chat_id' => '999000111',
        'daily_reminder_enabled' => true,
    ]);

    $this->postJson(
        route('webhooks.telegram'),
        [
            'update_id' => 5001,
            'message' => [
                'message_id' => 40,
                'chat' => ['id' => 999000111],
                'text' => 'tf 200rb bri ke gopay topup',
            ],
        ],
        ['X-Telegram-Bot-Api-Secret-Token' => 'test-webhook-secret'],
    )->assertSuccessful();

    $transfer = Transaction::query()->whereBelongsTo($user)->firstOrFail();
    expect($transfer->type)->toBe(TransactionType::Transfer)
        ->and($transfer->amount)->toBe(200_000)
        ->and($transfer->account_id)->toBe($bri->id)
        ->and($transfer->destination_account_id)->toBe($gopay->id);

    $this->postJson(
        route('webhooks.telegram'),
        [
            'update_id' => 5002,
            'message' => [
                'message_id' => 41,
                'chat' => ['id' => 999000111],
                'text' => '/ingat hari ini bayar listrik',
            ],
        ],
        ['X-Telegram-Bot-Api-Secret-Token' => 'test-webhook-secret'],
    )->assertSuccessful();

    $reminder = ManualReminder::query()->whereBelongsTo($user)->firstOrFail();
    expect($reminder->title)->toBe('bayar listrik')
        ->and($reminder->due_on?->toDateString())->toBe('2026-11-25')
        ->and($reminder->status)->toBe(ManualReminderStatus::Active);

    $this->postJson(
        route('webhooks.telegram'),
        [
            'update_id' => 5003,
            'message' => [
                'message_id' => 42,
                'chat' => ['id' => 999000111],
                'text' => '/ringkasan',
            ],
        ],
        ['X-Telegram-Bot-Api-Secret-Token' => 'test-webhook-secret'],
    )->assertSuccessful();

    $this->artisan('telegram:send-reminders')->assertSuccessful();

    expect($connection->fresh()?->last_daily_reminder_sent_on?->toDateString())
        ->toBe('2026-11-25');
});

test('user can update telegram preferences and disconnect from settings', function () {
    $user = User::factory()->create();
    $account = FinancialAccount::factory()->for($user)->create(['name' => 'BCA']);
    $connection = TelegramConnection::factory()->for($user)->create([
        'telegram_chat_id' => '333444555',
    ]);

    $this->actingAs($user)
        ->patch(route('telegram.update'), [
            'default_account_id' => $account->id,
            'daily_reminder_enabled' => false,
        ])
        ->assertRedirect(route('preferences.edit'));

    expect($connection->fresh()?->default_account_id)->toBe($account->id)
        ->and($connection->fresh()?->daily_reminder_enabled)->toBeFalse();

    $this->actingAs($user)
        ->delete(route('telegram.destroy'))
        ->assertRedirect(route('preferences.edit'));

    expect($connection->fresh()?->isLinked())->toBeFalse()
        ->and($connection->fresh()?->telegram_chat_id)->toBeNull();
});
