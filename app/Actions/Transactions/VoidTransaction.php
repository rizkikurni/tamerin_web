<?php

namespace App\Actions\Transactions;

use App\Actions\Audit\RecordAuditEvent;
use App\Enums\TransactionStatus;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class VoidTransaction
{
    public function __construct(private RecordAuditEvent $recordAuditEvent) {}

    public function handle(
        Transaction $transaction,
        User $actor,
        string $reason,
        string $requestId,
    ): Transaction {
        return DB::transaction(function () use ($transaction, $actor, $reason, $requestId): Transaction {
            $lockedTransaction = Transaction::query()
                ->whereKey($transaction->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedTransaction->status === TransactionStatus::Voided) {
                throw ValidationException::withMessages([
                    'void_reason' => 'Transaksi ini sudah dibatalkan.',
                ]);
            }

            $oldValues = [
                'status' => $lockedTransaction->status->value,
                'voided_at' => $lockedTransaction->voided_at?->toISOString(),
                'void_reason' => $lockedTransaction->void_reason,
            ];

            $lockedTransaction->update([
                'status' => TransactionStatus::Voided,
                'voided_at' => now(),
                'void_reason' => $reason,
            ]);

            /** @var User $owner */
            $owner = $lockedTransaction->user()->firstOrFail();

            $this->recordAuditEvent->handle(
                owner: $owner,
                actor: $actor,
                auditable: $lockedTransaction,
                action: 'transaction.voided',
                oldValues: $oldValues,
                newValues: [
                    'status' => $lockedTransaction->status->value,
                    'voided_at' => $lockedTransaction->voided_at?->toISOString(),
                    'void_reason' => $lockedTransaction->void_reason,
                ],
                requestId: $requestId,
            );

            return $lockedTransaction->refresh();
        });
    }
}
