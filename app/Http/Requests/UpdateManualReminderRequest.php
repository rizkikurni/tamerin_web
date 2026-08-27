<?php

namespace App\Http\Requests;

use App\Models\ManualReminder;

class UpdateManualReminderRequest extends StoreManualReminderRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $manualReminder = $this->route('manual_reminder');

        return $manualReminder instanceof ManualReminder
            && $this->user()->can('update', $manualReminder);
    }
}
