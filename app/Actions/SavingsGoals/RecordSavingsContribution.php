<?php

namespace App\Actions\SavingsGoals;

use App\Enums\SavingsContributionStatus;
use App\Enums\SavingsGoalStatus;
use App\Models\SavingsContribution;
use App\Models\SavingsGoal;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RecordSavingsContribution
{
    public function __construct(private CompleteSavingsGoal $completeSavingsGoal) {}

    /** @param array{amount: int, contributed_on: string, account_id: string|null, note: string|null} $data */
    public function handle(User $user, SavingsGoal $goal, array $data): SavingsContribution
    {
        return DB::transaction(function () use ($user, $goal, $data): SavingsContribution {
            $lockedGoal = SavingsGoal::query()
                ->whereBelongsTo($user)
                ->whereKey($goal->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedGoal->status !== SavingsGoalStatus::Active) {
                throw ValidationException::withMessages([
                    'amount' => 'Target yang sudah selesai atau diarsipkan tidak menerima setoran baru.',
                ]);
            }

            $contribution = $user->savingsContributions()->create([
                ...$data,
                'savings_goal_id' => $lockedGoal->id,
                'status' => SavingsContributionStatus::Active,
                'voided_at' => null,
                'void_reason' => null,
            ]);

            $this->completeSavingsGoal->handle($lockedGoal);

            return $contribution;
        });
    }
}
