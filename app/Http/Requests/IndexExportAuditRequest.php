<?php

namespace App\Http\Requests;

use App\Enums\ExportFormat;
use App\Enums\ExportReportType;
use App\Models\ExportAudit;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexExportAuditRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('viewAny', ExportAudit::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'report_type' => ['nullable', Rule::enum(ExportReportType::class)],
            'format' => ['nullable', Rule::enum(ExportFormat::class)],
        ];
    }

    /** @return array{report_type: string|null, format: string|null} */
    public function filters(): array
    {
        return [
            'report_type' => $this->filled('report_type') ? $this->string('report_type')->toString() : null,
            'format' => $this->filled('format') ? $this->string('format')->toString() : null,
        ];
    }
}
