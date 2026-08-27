<?php

namespace App\Http\Requests;

use App\Enums\AssetType;
use App\Models\Asset;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAssetRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('create', Asset::class) ?? false;
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
            'asset_type' => ['required', Rule::enum(AssetType::class)],
            'acquired_on' => ['nullable', 'date_format:Y-m-d'],
            'acquisition_cost' => ['nullable', 'integer', 'min:0'],
            'current_value' => ['required', 'integer', 'min:0'],
            'valued_on' => ['required', 'date_format:Y-m-d'],
            'note' => ['nullable', 'string', 'max:500'],
        ];
    }

    /** @return array{name: string, asset_type: string, acquired_on: string|null, acquisition_cost: int|null, current_value: int, valued_on: string, note: string|null} */
    public function assetData(): array
    {
        return [
            'name' => $this->string('name')->trim()->toString(),
            'asset_type' => $this->string('asset_type')->toString(),
            'acquired_on' => $this->filled('acquired_on') ? $this->string('acquired_on')->toString() : null,
            'acquisition_cost' => $this->filled('acquisition_cost') ? $this->integer('acquisition_cost') : null,
            'current_value' => $this->integer('current_value'),
            'valued_on' => $this->string('valued_on')->toString(),
            'note' => $this->filled('note') ? $this->string('note')->trim()->toString() : null,
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => $this->string('name')->trim()->toString(),
            'acquired_on' => $this->filled('acquired_on') ? $this->input('acquired_on') : null,
            'acquisition_cost' => $this->filled('acquisition_cost') ? $this->input('acquisition_cost') : null,
            'note' => $this->filled('note') ? $this->string('note')->trim()->toString() : null,
        ]);
    }
}
