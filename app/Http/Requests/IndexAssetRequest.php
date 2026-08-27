<?php

namespace App\Http\Requests;

use App\Enums\AssetStatus;
use App\Enums\AssetType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexAssetRequest extends FormRequest
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
     * @return array<string, array<mixed>>
     */
    public function rules(): array
    {
        return [
            'asset_type' => ['nullable', Rule::enum(AssetType::class)],
            'status' => ['nullable', Rule::enum(AssetStatus::class)],
        ];
    }

    /** @return array{asset_type: string|null, status: string|null} */
    public function filters(): array
    {
        return [
            'asset_type' => $this->string('asset_type')->toString() ?: null,
            'status' => $this->string('status')->toString() ?: null,
        ];
    }
}
