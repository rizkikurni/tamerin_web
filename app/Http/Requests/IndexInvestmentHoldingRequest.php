<?php

namespace App\Http\Requests;

use App\Enums\InvestmentHoldingStatus;
use App\Enums\InvestmentInstrumentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexInvestmentHoldingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<mixed>>
     */
    public function rules(): array
    {
        return [
            'instrument_type' => ['nullable', Rule::enum(InvestmentInstrumentType::class)],
            'status' => ['nullable', Rule::enum(InvestmentHoldingStatus::class)],
            'valuation_condition' => ['nullable', Rule::in(['current', 'stale', 'unvalued'])],
        ];
    }

    /** @return array{instrument_type: string|null, status: string|null, valuation_condition: string|null} */
    public function filters(): array
    {
        return [
            'instrument_type' => $this->string('instrument_type')->toString() ?: null,
            'status' => $this->string('status')->toString() ?: null,
            'valuation_condition' => $this->string('valuation_condition')->toString() ?: null,
        ];
    }
}
