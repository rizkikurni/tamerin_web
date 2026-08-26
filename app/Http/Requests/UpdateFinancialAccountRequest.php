<?php

namespace App\Http\Requests;

use App\Enums\FinancialAccountStatus;
use App\Enums\FinancialAccountType;
use App\Models\FinancialAccount;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateFinancialAccountRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $financialAccount = $this->route('financial_account');

        return $financialAccount instanceof FinancialAccount
            && ($this->user()?->can('update', $financialAccount) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var FinancialAccount $financialAccount */
        $financialAccount = $this->route('financial_account');

        return [
            'name' => [
                'required',
                'string',
                'max:80',
                Rule::unique(FinancialAccount::class)
                    ->where('user_id', $this->user()?->getAuthIdentifier())
                    ->where('status', FinancialAccountStatus::Active->value)
                    ->ignore($financialAccount),
            ],
            'type' => ['required', Rule::enum(FinancialAccountType::class)],
            'opening_balance' => ['required', 'integer'],
            'opened_on' => ['required', 'date_format:Y-m-d'],
        ];
    }

    /** @return array{name: string, type: string, opening_balance: int, opened_on: string} */
    public function accountData(): array
    {
        return [
            'name' => $this->string('name')->toString(),
            'type' => $this->string('type')->toString(),
            'opening_balance' => $this->integer('opening_balance'),
            'opened_on' => $this->string('opened_on')->toString(),
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['name' => $this->string('name')->trim()->toString()]);
    }
}
