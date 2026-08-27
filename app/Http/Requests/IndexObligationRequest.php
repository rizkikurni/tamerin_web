<?php

namespace App\Http\Requests;

use App\Enums\ObligationKind;
use App\Enums\ObligationStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexObligationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<mixed>>
     */
    public function rules(): array
    {
        return [
            'kind' => ['nullable', Rule::enum(ObligationKind::class)],
            'status' => ['nullable', Rule::enum(ObligationStatus::class)],
            'due_filter' => ['nullable', Rule::in(['due_soon', 'overdue', 'no_due'])],
            'search' => ['nullable', 'string', 'max:120'],
        ];
    }

    /** @return array{kind: string|null, status: string|null, due_filter: string|null, search: string|null} */
    public function filters(): array
    {
        return [
            'kind' => $this->string('kind')->toString() ?: null,
            'status' => $this->string('status')->toString() ?: null,
            'due_filter' => $this->string('due_filter')->toString() ?: null,
            'search' => $this->string('search')->trim()->toString() ?: null,
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'search' => $this->filled('search')
                ? $this->string('search')->trim()->toString()
                : null,
        ]);
    }
}
