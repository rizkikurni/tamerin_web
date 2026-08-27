<?php

namespace App\Http\Requests;

use App\Enums\InvestmentInstrumentType;
use App\Models\InvestmentHolding;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInvestmentHoldingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', InvestmentHolding::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<mixed>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'instrument_type' => ['required', Rule::enum(InvestmentInstrumentType::class)],
            'acquisition_cost' => ['required', 'integer', 'min:0'],
            'acquired_on' => ['required', 'date_format:Y-m-d'],
            'units' => ['nullable', 'numeric', 'gt:0', 'decimal:0,8', 'max:999999999999.99999999'],
        ];
    }

    /** @return array{name: string, instrument_type: string, acquisition_cost: int, acquired_on: string, units: string|null} */
    public function holdingData(): array
    {
        return [
            'name' => $this->string('name')->trim()->toString(),
            'instrument_type' => $this->string('instrument_type')->toString(),
            'acquisition_cost' => $this->integer('acquisition_cost'),
            'acquired_on' => $this->string('acquired_on')->toString(),
            'units' => $this->filled('units') ? $this->string('units')->toString() : null,
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => $this->string('name')->trim()->toString(),
            'units' => $this->filled('units') ? $this->input('units') : null,
        ]);
    }
}
