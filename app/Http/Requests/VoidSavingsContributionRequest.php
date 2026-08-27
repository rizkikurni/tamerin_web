<?php

namespace App\Http\Requests;

use App\Models\SavingsContribution;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class VoidSavingsContributionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $contribution = $this->route('savings_contribution');

        return $contribution instanceof SavingsContribution
            && ($this->user()?->can('void', $contribution) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return ['void_reason' => ['required', 'string', 'max:500']];
    }

    public function voidReason(): string
    {
        return $this->string('void_reason')->trim()->toString();
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'void_reason' => $this->string('void_reason')->trim()->toString(),
        ]);
    }
}
