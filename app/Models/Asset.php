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
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $user_id
 * @property string $name
 * @property AssetType $asset_type
 * @property Carbon|null $acquired_on
 * @property int|null $acquisition_cost
 * @property int $current_value
 * @property Carbon $valued_on
 * @property string|null $note
 * @property AssetStatus $status
 * @property Carbon|null $archived_at
 */
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
