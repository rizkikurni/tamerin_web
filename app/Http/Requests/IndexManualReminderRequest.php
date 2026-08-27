<?php

namespace App\Http\Requests;

use App\Enums\ManualReminderStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexManualReminderRequest extends FormRequest
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
            'status' => ['nullable', Rule::enum(ManualReminderStatus::class)],
            'due_filter' => ['nullable', Rule::in(['overdue', 'today', 'upcoming', 'no_due'])],
            'search' => ['nullable', 'string', 'max:160'],
        ];
    }

    /** @return array{status: string|null, due_filter: string|null, search: string|null} */
    public function filters(): array
    {
        return [
            'status' => $this->filled('status') ? $this->string('status')->toString() : null,
            'due_filter' => $this->filled('due_filter') ? $this->string('due_filter')->toString() : null,
            'search' => $this->filled('search') ? $this->string('search')->trim()->toString() : null,
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'status' => $this->filled('status') ? $this->input('status') : null,
            'due_filter' => $this->filled('due_filter') ? $this->input('due_filter') : null,
            'search' => $this->filled('search') ? $this->string('search')->trim()->toString() : null,
        ]);
    }
}
