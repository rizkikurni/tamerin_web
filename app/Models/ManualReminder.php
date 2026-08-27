<?php

namespace App\Models;

use App\Enums\ManualReminderStatus;
use Database\Factories\ManualReminderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $user_id
 * @property string $title
 * @property Carbon|null $due_on
 * @property string|null $note
 * @property ManualReminderStatus $status
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
#[Fillable(['title', 'due_on', 'note', 'status'])]
class ManualReminder extends Model
{
    /** @use HasFactory<ManualReminderFactory> */
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
            'due_on' => 'date',
            'status' => ManualReminderStatus::class,
        ];
    }
}
