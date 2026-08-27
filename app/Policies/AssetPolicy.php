<?php

namespace App\Policies;

use App\Enums\AssetStatus;
use App\Models\Asset;
use App\Models\User;

class AssetPolicy
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
    public function view(User $user, Asset $asset): bool
    {
        return $asset->user_id === $user->id;
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
    public function update(User $user, Asset $asset): bool
    {
        return $this->view($user, $asset)
            && $asset->status === AssetStatus::Active;
    }

    public function archive(User $user, Asset $asset): bool
    {
        return $this->update($user, $asset);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Asset $asset): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Asset $asset): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Asset $asset): bool
    {
        return false;
    }
}
