<?php

namespace App\Http\Controllers;

use App\Actions\Budgets\CreateBudget;
use App\Actions\Budgets\UpdateBudget;
use App\Http\Requests\BudgetPeriodRequest;
use App\Http\Requests\StoreBudgetRequest;
use App\Http\Requests\UpdateBudgetRequest;
use App\Models\Budget;
use App\Models\User;
use App\Queries\Budgets\BudgetUsageQuery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class BudgetController extends Controller
{
    public function index(BudgetPeriodRequest $request, BudgetUsageQuery $query): Response
    {
        Gate::authorize('viewAny', Budget::class);

        /** @var User $user */
        $user = $request->user();
        $period = $request->period();

        return Inertia::render('budgets/index', [
            'period' => [
                'value' => $period->format('Y-m'),
                'label' => $period->translatedFormat('F Y'),
                'previous' => $period->copy()->subMonth()->format('Y-m'),
                'next' => $period->copy()->addMonth()->format('Y-m'),
            ],
            'budgets' => $query->paginate($user, $period),
            'summary' => $query->summary($user, $period),
            'categoryOptions' => $query->availableCategoryOptions($user, $period),
        ]);
    }

    public function store(StoreBudgetRequest $request, CreateBudget $action): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        $action->handle($user, $request->budgetData());

        return to_route('budgets.index', ['period' => $request->selectedPeriod()])
            ->with('status', 'budget-created');
    }

    public function update(
        UpdateBudgetRequest $request,
        Budget $budget,
        UpdateBudget $action,
    ): RedirectResponse {
        $action->handle($budget, $request->budgetData());

        return to_route('budgets.index', [
            'period' => $budget->period_start->format('Y-m'),
        ])->with('status', 'budget-updated');
    }
}
