<?php

namespace Database\Factories;

use App\Enums\TransactionStatus;
use App\Models\AuditEvent;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<AuditEvent>
 */
class AuditEventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'actor_id' => fn (array $attributes): string => $attributes['user_id'],
            'action' => 'transaction.created',
            'auditable_type' => Transaction::class,
            'auditable_id' => fn (array $attributes): string => Transaction::factory()->create([
                'user_id' => $attributes['user_id'],
                'created_by' => $attributes['user_id'],
            ])->id,
            'old_values' => null,
            'new_values' => ['status' => TransactionStatus::Posted->value],
            'request_id' => (string) Str::uuid(),
        ];
    }
}
