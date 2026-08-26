<?php

namespace App\Http\Requests;

use App\Enums\CategoryType;
use App\Models\Category;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $category = $this->route('category');

        return $category instanceof Category
            && ($this->user()?->can('update', $category) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Category $category */
        $category = $this->route('category');

        return [
            'name' => [
                'required',
                'string',
                'max:60',
                Rule::unique(Category::class)
                    ->where('user_id', $this->user()?->getAuthIdentifier())
                    ->where('type', $this->string('type')->toString())
                    ->ignore($category),
            ],
            'type' => ['required', Rule::enum(CategoryType::class)],
            'color_token' => ['nullable', 'string', 'alpha_dash:ascii', 'max:40'],
            'icon' => ['nullable', 'string', 'alpha_dash:ascii', 'max:40'],
        ];
    }

    /** @return array{name: string, type: string, color_token: string|null, icon: string|null} */
    public function categoryData(): array
    {
        return [
            'name' => $this->string('name')->toString(),
            'type' => $this->string('type')->toString(),
            'color_token' => $this->string('color_token')->toString() ?: null,
            'icon' => $this->string('icon')->toString() ?: null,
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['name' => $this->string('name')->trim()->toString()]);
    }
}
