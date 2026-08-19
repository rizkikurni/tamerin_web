<?php

namespace App\Models;

use App\Enums\ExportFormat;
use App\Enums\ExportReportType;
use Database\Factories\ExportAuditFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['report_type', 'format', 'filters_json', 'row_count', 'file_name', 'generated_at'])]
class ExportAudit extends Model
{
    /** @use HasFactory<ExportAuditFactory> */
    use HasFactory, HasUlids;

    public $timestamps = false;

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'report_type' => ExportReportType::class,
            'format' => ExportFormat::class,
            'filters_json' => 'array',
            'row_count' => 'integer',
            'generated_at' => 'datetime',
        ];
    }
}
