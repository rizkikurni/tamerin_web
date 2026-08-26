<?php

namespace App\Policies;

use App\Enums\FinancialAccountStatus;
use App\Models\FinancialAccount;
use App\Models\User;

class FinancialAccountPolicy
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
    public function view(User $user, FinancialAccount $financialAccount): bool
    {
        return $financialAccount->user_id === $user->id;
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
    public function update(User $user, FinancialAccount $financialAccount): bool
    {
        return $this->view($user, $financialAccount)
            && $financialAccount->status === FinancialAccountStatus::Active
            && $financialAccount->archived_at === null;
    }

    public function archive(User $user, FinancialAccount $financialAccount): bool
    {
        return $this->update($user, $financialAccount);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, FinancialAccount $financialAccount): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, FinancialAccount $financialAccount): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, FinancialAccount $financialAccount): bool
    {
        return false;
    }
}
