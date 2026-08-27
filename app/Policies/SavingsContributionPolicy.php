<?php

namespace App\Policies;

use App\Enums\SavingsContributionStatus;
use App\Models\SavingsContribution;
use App\Models\User;

class SavingsContributionPolicy
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
    public function view(User $user, SavingsContribution $savingsContribution): bool
    {
        return $savingsContribution->user_id === $user->id;
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
    public function update(User $user, SavingsContribution $savingsContribution): bool
    {
        return false;
    }

    public function void(User $user, SavingsContribution $savingsContribution): bool
    {
        return $this->view($user, $savingsContribution)
            && $savingsContribution->status === SavingsContributionStatus::Active;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, SavingsContribution $savingsContribution): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, SavingsContribution $savingsContribution): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, SavingsContribution $savingsContribution): bool
    {
        return false;
    }
}
