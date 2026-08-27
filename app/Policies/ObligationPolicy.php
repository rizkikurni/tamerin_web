<?php

namespace App\Policies;

use App\Enums\ObligationStatus;
use App\Models\Obligation;
use App\Models\User;

class ObligationPolicy
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
    public function view(User $user, Obligation $obligation): bool
    {
        return $obligation->user_id === $user->id;
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
    public function update(User $user, Obligation $obligation): bool
    {
        return $this->view($user, $obligation)
            && $obligation->status === ObligationStatus::Open;
    }

    public function settle(User $user, Obligation $obligation): bool
    {
        return $this->update($user, $obligation)
            && $obligation->outstanding_amount > 0;
    }

    public function archive(User $user, Obligation $obligation): bool
    {
        return $this->view($user, $obligation)
            && $obligation->status === ObligationStatus::Settled;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Obligation $obligation): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Obligation $obligation): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Obligation $obligation): bool
    {
        return false;
    }
}
