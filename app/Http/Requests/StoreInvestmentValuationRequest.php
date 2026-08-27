<?php

namespace App\Http\Requests;

use App\Models\InvestmentHolding;
use App\Models\InvestmentValuation;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreInvestmentValuationRequest extends FormRequest
{
    public function authorize(): bool
    {
        $holding = $this->route('investment');

        return $holding instanceof InvestmentHolding
            && ($this->user()?->can('value', $holding) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<mixed>>
     */
    public function rules(): array
    {
        $holding = $this->route('investment');

        return [
            'valued_on' => [
                'required',
                'date_format:Y-m-d',
                Rule::unique(InvestmentValuation::class, 'valued_on')
                    ->where('investment_holding_id', $holding instanceof InvestmentHolding ? $holding->id : ''),
            ],
            'value' => ['required', 'integer', 'min:0'],
            'note' => ['nullable', 'string', 'max:500'],
        ];
    }

    /** @return array{valued_on: string, value: int, note: string|null} */
    public function valuationData(): array
    {
        return [
            'valued_on' => $this->string('valued_on')->toString(),
            'value' => $this->integer('value'),
            'note' => $this->filled('note') ? $this->string('note')->trim()->toString() : null,
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
