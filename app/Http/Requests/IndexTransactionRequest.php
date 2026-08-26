<?php

namespace App\Http\Requests;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\Category;
use App\Models\FinancialAccount;
use App\Models\Transaction;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexTransactionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', Transaction::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'date_from' => ['nullable', 'date_format:Y-m-d'],
            'date_to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:date_from'],
            'type' => ['nullable', Rule::enum(TransactionType::class)],
            'account_id' => [
                'nullable',
                'ulid',
                Rule::exists(FinancialAccount::class, 'id')
                    ->where('user_id', $this->user()?->getAuthIdentifier()),
            ],
            'category_id' => [
                'nullable',
                'ulid',
                Rule::exists(Category::class, 'id')
                    ->where('user_id', $this->user()?->getAuthIdentifier()),
            ],
            'status' => ['nullable', Rule::enum(TransactionStatus::class)],
        ];
    }

    /**
     * @return array{
     *     date_from: string|null,
     *     date_to: string|null,
     *     type: string|null,
     *     account_id: string|null,
     *     category_id: string|null,
     *     status: string|null
     * }
     */
    public function filters(): array
    {
        return [
            'date_from' => $this->string('date_from')->toString() ?: null,
            'date_to' => $this->string('date_to')->toString() ?: null,
            'type' => $this->string('type')->toString() ?: null,
            'account_id' => $this->string('account_id')->toString() ?: null,
            'category_id' => $this->string('category_id')->toString() ?: null,
            'status' => $this->string('status')->toString() ?: null,
        ];
    }
}
