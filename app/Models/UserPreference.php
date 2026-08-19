<?php

namespace App\Models;

use App\Enums\ThemeMode;
use App\Enums\ThemePreset;
use Database\Factories\UserPreferenceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $user_id
 * @property ThemeMode $theme_mode
 * @property ThemePreset $theme_preset
 * @property string|null $primary_hex
 * @property string|null $secondary_hex
 * @property string|null $accent_hex
 * @property string $timezone
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['theme_mode', 'theme_preset', 'primary_hex', 'secondary_hex', 'accent_hex', 'timezone'])]
class UserPreference extends Model
{
    /** @use HasFactory<UserPreferenceFactory> */
    use HasFactory, HasUlids;

    protected $attributes = [
        'timezone' => 'Asia/Jakarta',
    ];

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
            'theme_mode' => ThemeMode::class,
            'theme_preset' => ThemePreset::class,
        ];
    }
}
