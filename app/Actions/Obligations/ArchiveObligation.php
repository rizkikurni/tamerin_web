<?php

namespace App\Actions\Obligations;

use App\Enums\ObligationStatus;
use App\Models\Obligation;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ArchiveObligation
{
    public function handle(Obligation $obligation): Obligation
    {
        return DB::transaction(function () use ($obligation): Obligation {
            $lockedObligation = Obligation::query()
                ->whereKey($obligation->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedObligation->status !== ObligationStatus::Settled) {
                throw ValidationException::withMessages([
                    'obligation' => 'Hanya utang atau piutang yang sudah lunas yang dapat diarsipkan.',
                ]);
            }

            $lockedObligation->update([
                'status' => ObligationStatus::Archived,
                'archived_at' => now(),
            ]);

            return $lockedObligation->refresh();
        });
    }
}
