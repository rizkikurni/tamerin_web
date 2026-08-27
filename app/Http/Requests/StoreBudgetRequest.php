<?php

namespace App\Http\Requests;

use App\Enums\CategoryType;
use App\Models\Budget;
use App\Models\Category;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Database\Query\Builder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class StoreBudgetRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', Budget::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $userId = $this->user()?->getAuthIdentifier();

        return [
            'category_id' => [
                'required',
                'ulid',
                Rule::exists(Category::class, 'id')
                    ->where(fn (Builder $query): Builder => $query
                        ->where('user_id', $userId)
                        ->where('type', CategoryType::Expense->value)
                        ->whereNull('archived_at')),
                Rule::unique(Budget::class, 'category_id')
                    ->where('user_id', $userId)
                    ->where('period_start', $this->periodStartForValidation()),
            ],
            'period' => ['required', 'date_format:Y-m'],
            'amount' => ['required', 'integer', 'min:1'],
        ];
    }

    /** @return array{category_id: string, period_start: string, amount: int} */
    public function budgetData(): array
    {
        return [
            'category_id' => $this->string('category_id')->toString(),
            'period_start' => $this->periodStartForValidation(),
            'amount' => $this->integer('amount'),
        ];
    }

    public function selectedPeriod(): string
    {
        return $this->string('period')->toString();
    }

    private function periodStartForValidation(): string
    {
        $period = $this->string('period')->toString();

        if (preg_match('/^\d{4}-(0[1-9]|1[0-2])$/', $period) !== 1) {
            return '0001-01-01';
        }

        return Carbon::createFromFormat('Y-m-d', "{$period}-01")->toDateString();
    }
}
