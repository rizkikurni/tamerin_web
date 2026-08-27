<?php

namespace App\Http\Controllers;

use App\Actions\ManualReminders\CreateManualReminder;
use App\Actions\ManualReminders\UpdateManualReminder;
use App\Enums\ManualReminderStatus;
use App\Http\Requests\IndexManualReminderRequest;
use App\Http\Requests\StoreManualReminderRequest;
use App\Http\Requests\UpdateManualReminderRequest;
use App\Models\ManualReminder;
use App\Models\User;
use App\Queries\Dashboard\SystemReminderQuery;
use App\Queries\ManualReminders\ManualReminderIndexQuery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ManualReminderController extends Controller
{
    public function index(
        IndexManualReminderRequest $request,
        ManualReminderIndexQuery $manualReminderQuery,
        SystemReminderQuery $systemReminderQuery,
    ): Response {
        Gate::authorize('viewAny', ManualReminder::class);

        /** @var User $user */
        $user = $request->user();
        $filters = $request->filters();

        return Inertia::render('reminders/index', [
            'manualReminders' => $manualReminderQuery->paginate($user, $filters),
            'systemReminders' => $systemReminderQuery->get($user, today(), 50),
            'summary' => $manualReminderQuery->summary($user),
            'filters' => $filters,
            'statusOptions' => $this->statusOptions(),
            'dueFilterOptions' => $this->dueFilterOptions(),
        ]);
    }

    public function store(
        StoreManualReminderRequest $request,
        CreateManualReminder $action,
    ): RedirectResponse {
        /** @var User $user */
        $user = $request->user();
        $action->handle($user, $request->reminderData());

        return to_route('reminders.index')
            ->with('status', 'manual-reminder-created');
    }

    public function update(
        UpdateManualReminderRequest $request,
        ManualReminder $manualReminder,
        UpdateManualReminder $action,
    ): RedirectResponse {
        $action->handle($manualReminder, $request->reminderData());

        return to_route('reminders.index')
            ->with('status', 'manual-reminder-updated');
    }

    /** @return list<array{value: string, label: string}> */
    private function statusOptions(): array
    {
        return [
            ['value' => ManualReminderStatus::Active->value, 'label' => 'Aktif'],
            ['value' => ManualReminderStatus::Done->value, 'label' => 'Selesai'],
            ['value' => ManualReminderStatus::Dismissed->value, 'label' => 'Diabaikan'],
        ];
    }

    /** @return list<array{value: string, label: string}> */
    private function dueFilterOptions(): array
    {
        return [
            ['value' => 'overdue', 'label' => 'Terlambat'],
            ['value' => 'today', 'label' => 'Hari ini'],
            ['value' => 'upcoming', 'label' => 'Mendatang'],
            ['value' => 'no_due', 'label' => 'Tanpa tanggal'],
        ];
    }
}
