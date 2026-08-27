<?php

namespace App\Http\Requests;

use App\Enums\ObligationKind;
use App\Models\Obligation;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreObligationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', Obligation::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<mixed>>
     */
    public function rules(): array
    {
        return [
            'kind' => ['required', Rule::enum(ObligationKind::class)],
            'counterparty_name' => ['required', 'string', 'max:120'],
            'original_amount' => ['required', 'integer', 'min:1'],
            'started_on' => ['required', 'date_format:Y-m-d'],
            'due_on' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:started_on'],
            'note' => ['nullable', 'string', 'max:500'],
        ];
    }

    /** @return array{kind: string, counterparty_name: string, original_amount: int, started_on: string, due_on: string|null, note: string|null} */
    public function obligationData(): array
    {
        return [
            'kind' => $this->string('kind')->toString(),
            'counterparty_name' => $this->string('counterparty_name')->trim()->toString(),
            'original_amount' => $this->integer('original_amount'),
            'started_on' => $this->string('started_on')->toString(),
            'due_on' => $this->filled('due_on') ? $this->string('due_on')->toString() : null,
            'note' => $this->filled('note') ? $this->string('note')->trim()->toString() : null,
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'counterparty_name' => $this->string('counterparty_name')->trim()->toString(),
            'due_on' => $this->filled('due_on') ? $this->input('due_on') : null,
            'note' => $this->filled('note') ? $this->string('note')->trim()->toString() : null,
        ]);
    }
}
