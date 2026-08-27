<?php

namespace App\Http\Controllers;

use App\Actions\ManualReminders\CompleteManualReminder;
use App\Models\ManualReminder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

class CompleteManualReminderController extends Controller
{
    public function __invoke(
        ManualReminder $manualReminder,
        CompleteManualReminder $action,
    ): RedirectResponse {
        Gate::authorize('complete', $manualReminder);
        $action->handle($manualReminder);

        return to_route('reminders.index')
            ->with('status', 'manual-reminder-completed');
    }
}
