<?php

namespace App\Actions\Transactions;

use App\Enums\CategoryType;
use App\Enums\FinancialAccountStatus;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\Category;
use App\Models\FinancialAccount;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RecordTransaction
{
    /**
     * @param array{
     *     type: string,
     *     amount: int,
     *     transacted_on: string,
     *     account_id: string,
     *     destination_account_id: string|null,
     *     category_id: string|null,
     *     note: string|null,
     *     idempotency_key: string
     * } $data
     */
    public function handle(User $user, array $data): Transaction
    {
        return DB::transaction(function () use ($user, $data): Transaction {
            User::query()->whereKey($user->id)->lockForUpdate()->firstOrFail();

            $existingTransaction = Transaction::query()
                ->whereBelongsTo($user)
                ->where('idempotency_key', $data['idempotency_key'])
                ->first();

            if ($existingTransaction !== null) {
                return $existingTransaction;
            }

            $type = TransactionType::from($data['type']);
            $this->activeAccount($user, $data['account_id'], 'account_id');

            if ($type === TransactionType::Transfer) {
                $this->validateTransfer($user, $data);
            } else {
                $this->validateCategory($user, $data['category_id'], $type);
            }

            $transaction = new Transaction([
                ...$data,
                'destination_account_id' => $type === TransactionType::Transfer
                    ? $data['destination_account_id']
                    : null,
                'category_id' => $type === TransactionType::Transfer
                    ? null
                    : $data['category_id'],
                'status' => TransactionStatus::Posted,
                'voided_at' => null,
                'void_reason' => null,
            ]);

            $transaction->user()->associate($user);
            $transaction->creator()->associate($user);
            $transaction->save();

            return $transaction;
        });
    }

    /** @param array<string, mixed> $data */
    private function validateTransfer(User $user, array $data): void
    {
        if ($data['destination_account_id'] === null) {
            throw ValidationException::withMessages([
                'destination_account_id' => 'Akun tujuan wajib dipilih untuk transfer.',
            ]);
        }

        if ($data['destination_account_id'] === $data['account_id']) {
            throw ValidationException::withMessages([
                'destination_account_id' => 'Akun tujuan harus berbeda dari akun asal.',
            ]);
        }

        $this->activeAccount($user, $data['destination_account_id'], 'destination_account_id');
    }

    private function validateCategory(
        User $user,
        ?string $categoryId,
        TransactionType $type,
    ): void {
        if ($categoryId === null) {
            throw ValidationException::withMessages([
                'category_id' => 'Kategori wajib dipilih untuk transaksi ini.',
            ]);
        }

        $expectedType = $type === TransactionType::Income
            ? CategoryType::Income
            : CategoryType::Expense;

        $category = Category::query()
            ->whereKey($categoryId)
            ->whereBelongsTo($user)
            ->active()
            ->where('type', $expectedType)
            ->lockForUpdate()
            ->first();

        if ($category === null) {
            throw ValidationException::withMessages([
                'category_id' => 'Kategori tidak valid atau tidak sesuai dengan tipe transaksi.',
            ]);
        }
    }

    private function activeAccount(User $user, string $accountId, string $field): void
    {
        $account = FinancialAccount::query()
            ->whereKey($accountId)
            ->whereBelongsTo($user)
            ->where('status', FinancialAccountStatus::Active)
            ->whereNull('archived_at')
            ->lockForUpdate()
            ->first();

        if ($account === null) {
            throw ValidationException::withMessages([
                $field => 'Akun keuangan tidak valid atau sudah diarsipkan.',
            ]);
        }
    }
}
