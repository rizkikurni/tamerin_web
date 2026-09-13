<?php

namespace App\Actions\Audit;

use App\Models\AuditEvent;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class RecordAuditEvent
{
    /**
     * @param  array<string, mixed>|null  $oldValues
     * @param  array<string, mixed>|null  $newValues
     */
    public function handle(
        User $owner,
        User $actor,
        Model $auditable,
        string $action,
        ?array $oldValues,
        ?array $newValues,
        string $requestId,
    ): AuditEvent {
        $auditEvent = new AuditEvent([
            'action' => $action,
            'old_values' => $this->sanitize($oldValues),
            'new_values' => $this->sanitize($newValues),
            'request_id' => $requestId,
        ]);

        $auditEvent->user()->associate($owner);
        $auditEvent->actor()->associate($actor);
        $auditEvent->auditable()->associate($auditable);
        $auditEvent->save();

        return $auditEvent;
    }

    /** @param array<string|int, mixed>|null $values
     * @return array<string|int, mixed>|null
     */
    private function sanitize(?array $values): ?array
    {
        if ($values === null) {
            return null;
        }

        $safeValues = [];

        foreach ($values as $key => $value) {
            if (is_string($key) && Str::contains(Str::lower($key), [
                'password',
                'token',
                'secret',
                'authorization',
                'cookie',
            ])) {
                continue;
            }

            $safeValues[$key] = is_array($value)
                ? $this->sanitize($value)
                : $value;
        }

        return $safeValues;
    }
}
