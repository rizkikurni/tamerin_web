<?php

namespace App\Models;

use App\Enums\InvestmentHoldingStatus;
use App\Enums\InvestmentInstrumentType;
use Database\Factories\InvestmentHoldingFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $user_id
 * @property string $name
 * @property InvestmentInstrumentType $instrument_type
 * @property int $acquisition_cost
 * @property Carbon $acquired_on
 * @property string|null $units
 * @property InvestmentHoldingStatus $status
 * @property Carbon|null $last_valuation_at
 * @property Carbon|null $archived_at
 */
#[Fillable(['name', 'instrument_type', 'acquisition_cost', 'acquired_on', 'units', 'status', 'last_valuation_at', 'archived_at'])]
class InvestmentHolding extends Model
{
    /** @use HasFactory<InvestmentHoldingFactory> */
    use HasFactory, HasUlids;

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<InvestmentValuation, $this> */
    public function valuations(): HasMany
    {
        return $this->hasMany(InvestmentValuation::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'instrument_type' => InvestmentInstrumentType::class,
            'acquisition_cost' => 'integer',
            'acquired_on' => 'date',
            'units' => 'decimal:8',
            'status' => InvestmentHoldingStatus::class,
            'last_valuation_at' => 'date',
            'archived_at' => 'datetime',
        ];
    }
}
