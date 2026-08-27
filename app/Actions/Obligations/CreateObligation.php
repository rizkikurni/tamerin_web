<?php

namespace App\Actions\Obligations;

use App\Enums\ObligationStatus;
use App\Models\Obligation;
use App\Models\User;

class CreateObligation
{
    /** @param array{kind: string, counterparty_name: string, original_amount: int, started_on: string, due_on: string|null, note: string|null} $data */
    public function handle(User $user, array $data): Obligation
    {
        return $user->obligations()->create([
            ...$data,
            'outstanding_amount' => $data['original_amount'],
            'status' => ObligationStatus::Open,
            'settled_at' => null,
            'archived_at' => null,
        ]);
    }
}
