<?php

namespace App\Models;

use App\Enums\SavingsContributionStatus;
use Database\Factories\SavingsContributionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $user_id
 * @property string $savings_goal_id
 * @property string|null $account_id
 * @property int $amount
 * @property Carbon $contributed_on
 * @property string|null $note
 * @property SavingsContributionStatus $status
 * @property Carbon|null $voided_at
 * @property string|null $void_reason
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['savings_goal_id', 'account_id', 'amount', 'contributed_on', 'note', 'status', 'voided_at', 'void_reason'])]
class SavingsContribution extends Model
{
    /** @use HasFactory<SavingsContributionFactory> */
    use HasFactory, HasUlids;

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<SavingsGoal, $this> */
    public function savingsGoal(): BelongsTo
    {
        return $this->belongsTo(SavingsGoal::class);
    }

    /** @return BelongsTo<FinancialAccount, $this> */
    public function account(): BelongsTo
    {
        return $this->belongsTo(FinancialAccount::class, 'account_id');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'contributed_on' => 'date',
            'status' => SavingsContributionStatus::class,
            'voided_at' => 'datetime',
        ];
    }
}
