<?php

namespace App\Http\Requests;

use App\Enums\FinancialAccountStatus;
use App\Models\FinancialAccount;
use App\Models\Obligation;
use App\Models\ObligationSettlement;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreObligationSettlementRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $obligation = $this->route('obligation');

        if (! $obligation instanceof Obligation || ! $this->user()->can('view', $obligation)) {
            return false;
        }

        if ($this->user()->can('settle', $obligation)) {
            return true;
        }

        return ObligationSettlement::query()
            ->whereBelongsTo($obligation)
            ->where('user_id', $this->user()->getAuthIdentifier())
            ->where('idempotency_key', $this->string('idempotency_key')->toString())
            ->exists();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<mixed>>
     */
    public function rules(): array
    {
        return [
            'amount' => ['required', 'integer', 'min:1'],
            'account_id' => [
                'required',
                'ulid',
                Rule::exists(FinancialAccount::class, 'id')
                    ->where('user_id', $this->user()->getAuthIdentifier())
                    ->where('status', FinancialAccountStatus::Active->value),
            ],
            'settled_on' => ['required', 'date_format:Y-m-d'],
            'note' => ['nullable', 'string', 'max:500'],
            'idempotency_key' => ['required', 'string', 'max:64'],
        ];
    }

    /** @return array{amount: int, account_id: string, settled_on: string, note: string|null, idempotency_key: string} */
    public function settlementData(): array
    {
        return [
            'amount' => $this->integer('amount'),
            'account_id' => $this->string('account_id')->toString(),
            'settled_on' => $this->string('settled_on')->toString(),
            'note' => $this->filled('note') ? $this->string('note')->trim()->toString() : null,
            'idempotency_key' => $this->string('idempotency_key')->toString(),
        ];
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
            'note' => $this->filled('note') ? $this->string('note')->trim()->toString() : null,
        ]);
    }
}
