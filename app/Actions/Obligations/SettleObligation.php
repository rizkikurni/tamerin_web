<?php

namespace App\Actions\Obligations;

use App\Actions\Audit\RecordAuditEvent;
use App\Enums\FinancialAccountStatus;
use App\Enums\ObligationKind;
use App\Enums\ObligationStatus;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\FinancialAccount;
use App\Models\Obligation;
use App\Models\ObligationSettlement;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SettleObligation
{
    public function __construct(private RecordAuditEvent $recordAuditEvent) {}

    /** @param array{amount: int, account_id: string, settled_on: string, note: string|null, idempotency_key: string} $data */
    public function handle(
        User $user,
        Obligation $obligation,
        array $data,
        string $requestId,
    ): ObligationSettlement {
        return DB::transaction(function () use ($user, $obligation, $data, $requestId): ObligationSettlement {
            User::query()->whereKey($user->id)->lockForUpdate()->firstOrFail();

            $existingSettlement = ObligationSettlement::query()
                ->whereBelongsTo($user)
                ->where('idempotency_key', $data['idempotency_key'])
                ->first();

            if ($existingSettlement !== null) {
                return $existingSettlement;
            }

            $lockedObligation = Obligation::query()
                ->whereBelongsTo($user)
                ->whereKey($obligation->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedObligation->status !== ObligationStatus::Open) {
                throw ValidationException::withMessages([
                    'amount' => 'Kewajiban yang sudah selesai atau diarsipkan tidak menerima pelunasan baru.',
                ]);
            }

            if ($data['amount'] > $lockedObligation->outstanding_amount) {
                throw ValidationException::withMessages([
                    'amount' => 'Nominal pelunasan tidak boleh melebihi sisa outstanding.',
                ]);
            }

            $account = FinancialAccount::query()
                ->whereBelongsTo($user)
                ->whereKey($data['account_id'])
                ->where('status', FinancialAccountStatus::Active)
                ->whereNull('archived_at')
                ->lockForUpdate()
                ->first();

            if ($account === null) {
                throw ValidationException::withMessages([
                    'account_id' => 'Akun keuangan tidak valid atau sudah diarsipkan.',
                ]);
            }

            $transactionKeyAlreadyUsed = Transaction::query()
                ->whereBelongsTo($user)
                ->where('idempotency_key', $data['idempotency_key'])
                ->exists();

            if ($transactionKeyAlreadyUsed) {
                throw ValidationException::withMessages([
                    'idempotency_key' => 'Kunci permintaan sudah digunakan oleh transaksi lain.',
                ]);
            }

            $transaction = new Transaction([
                'type' => $lockedObligation->kind === ObligationKind::Debt
                    ? TransactionType::Expense
                    : TransactionType::Income,
                'amount' => $data['amount'],
                'transacted_on' => $data['settled_on'],
                'account_id' => $account->id,
                'destination_account_id' => null,
                'category_id' => null,
                'note' => $data['note'],
                'status' => TransactionStatus::Posted,
                'voided_at' => null,
                'void_reason' => null,
                'idempotency_key' => $data['idempotency_key'],
            ]);
            $transaction->user()->associate($user);
            $transaction->creator()->associate($user);
            $transaction->save();

            $settlement = new ObligationSettlement($data);
            $settlement->user()->associate($user);
            $settlement->obligation()->associate($lockedObligation);
            $settlement->account()->associate($account);
            $settlement->transaction()->associate($transaction);
            $settlement->save();

            $oldOutstandingAmount = $lockedObligation->outstanding_amount;
            $outstandingAmount = $oldOutstandingAmount - $data['amount'];
            $isSettled = $outstandingAmount === 0;

            $lockedObligation->update([
                'outstanding_amount' => $outstandingAmount,
                'status' => $isSettled ? ObligationStatus::Settled : ObligationStatus::Open,
                'settled_at' => $isSettled ? now() : null,
            ]);

            $this->recordAuditEvent->handle(
                owner: $user,
                actor: $user,
                auditable: $settlement,
                action: 'obligation.settlement_recorded',
                oldValues: [
                    'outstanding_amount' => $oldOutstandingAmount,
                    'status' => ObligationStatus::Open->value,
                ],
                newValues: [
                    'obligation_id' => $lockedObligation->id,
                    'transaction_id' => $transaction->id,
                    'amount' => $settlement->amount,
                    'outstanding_amount' => $outstandingAmount,
                    'status' => $lockedObligation->status->value,
                ],
                requestId: $requestId,
            );

            return $settlement->refresh();
        }, attempts: 3);
    }
}
