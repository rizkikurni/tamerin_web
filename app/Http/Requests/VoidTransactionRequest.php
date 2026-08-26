<?php

namespace App\Http\Requests;

use App\Models\Transaction;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class VoidTransactionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $transaction = $this->route('transaction');

        return $transaction instanceof Transaction
            && ($this->user()?->can('void', $transaction) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'void_reason' => ['required', 'string', 'max:500'],
        ];
    }

    public function voidReason(): string
    {
        return $this->string('void_reason')->trim()->toString();
    }

    public function requestId(): string
    {
        $requestId = $this->header('X-Request-ID');

        return is_string($requestId) && $requestId !== ''
            ? Str::limit($requestId, 64, '')
            : (string) Str::uuid();
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'void_reason' => $this->string('void_reason')->trim()->toString(),
        ]);
    }
}
