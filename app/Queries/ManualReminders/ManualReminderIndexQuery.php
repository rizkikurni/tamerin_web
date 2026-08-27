<?php

namespace App\Queries\ManualReminders;

use App\Enums\ManualReminderStatus;
use App\Models\ManualReminder;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

class ManualReminderIndexQuery
{
    /**
     * @param  array{status: string|null, due_filter: string|null, search: string|null}  $filters
     * @return LengthAwarePaginator<int, covariant array<string, mixed>>
     */
    public function paginate(User $user, array $filters): LengthAwarePaginator
    {
        $today = today()->toDateString();

        return ManualReminder::query()
            ->whereBelongsTo($user)
            ->select(['id', 'title', 'due_on', 'note', 'status', 'created_at', 'updated_at'])
            ->when(
                $filters['status'],
                fn (Builder $query, string $status): Builder => $query->where('status', $status),
            )
            ->when(
                $filters['search'],
                fn (Builder $query, string $search): Builder => $query->whereLike(
                    'title',
                    "%{$search}%",
                    caseSensitive: false,
                ),
            )
            ->when(
                $filters['due_filter'] === 'overdue',
                fn (Builder $query): Builder => $query
                    ->where('status', ManualReminderStatus::Active)
                    ->whereDate('due_on', '<', $today),
            )
            ->when(
                $filters['due_filter'] === 'today',
                fn (Builder $query): Builder => $query
                    ->where('status', ManualReminderStatus::Active)
                    ->whereDate('due_on', $today),
            )
            ->when(
                $filters['due_filter'] === 'upcoming',
                fn (Builder $query): Builder => $query
                    ->where('status', ManualReminderStatus::Active)
                    ->whereDate('due_on', '>', $today),
            )
            ->when(
                $filters['due_filter'] === 'no_due',
                fn (Builder $query): Builder => $query->whereNull('due_on'),
            )
            ->orderByRaw(
                'CASE
                    WHEN status = ? AND due_on < ? THEN 1
                    WHEN status = ? AND due_on = ? THEN 2
                    WHEN status = ? AND due_on > ? THEN 3
                    WHEN status = ? AND due_on IS NULL THEN 4
                    ELSE 5
                END',
                [
                    ManualReminderStatus::Active->value, $today,
                    ManualReminderStatus::Active->value, $today,
                    ManualReminderStatus::Active->value, $today,
                    ManualReminderStatus::Active->value,
                ],
            )
            ->orderByRaw('due_on ASC NULLS LAST')
            ->latest('updated_at')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (ManualReminder $reminder): array => $this->item($reminder));
    }

    /** @return array{activeCount: int, dueTodayCount: int, overdueCount: int, completedThisMonthCount: int} */
    public function summary(User $user): array
    {
        $summary = ManualReminder::query()
            ->whereBelongsTo($user)
            ->toBase()
            ->selectRaw(
                'COUNT(CASE WHEN status = ? THEN 1 END) AS active_count',
                [ManualReminderStatus::Active->value],
            )
            ->selectRaw(
                'COUNT(CASE WHEN status = ? AND due_on = ? THEN 1 END) AS due_today_count',
                [ManualReminderStatus::Active->value, today()->toDateString()],
            )
            ->selectRaw(
                'COUNT(CASE WHEN status = ? AND due_on < ? THEN 1 END) AS overdue_count',
                [ManualReminderStatus::Active->value, today()->toDateString()],
            )
            ->selectRaw(
                'COUNT(CASE WHEN status = ? AND updated_at BETWEEN ? AND ? THEN 1 END) AS completed_this_month_count',
                [
                    ManualReminderStatus::Done->value,
                    today()->startOfMonth()->startOfDay(),
                    today()->endOfMonth()->endOfDay(),
                ],
            )
            ->first();

        return [
            'activeCount' => (int) ($summary->active_count ?? 0),
            'dueTodayCount' => (int) ($summary->due_today_count ?? 0),
            'overdueCount' => (int) ($summary->overdue_count ?? 0),
            'completedThisMonthCount' => (int) ($summary->completed_this_month_count ?? 0),
        ];
    }

    /** @return array<string, mixed> */
    private function item(ManualReminder $reminder): array
    {
        return [
            'id' => $reminder->id,
            'title' => $reminder->title,
            'due_on' => $reminder->due_on?->toDateString(),
            'note' => $reminder->note,
            'status' => $reminder->status->value,
            'group' => $this->group($reminder),
            'updated_at' => $reminder->updated_at->toISOString(),
        ];
    }

    private function group(ManualReminder $reminder): string
    {
        if ($reminder->status !== ManualReminderStatus::Active) {
            return 'completed';
        }

        if ($reminder->due_on === null) {
            return 'no_due';
        }

        if ($reminder->due_on->isBefore(today())) {
            return 'overdue';
        }

        return $reminder->due_on->isToday() ? 'today' : 'upcoming';
    }
}
