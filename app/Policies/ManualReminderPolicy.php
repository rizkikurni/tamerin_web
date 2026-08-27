<?php

namespace App\Policies;

use App\Enums\ManualReminderStatus;
use App\Models\ManualReminder;
use App\Models\User;

class ManualReminderPolicy
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
    public function view(User $user, ManualReminder $manualReminder): bool
    {
        return $user->id === $manualReminder->user_id;
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
    public function update(User $user, ManualReminder $manualReminder): bool
    {
        return $this->view($user, $manualReminder)
            && $manualReminder->status === ManualReminderStatus::Active;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ManualReminder $manualReminder): bool
    {
        return false;
    }

    public function complete(User $user, ManualReminder $manualReminder): bool
    {
        return $this->update($user, $manualReminder);
    }

    public function dismiss(User $user, ManualReminder $manualReminder): bool
    {
        return $this->update($user, $manualReminder);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, ManualReminder $manualReminder): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, ManualReminder $manualReminder): bool
    {
        return false;
    }
}
