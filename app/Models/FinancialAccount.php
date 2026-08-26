<?php

namespace App\Models;

use App\Enums\FinancialAccountStatus;
use App\Enums\FinancialAccountType;
use Database\Factories\FinancialAccountFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $user_id
 * @property string $name
 * @property FinancialAccountType $type
 * @property int $opening_balance
 * @property Carbon $opened_on
 * @property FinancialAccountStatus $status
 * @property Carbon|null $archived_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'type', 'opening_balance', 'opened_on', 'status', 'archived_at'])]
class FinancialAccount extends Model
{
    /** @use HasFactory<FinancialAccountFactory> */
    use HasFactory, HasUlids;

    protected $attributes = [
        'opening_balance' => 0,
    ];

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<Transaction, $this> */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'account_id');
    }

    /** @return HasMany<Transaction, $this> */
    public function destinationTransactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'destination_account_id');
    }

    /** @return HasMany<SavingsContribution, $this> */
    public function savingsContributions(): HasMany
    {
        return $this->hasMany(SavingsContribution::class, 'account_id');
    }

    /** @return HasMany<ObligationSettlement, $this> */
    public function obligationSettlements(): HasMany
    {
        return $this->hasMany(ObligationSettlement::class, 'account_id');
    }

    /** @param Builder<FinancialAccount> $query */
    public function scopeActive(Builder $query): void
    {
        $query->where('status', FinancialAccountStatus::Active);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => FinancialAccountType::class,
            'opening_balance' => 'integer',
            'opened_on' => 'date',
            'status' => FinancialAccountStatus::class,
            'archived_at' => 'datetime',
        ];
    }
}
