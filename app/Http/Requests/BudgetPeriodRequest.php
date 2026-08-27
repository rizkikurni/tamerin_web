<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;

class BudgetPeriodRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return ['period' => ['nullable', 'date_format:Y-m']];
    }

    public function period(): Carbon
    {
        $value = $this->string('period')->toString();

        return $value === ''
            ? Carbon::today()->startOfMonth()
            : Carbon::createFromFormat('Y-m', $value)->startOfMonth();
    }
}
