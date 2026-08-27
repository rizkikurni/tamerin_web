<?php

namespace App\Actions\ManualReminders;

use App\Models\ManualReminder;

class UpdateManualReminder
{
    /** @param array{title: string, due_on: string|null, note: string|null} $data */
    public function handle(ManualReminder $manualReminder, array $data): ManualReminder
    {
        $manualReminder->update($data);

        return $manualReminder->refresh();
    }
}
