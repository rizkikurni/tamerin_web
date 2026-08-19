<?php

namespace App\Models;

use App\Enums\AssetStatus;
use App\Enums\AssetType;
use Database\Factories\AssetFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['name', 'asset_type', 'acquired_on', 'acquisition_cost', 'current_value', 'valued_on', 'note', 'status', 'archived_at'])]
class Asset extends Model
{
    /** @use HasFactory<AssetFactory> */
    use HasFactory, HasUlids;

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'asset_type' => AssetType::class,
            'acquired_on' => 'date',
            'acquisition_cost' => 'integer',
            'current_value' => 'integer',
            'valued_on' => 'date',
            'status' => AssetStatus::class,
            'archived_at' => 'datetime',
        ];
    }
}
