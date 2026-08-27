<?php

namespace App\Actions\ManualReminders;

use App\Enums\ManualReminderStatus;
use App\Models\ManualReminder;

class DismissManualReminder
{
    public function handle(ManualReminder $manualReminder): ManualReminder
    {
        $manualReminder->update(['status' => ManualReminderStatus::Dismissed]);

        return $manualReminder->refresh();
    }
}
