<?php

namespace App\Actions\Audit;

use App\Models\AuditEvent;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

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
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'request_id' => $requestId,
        ]);

        $auditEvent->user()->associate($owner);
        $auditEvent->actor()->associate($actor);
        $auditEvent->auditable()->associate($auditable);
        $auditEvent->save();

        return $auditEvent;
    }
}
