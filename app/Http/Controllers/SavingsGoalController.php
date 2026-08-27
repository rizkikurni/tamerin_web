<?php

namespace App\Http\Controllers;

use App\Actions\SavingsGoals\CreateSavingsGoal;
use App\Actions\SavingsGoals\UpdateSavingsGoal;
use App\Enums\SavingsGoalStatus;
use App\Http\Requests\IndexSavingsGoalRequest;
use App\Http\Requests\StoreSavingsGoalRequest;
use App\Http\Requests\UpdateSavingsGoalRequest;
use App\Models\SavingsGoal;
use App\Models\User;
use App\Queries\SavingsGoals\SavingsGoalDetailQuery;
use App\Queries\SavingsGoals\SavingsGoalIndexQuery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class SavingsGoalController extends Controller
{
    public function index(
        IndexSavingsGoalRequest $request,
        SavingsGoalIndexQuery $query,
    ): Response {
        Gate::authorize('viewAny', SavingsGoal::class);

        /** @var User $user */
        $user = $request->user();
        $filters = $request->filters();

        return Inertia::render('savings-goals/index', [
            'goals' => $query->paginate($user, $filters),
            'summary' => $query->summary($user),
            'filters' => $filters,
            'statusOptions' => $this->statusOptions(),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', SavingsGoal::class);

        return Inertia::render('savings-goals/create');
    }

    public function store(
        StoreSavingsGoalRequest $request,
        CreateSavingsGoal $action,
    ): RedirectResponse {
        /** @var User $user */
        $user = $request->user();
        $action->handle($user, $request->goalData());

        return to_route('savings-goals.index')
            ->with('status', 'savings-goal-created');
    }

    public function show(
        Request $request,
        SavingsGoal $savingsGoal,
        SavingsGoalDetailQuery $query,
    ): Response {
        Gate::authorize('view', $savingsGoal);

        /** @var User $user */
        $user = $request->user();

        return Inertia::render('savings-goals/show', [
            'goal' => $query->goal($savingsGoal),
            'contributions' => $query->contributions($savingsGoal),
            'accountOptions' => $query->accountOptions($user),
            'permissions' => [
                'canEdit' => Gate::allows('update', $savingsGoal),
                'canArchive' => Gate::allows('archive', $savingsGoal),
                'canContribute' => Gate::allows('contribute', $savingsGoal),
            ],
            'defaultContributionDate' => today()->toDateString(),
        ]);
    }

    public function edit(SavingsGoal $savingsGoal): Response
    {
        Gate::authorize('update', $savingsGoal);

        return Inertia::render('savings-goals/edit', [
            'goal' => [
                'id' => $savingsGoal->id,
                'name' => $savingsGoal->name,
                'target_amount' => $savingsGoal->target_amount,
                'target_date' => $savingsGoal->target_date?->toDateString(),
            ],
        ]);
    }

    public function update(
        UpdateSavingsGoalRequest $request,
        SavingsGoal $savingsGoal,
        UpdateSavingsGoal $action,
    ): RedirectResponse {
        $action->handle($savingsGoal, $request->goalData());

        return to_route('savings-goals.show', $savingsGoal)
            ->with('status', 'savings-goal-updated');
    }

    /** @return list<array{value: string, label: string}> */
    private function statusOptions(): array
    {
        return [
            ['value' => SavingsGoalStatus::Active->value, 'label' => 'Aktif'],
            ['value' => SavingsGoalStatus::Completed->value, 'label' => 'Selesai'],
            ['value' => SavingsGoalStatus::Archived->value, 'label' => 'Diarsipkan'],
        ];
    }
}
