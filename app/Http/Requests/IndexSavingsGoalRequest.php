<?php

namespace App\Http\Requests;

use App\Enums\SavingsGoalStatus;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexSavingsGoalRequest extends FormRequest
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
        return ['status' => ['nullable', Rule::enum(SavingsGoalStatus::class)]];
    }

    /** @return array{status: string|null} */
    public function filters(): array
    {
        $status = $this->string('status')->toString();

        return ['status' => $status === '' ? null : $status];
    }
}
