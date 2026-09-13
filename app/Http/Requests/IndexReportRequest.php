<?php

namespace App\Http\Requests;

use App\Enums\ExportReportType;
use App\Models\Category;
use App\Models\FinancialAccount;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexReportRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'report_type' => ['required', Rule::enum(ExportReportType::class)],
            'date_from' => ['required', 'date_format:Y-m-d'],
            'date_to' => ['required', 'date_format:Y-m-d', 'after_or_equal:date_from'],
            'account_id' => [
                'nullable',
                'ulid',
                Rule::exists(FinancialAccount::class, 'id')
                    ->where('user_id', $this->user()->getAuthIdentifier()),
            ],
            'category_id' => [
                'nullable',
                'ulid',
                Rule::exists(Category::class, 'id')
                    ->where('user_id', $this->user()->getAuthIdentifier()),
            ],
            'status' => ['nullable', 'string', 'max:30'],
        ];
    }

    /** @return array{report_type: string, date_from: string, date_to: string, account_id: string|null, category_id: string|null, status: string|null} */
    public function filters(): array
    {
        return [
            'report_type' => $this->string('report_type')->toString(),
            'date_from' => $this->string('date_from')->toString(),
            'date_to' => $this->string('date_to')->toString(),
            'account_id' => $this->filled('account_id') ? $this->string('account_id')->toString() : null,
            'category_id' => $this->filled('category_id') ? $this->string('category_id')->toString() : null,
            'status' => $this->filled('status') ? $this->string('status')->toString() : null,
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'report_type' => $this->input('report_type', ExportReportType::Transactions->value),
            'date_from' => $this->input('date_from', today()->startOfMonth()->toDateString()),
            'date_to' => $this->input('date_to', today()->endOfMonth()->toDateString()),
            'account_id' => $this->filled('account_id') ? $this->input('account_id') : null,
            'category_id' => $this->filled('category_id') ? $this->input('category_id') : null,
            'status' => $this->filled('status') ? $this->input('status') : null,
        ]);
    }
}
