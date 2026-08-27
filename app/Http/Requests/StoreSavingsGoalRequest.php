<?php

namespace App\Http\Requests;

use App\Models\SavingsGoal;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreSavingsGoalRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', SavingsGoal::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'target_amount' => ['required', 'integer', 'min:1'],
            'target_date' => ['nullable', 'date_format:Y-m-d'],
        ];
    }

    /** @return array{name: string, target_amount: int, target_date: string|null} */
    public function goalData(): array
    {
        return [
            'name' => $this->string('name')->trim()->toString(),
            'target_amount' => $this->integer('target_amount'),
            'target_date' => $this->filled('target_date')
                ? $this->string('target_date')->toString()
                : null,
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['name' => $this->string('name')->trim()->toString()]);
    }
}
