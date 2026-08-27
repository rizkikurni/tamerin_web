<?php

namespace App\Models;

use App\Enums\InvestmentValuationStatus;
use Database\Factories\InvestmentValuationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $user_id
 * @property string $investment_holding_id
 * @property Carbon $valued_on
 * @property int $value
 * @property string|null $note
 * @property InvestmentValuationStatus $status
 */
#[Fillable(['investment_holding_id', 'valued_on', 'value', 'note', 'status'])]
class InvestmentValuation extends Model
{
    /** @use HasFactory<InvestmentValuationFactory> */
    use HasFactory, HasUlids;

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<InvestmentHolding, $this> */
    public function investmentHolding(): BelongsTo
    {
        return $this->belongsTo(InvestmentHolding::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'valued_on' => 'date',
            'value' => 'integer',
            'status' => InvestmentValuationStatus::class,
        ];
    }
}
