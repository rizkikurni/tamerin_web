<?php

namespace App\Queries\Reports;

use App\Models\ExportAudit;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

class ExportAuditIndexQuery
{
    /** @param array{report_type: string|null, format: string|null} $filters
     * @return LengthAwarePaginator<int, covariant array<string, mixed>>
     */
    public function paginate(User $user, array $filters): LengthAwarePaginator
    {
        return ExportAudit::query()
            ->whereBelongsTo($user)
            ->when(
                $filters['report_type'],
                fn (Builder $query, string $type): Builder => $query->where('report_type', $type),
            )
            ->when(
                $filters['format'],
                fn (Builder $query, string $format): Builder => $query->where('format', $format),
            )
            ->latest('generated_at')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (ExportAudit $audit): array => [
                'id' => $audit->id,
                'report_type' => $audit->report_type->value,
                'format' => $audit->format->value,
                'filters' => $audit->filters_json,
                'row_count' => $audit->row_count,
                'file_name' => $audit->file_name,
                'generated_at' => $audit->generated_at->toISOString(),
            ]);
    }
}
