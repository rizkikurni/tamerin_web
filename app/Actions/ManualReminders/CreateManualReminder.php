<?php

namespace App\Actions\ManualReminders;

use App\Enums\ManualReminderStatus;
use App\Models\ManualReminder;
use App\Models\User;

class CreateManualReminder
{
    /** @param array{title: string, due_on: string|null, note: string|null} $data */
    public function handle(User $user, array $data): ManualReminder
    {
        return $user->manualReminders()->create([
            ...$data,
            'status' => ManualReminderStatus::Active,
        ]);
    }
}
