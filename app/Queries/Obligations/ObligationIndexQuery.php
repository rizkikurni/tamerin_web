<?php

namespace App\Queries\Obligations;

use App\Enums\ObligationStatus;
use App\Models\Obligation;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

class ObligationIndexQuery
{
    /**
     * @param  array{kind: string|null, status: string|null, due_filter: string|null, search: string|null}  $filters
     * @return LengthAwarePaginator<int, covariant array<string, mixed>>
     */
    public function paginate(User $user, array $filters): LengthAwarePaginator
    {
        return Obligation::query()
            ->whereBelongsTo($user)
            ->select([
                'id',
                'kind',
                'counterparty_name',
                'original_amount',
                'outstanding_amount',
                'started_on',
                'due_on',
                'status',
                'settled_at',
                'archived_at',
                'note',
                'created_at',
            ])
            ->when(
                $filters['kind'],
                fn (Builder $query, string $kind): Builder => $query->where('kind', $kind),
            )
            ->when(
                $filters['status'],
                fn (Builder $query, string $status): Builder => $query->where('status', $status),
            )
            ->when(
                $filters['search'],
                fn (Builder $query, string $search): Builder => $query->whereLike(
                    'counterparty_name',
                    "%{$search}%",
                    caseSensitive: false,
                ),
            )
            ->when(
                $filters['due_filter'] === 'due_soon',
                fn (Builder $query): Builder => $query
                    ->where('status', ObligationStatus::Open)
                    ->whereBetween('due_on', [today(), today()->addDays(7)]),
            )
            ->when(
                $filters['due_filter'] === 'overdue',
                fn (Builder $query): Builder => $query
                    ->where('status', ObligationStatus::Open)
                    ->whereDate('due_on', '<', today()),
            )
            ->when(
                $filters['due_filter'] === 'no_due',
                fn (Builder $query): Builder => $query->whereNull('due_on'),
            )
            ->orderByRaw('due_on ASC NULLS LAST')
            ->latest('created_at')
            ->paginate(12)
            ->withQueryString()
            ->through($this->item(...));
    }

    /** @return array<string, mixed> */
    public function item(Obligation $obligation): array
    {
        $paidAmount = $obligation->original_amount - $obligation->outstanding_amount;

        return [
            'id' => $obligation->id,
            'kind' => $obligation->kind->value,
            'counterparty_name' => $obligation->counterparty_name,
            'original_amount' => $obligation->original_amount,
            'outstanding_amount' => $obligation->outstanding_amount,
            'paid_amount' => $paidAmount,
            'progress_percentage' => round(($paidAmount / $obligation->original_amount) * 100, 1),
            'started_on' => $obligation->started_on->toDateString(),
            'due_on' => $obligation->due_on?->toDateString(),
            'status' => $obligation->status->value,
            'settled_at' => $obligation->settled_at?->toISOString(),
            'archived_at' => $obligation->archived_at?->toISOString(),
            'note' => $obligation->note,
            'is_overdue' => $obligation->status === ObligationStatus::Open
                && $obligation->due_on !== null
                && $obligation->due_on->isBefore(today()),
        ];
    }
}
