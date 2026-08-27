<?php

namespace App\Actions\ManualReminders;

use App\Enums\ManualReminderStatus;
use App\Models\ManualReminder;

class CompleteManualReminder
{
    public function handle(ManualReminder $manualReminder): ManualReminder
    {
        $manualReminder->update(['status' => ManualReminderStatus::Done]);

        return $manualReminder->refresh();
    }
}
