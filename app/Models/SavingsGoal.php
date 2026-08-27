<?php

namespace App\Models;

use App\Enums\SavingsGoalStatus;
use Database\Factories\SavingsGoalFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
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
 * @property int $target_amount
 * @property Carbon|null $target_date
 * @property SavingsGoalStatus $status
 * @property Carbon|null $completed_at
 * @property Carbon|null $archived_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'target_amount', 'target_date', 'status', 'completed_at', 'archived_at'])]
class SavingsGoal extends Model
{
    /** @use HasFactory<SavingsGoalFactory> */
    use HasFactory, HasUlids;

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<SavingsContribution, $this> */
    public function contributions(): HasMany
    {
        return $this->hasMany(SavingsContribution::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'target_amount' => 'integer',
            'target_date' => 'date',
            'status' => SavingsGoalStatus::class,
            'completed_at' => 'datetime',
            'archived_at' => 'datetime',
        ];
    }
}
