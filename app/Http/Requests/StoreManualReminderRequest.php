<?php

namespace App\Http\Requests;

use App\Models\ManualReminder;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreManualReminderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('create', ManualReminder::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:160'],
            'due_on' => ['nullable', 'date_format:Y-m-d'],
            'note' => ['nullable', 'string', 'max:500'],
        ];
    }

    /** @return array{title: string, due_on: string|null, note: string|null} */
    public function reminderData(): array
    {
        return [
            'title' => $this->string('title')->trim()->toString(),
            'due_on' => $this->filled('due_on') ? $this->string('due_on')->toString() : null,
            'note' => $this->filled('note') ? $this->string('note')->trim()->toString() : null,
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'title' => $this->string('title')->trim()->toString(),
            'due_on' => $this->filled('due_on') ? $this->input('due_on') : null,
            'note' => $this->filled('note') ? $this->string('note')->trim()->toString() : null,
        ]);
    }
}
