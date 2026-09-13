<?php

namespace App\Http\Requests;

use App\Enums\ExportFormat;
use App\Models\ExportAudit;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

class ExportReportRequest extends IndexReportRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', ExportAudit::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            ...parent::rules(),
            'format' => ['required', Rule::enum(ExportFormat::class)],
        ];
    }

    public function exportFormat(): ExportFormat
    {
        return ExportFormat::from($this->string('format')->toString());
    }
}
