<?php

namespace App\Http\Controllers;

use App\Actions\Obligations\ArchiveObligation;
use App\Models\Obligation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

class ArchiveObligationController extends Controller
{
    public function __invoke(Obligation $obligation, ArchiveObligation $action): RedirectResponse
    {
        Gate::authorize('archive', $obligation);
        $action->handle($obligation);

        return to_route('obligations.index')
            ->with('status', 'obligation-archived');
    }
}
