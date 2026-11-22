<?php

namespace App\Http\Requests;

use App\Enums\FinancialAccountStatus;
use App\Enums\TransactionType;
use App\Models\Category;
use App\Models\FinancialAccount;
use App\Models\Transaction;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTransactionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', Transaction::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $isTransfer = $this->string('type')->toString() === TransactionType::Transfer->value;

        return [
            'type' => ['required', Rule::enum(TransactionType::class)],
            'amount' => ['required', 'integer', 'min:1'],
            'transacted_on' => ['required', 'date_format:Y-m-d'],
            'account_id' => [
                'required',
                'ulid',
                Rule::exists(FinancialAccount::class, 'id')
                    ->where('user_id', $this->user()?->getAuthIdentifier())
                    ->where('status', FinancialAccountStatus::Active->value),
            ],
            'destination_account_id' => [
                Rule::requiredIf($isTransfer),
                Rule::prohibitedIf(! $isTransfer),
                'nullable',
                'ulid',
                'different:account_id',
                Rule::exists(FinancialAccount::class, 'id')
                    ->where('user_id', $this->user()?->getAuthIdentifier())
                    ->where('status', FinancialAccountStatus::Active->value),
            ],
            'category_id' => [
                Rule::requiredIf(! $isTransfer),
                Rule::prohibitedIf($isTransfer),
                'nullable',
                'ulid',
                Rule::exists(Category::class, 'id')
                    ->where('user_id', $this->user()?->getAuthIdentifier())
                    ->where('type', $this->string('type')->toString())
                    ->whereNull('archived_at'),
            ],
            'note' => ['nullable', 'string', 'max:500'],
            'idempotency_key' => ['required', 'string', 'max:64'],
        ];
    }

    /**
     * @return array{
     *     type: string,
     *     amount: int,
     *     transacted_on: string,
     *     account_id: string,
     *     destination_account_id: string|null,
     *     category_id: string|null,
     *     note: string|null,
     *     idempotency_key: string
     * }
     */
    public function transactionData(): array
    {
        return [
            'type' => $this->string('type')->toString(),
            'amount' => $this->integer('amount'),
            'transacted_on' => $this->string('transacted_on')->toString(),
            'account_id' => $this->string('account_id')->toString(),
            'destination_account_id' => $this->string('destination_account_id')->toString() ?: null,
            'category_id' => $this->string('category_id')->toString() ?: null,
            'note' => $this->string('note')->trim()->toString() ?: null,
            'idempotency_key' => $this->string('idempotency_key')->toString(),
        ];
    }
}
