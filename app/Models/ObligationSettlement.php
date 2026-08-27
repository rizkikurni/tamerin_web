<?php

namespace App\Models;

use Database\Factories\ObligationSettlementFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $user_id
 * @property string $obligation_id
 * @property string $account_id
 * @property string $transaction_id
 * @property int $amount
 * @property Carbon $settled_on
 * @property string|null $note
 * @property string|null $idempotency_key
 */
#[Fillable(['obligation_id', 'account_id', 'transaction_id', 'amount', 'settled_on', 'note', 'idempotency_key'])]
class ObligationSettlement extends Model
{
    /** @use HasFactory<ObligationSettlementFactory> */
    use HasFactory, HasUlids;

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<Obligation, $this> */
    public function obligation(): BelongsTo
    {
        return $this->belongsTo(Obligation::class);
    }

    /** @return BelongsTo<FinancialAccount, $this> */
    public function account(): BelongsTo
    {
        return $this->belongsTo(FinancialAccount::class, 'account_id');
    }

    /** @return BelongsTo<Transaction, $this> */
    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'settled_on' => 'date',
        ];
    }
}
