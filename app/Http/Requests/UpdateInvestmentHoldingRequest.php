<?php

namespace App\Http\Requests;

use App\Models\InvestmentHolding;

class UpdateInvestmentHoldingRequest extends StoreInvestmentHoldingRequest
{
    public function authorize(): bool
    {
        $holding = $this->route('investment');

        return $holding instanceof InvestmentHolding
            && ($this->user()?->can('update', $holding) ?? false);
    }
}
