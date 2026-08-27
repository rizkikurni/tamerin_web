<?php

namespace App\Http\Controllers;

use App\Actions\ManualReminders\DismissManualReminder;
use App\Models\ManualReminder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

class DismissManualReminderController extends Controller
{
    public function __invoke(
        ManualReminder $manualReminder,
        DismissManualReminder $action,
    ): RedirectResponse {
        Gate::authorize('dismiss', $manualReminder);
        $action->handle($manualReminder);

        return to_route('reminders.index')
            ->with('status', 'manual-reminder-dismissed');
    }
}
