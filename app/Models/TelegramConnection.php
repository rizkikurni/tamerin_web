<?php

namespace App\Models;

use Database\Factories\TelegramConnectionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $user_id
 * @property string|null $telegram_chat_id
 * @property string|null $telegram_user_id
 * @property string|null $telegram_username
 * @property string|null $telegram_first_name
 * @property string|null $default_account_id
 * @property string|null $link_token_hash
 * @property Carbon|null $link_token_expires_at
 * @property array<string, mixed>|null $pending_draft
 * @property bool $daily_reminder_enabled
 * @property Carbon|null $last_daily_reminder_sent_on
 * @property int|null $last_update_id
 * @property Carbon|null $linked_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User $user
 * @property-read FinancialAccount|null $defaultAccount
 */
#[Fillable([
    'user_id',
    'telegram_chat_id',
    'telegram_user_id',
    'telegram_username',
    'telegram_first_name',
    'default_account_id',
    'link_token_hash',
    'link_token_expires_at',
    'pending_draft',
    'daily_reminder_enabled',
    'last_daily_reminder_sent_on',
    'last_update_id',
    'linked_at',
])]
#[Hidden(['link_token_hash'])]
class TelegramConnection extends Model
{
    /** @use HasFactory<TelegramConnectionFactory> */
    use HasFactory, HasUlids;

    protected $attributes = [
        'daily_reminder_enabled' => true,
    ];

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<FinancialAccount, $this> */
    public function defaultAccount(): BelongsTo
    {
        return $this->belongsTo(FinancialAccount::class, 'default_account_id');
    }

    public function isLinked(): bool
    {
        return $this->telegram_chat_id !== null && $this->linked_at !== null;
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'link_token_expires_at' => 'datetime',
            'pending_draft' => 'array',
            'daily_reminder_enabled' => 'boolean',
            'last_daily_reminder_sent_on' => 'date',
            'last_update_id' => 'integer',
            'linked_at' => 'datetime',
        ];
    }
}
