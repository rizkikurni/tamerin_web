<?php

namespace App\Models;

use App\Enums\ObligationKind;
use App\Enums\ObligationStatus;
use Database\Factories\ObligationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['kind', 'counterparty_name', 'original_amount', 'outstanding_amount', 'started_on', 'due_on', 'status', 'settled_at', 'archived_at', 'note'])]
class Obligation extends Model
{
    /** @use HasFactory<ObligationFactory> */
    use HasFactory, HasUlids;

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<ObligationSettlement, $this> */
    public function settlements(): HasMany
    {
        return $this->hasMany(ObligationSettlement::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'kind' => ObligationKind::class,
            'original_amount' => 'integer',
            'outstanding_amount' => 'integer',
            'started_on' => 'date',
            'due_on' => 'date',
            'status' => ObligationStatus::class,
            'settled_at' => 'datetime',
            'archived_at' => 'datetime',
        ];
    }
}
