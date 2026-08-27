<?php

namespace App\Policies;

use App\Enums\InvestmentHoldingStatus;
use App\Models\InvestmentHolding;
use App\Models\User;

class InvestmentHoldingPolicy
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
    public function view(User $user, InvestmentHolding $investmentHolding): bool
    {
        return $investmentHolding->user_id === $user->id;
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
    public function update(User $user, InvestmentHolding $investmentHolding): bool
    {
        return $this->view($user, $investmentHolding)
            && $investmentHolding->status === InvestmentHoldingStatus::Active;
    }

    public function value(User $user, InvestmentHolding $investmentHolding): bool
    {
        return $this->update($user, $investmentHolding);
    }

    public function archive(User $user, InvestmentHolding $investmentHolding): bool
    {
        return $this->update($user, $investmentHolding);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, InvestmentHolding $investmentHolding): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, InvestmentHolding $investmentHolding): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, InvestmentHolding $investmentHolding): bool
    {
        return false;
    }
}
