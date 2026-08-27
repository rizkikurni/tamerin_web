<?php

namespace App\Policies;

use App\Enums\SavingsGoalStatus;
use App\Models\SavingsGoal;
use App\Models\User;

class SavingsGoalPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, SavingsGoal $savingsGoal): bool
    {
        return $savingsGoal->user_id === $user->id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, SavingsGoal $savingsGoal): bool
    {
        return $this->view($user, $savingsGoal)
            && $savingsGoal->status !== SavingsGoalStatus::Archived;
    }

    public function contribute(User $user, SavingsGoal $savingsGoal): bool
    {
        return $this->view($user, $savingsGoal)
            && $savingsGoal->status === SavingsGoalStatus::Active;
    }

    public function archive(User $user, SavingsGoal $savingsGoal): bool
    {
        return $this->view($user, $savingsGoal)
            && $savingsGoal->status !== SavingsGoalStatus::Archived;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, SavingsGoal $savingsGoal): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, SavingsGoal $savingsGoal): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, SavingsGoal $savingsGoal): bool
    {
        return false;
    }
}
