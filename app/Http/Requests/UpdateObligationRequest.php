<?php

namespace App\Http\Requests;

use App\Models\Obligation;

class UpdateObligationRequest extends StoreObligationRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $obligation = $this->route('obligation');

        return $obligation instanceof Obligation
            && ($this->user()?->can('update', $obligation) ?? false);
    }
}
