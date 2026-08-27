<?php

namespace App\Actions\Obligations;

use App\Enums\ObligationKind;
use App\Enums\ObligationStatus;
use App\Models\Obligation;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UpdateObligation
{
    /** @param array{kind: string, counterparty_name: string, original_amount: int, started_on: string, due_on: string|null, note: string|null} $data */
    public function handle(Obligation $obligation, array $data): Obligation
    {
        return DB::transaction(function () use ($obligation, $data): Obligation {
            $lockedObligation = Obligation::query()
                ->whereKey($obligation->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedObligation->status !== ObligationStatus::Open) {
                throw ValidationException::withMessages([
                    'obligation' => 'Kewajiban yang sudah selesai atau diarsipkan tidak dapat diubah.',
                ]);
            }

            $paidAmount = $lockedObligation->original_amount - $lockedObligation->outstanding_amount;
            $newKind = ObligationKind::from($data['kind']);

            if ($paidAmount > 0 && $newKind !== $lockedObligation->kind) {
                throw ValidationException::withMessages([
                    'kind' => 'Jenis tidak dapat diubah setelah pelunasan pertama dicatat.',
                ]);
            }

            if ($data['original_amount'] < $paidAmount) {
                throw ValidationException::withMessages([
                    'original_amount' => 'Nominal awal tidak boleh lebih kecil dari total yang sudah dilunasi.',
                ]);
            }

            $outstandingAmount = $data['original_amount'] - $paidAmount;
            $isSettled = $outstandingAmount === 0;

            $lockedObligation->update([
                ...$data,
                'outstanding_amount' => $outstandingAmount,
                'status' => $isSettled ? ObligationStatus::Settled : ObligationStatus::Open,
                'settled_at' => $isSettled ? now() : null,
            ]);

            return $lockedObligation->refresh();
        });
    }
}
