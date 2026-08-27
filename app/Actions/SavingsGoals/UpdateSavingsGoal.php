<?php

namespace App\Actions\SavingsGoals;

use App\Enums\SavingsGoalStatus;
use App\Models\SavingsGoal;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UpdateSavingsGoal
{
    public function __construct(private CompleteSavingsGoal $completeSavingsGoal) {}

    /** @param array{name: string, target_amount: int, target_date: string|null} $data */
    public function handle(SavingsGoal $goal, array $data): SavingsGoal
    {
        return DB::transaction(function () use ($goal, $data): SavingsGoal {
            $lockedGoal = SavingsGoal::query()
                ->whereKey($goal->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedGoal->status === SavingsGoalStatus::Archived) {
                throw ValidationException::withMessages([
                    'name' => 'Target yang sudah diarsipkan tidak dapat diubah.',
                ]);
            }

            $lockedGoal->update($data);

            return $this->completeSavingsGoal->handle($lockedGoal);
        });
    }
}
