<?php

namespace App\Policies;

use App\Enums\InvestmentHoldingStatus;
use App\Enums\InvestmentValuationStatus;
use App\Models\InvestmentValuation;
use App\Models\User;

class InvestmentValuationPolicy
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
    public function view(User $user, InvestmentValuation $investmentValuation): bool
    {
        return $investmentValuation->user_id === $user->id;
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
    public function update(User $user, InvestmentValuation $investmentValuation): bool
    {
        return false;
    }

    public function void(User $user, InvestmentValuation $investmentValuation): bool
    {
        return $this->view($user, $investmentValuation)
            && $investmentValuation->status === InvestmentValuationStatus::Active
            && $investmentValuation->investmentHolding->status === InvestmentHoldingStatus::Active;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, InvestmentValuation $investmentValuation): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, InvestmentValuation $investmentValuation): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, InvestmentValuation $investmentValuation): bool
    {
        return false;
    }
}
