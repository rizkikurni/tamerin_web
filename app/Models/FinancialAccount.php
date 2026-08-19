<?php

namespace App\Models;

use App\Enums\FinancialAccountStatus;
use App\Enums\FinancialAccountType;
use Database\Factories\FinancialAccountFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
