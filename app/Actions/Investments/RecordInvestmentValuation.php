<?php

namespace App\Actions\Investments;

use App\Actions\Audit\RecordAuditEvent;
use App\Enums\InvestmentHoldingStatus;
use App\Enums\InvestmentValuationStatus;
use App\Models\InvestmentHolding;
use App\Models\InvestmentValuation;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RecordInvestmentValuation
{
    public function __construct(
        private SyncInvestmentLastValuationDate $syncLastValuationDate,
        private RecordAuditEvent $recordAuditEvent,
    ) {}

    /** @param array{valued_on: string, value: int, note: string|null} $data */
    public function handle(
        User $user,
        InvestmentHolding $holding,
        array $data,
        string $requestId,
    ): InvestmentValuation {
        return DB::transaction(function () use ($user, $holding, $data, $requestId): InvestmentValuation {
            $lockedHolding = InvestmentHolding::query()
                ->whereBelongsTo($user)
                ->whereKey($holding->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedHolding->status !== InvestmentHoldingStatus::Active) {
                throw ValidationException::withMessages([
                    'valued_on' => 'Investasi yang sudah diarsipkan tidak menerima valuasi baru.',
                ]);
            }

            $dateAlreadyUsed = InvestmentValuation::query()
                ->whereBelongsTo($lockedHolding, 'investmentHolding')
                ->whereDate('valued_on', $data['valued_on'])
                ->exists();

            if ($dateAlreadyUsed) {
                throw ValidationException::withMessages([
                    'valued_on' => 'Tanggal ini sudah mempunyai valuasi, termasuk riwayat yang dibatalkan.',
                ]);
            }

            $valuation = new InvestmentValuation([
                ...$data,
                'status' => InvestmentValuationStatus::Active,
            ]);
            $valuation->user()->associate($user);
            $valuation->investmentHolding()->associate($lockedHolding);
            $valuation->save();

            $this->syncLastValuationDate->handle($lockedHolding);
            $this->recordAuditEvent->handle(
                owner: $user,
                actor: $user,
                auditable: $valuation,
                action: 'investment_valuation.recorded',
                oldValues: null,
                newValues: [
                    'investment_holding_id' => $lockedHolding->id,
                    'valued_on' => $valuation->valued_on->toDateString(),
                    'value' => $valuation->value,
                    'note' => $valuation->note,
                    'status' => $valuation->status->value,
                ],
                requestId: $requestId,
            );

            return $valuation->refresh();
        });
    }
}
