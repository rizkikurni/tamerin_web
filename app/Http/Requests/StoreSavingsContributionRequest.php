<?php

namespace App\Http\Requests;

use App\Enums\FinancialAccountStatus;
use App\Models\FinancialAccount;
use App\Models\SavingsGoal;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSavingsContributionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $goal = $this->route('savings_goal');

        return $goal instanceof SavingsGoal
            && ($this->user()?->can('contribute', $goal) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'amount' => ['required', 'integer', 'min:1'],
            'contributed_on' => ['required', 'date_format:Y-m-d'],
            'account_id' => [
                'nullable',
                'ulid',
                Rule::exists(FinancialAccount::class, 'id')
                    ->where('user_id', $this->user()?->getAuthIdentifier())
                    ->where('status', FinancialAccountStatus::Active->value),
            ],
            'note' => ['nullable', 'string', 'max:500'],
        ];
    }

    /** @return array{amount: int, contributed_on: string, account_id: string|null, note: string|null} */
    public function contributionData(): array
    {
        return [
            'amount' => $this->integer('amount'),
            'contributed_on' => $this->string('contributed_on')->toString(),
            'account_id' => $this->filled('account_id')
                ? $this->string('account_id')->toString()
                : null,
            'note' => $this->filled('note')
                ? $this->string('note')->trim()->toString()
                : null,
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'account_id' => $this->filled('account_id') ? $this->input('account_id') : null,
            'note' => $this->filled('note') ? $this->string('note')->trim()->toString() : null,
        ]);
    }
}
