<?php

namespace App\Http\Controllers;

use App\Actions\Obligations\CreateObligation;
use App\Actions\Obligations\UpdateObligation;
use App\Enums\ObligationKind;
use App\Enums\ObligationStatus;
use App\Http\Requests\IndexObligationRequest;
use App\Http\Requests\StoreObligationRequest;
use App\Http\Requests\UpdateObligationRequest;
use App\Models\Obligation;
use App\Models\User;
use App\Queries\Obligations\ObligationDetailQuery;
use App\Queries\Obligations\ObligationIndexQuery;
use App\Queries\Obligations\ObligationSummaryQuery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ObligationController extends Controller
{
    public function index(
        IndexObligationRequest $request,
        ObligationIndexQuery $indexQuery,
        ObligationSummaryQuery $summaryQuery,
    ): Response {
        Gate::authorize('viewAny', Obligation::class);

        /** @var User $user */
        $user = $request->user();
        $filters = $request->filters();

        return Inertia::render('obligations/index', [
            'obligations' => $indexQuery->paginate($user, $filters),
            'summary' => $summaryQuery->get($user),
            'filters' => $filters,
            'kindOptions' => $this->kindOptions(),
            'statusOptions' => $this->statusOptions(),
            'dueFilterOptions' => $this->dueFilterOptions(),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Obligation::class);

        return Inertia::render('obligations/create', [
            'kindOptions' => $this->kindOptions(),
            'defaultStartedOn' => today()->toDateString(),
        ]);
    }

    public function store(StoreObligationRequest $request, CreateObligation $action): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        $obligation = $action->handle($user, $request->obligationData());

        return to_route('obligations.show', $obligation)
            ->with('status', 'obligation-created');
    }

    public function show(
        Request $request,
        Obligation $obligation,
        ObligationDetailQuery $query,
    ): Response {
        Gate::authorize('view', $obligation);

        /** @var User $user */
        $user = $request->user();

        return Inertia::render('obligations/show', [
            'obligation' => $query->obligation($obligation),
            'settlements' => $query->settlements($obligation),
            'accountOptions' => $query->accountOptions($user),
            'permissions' => [
                'canEdit' => Gate::allows('update', $obligation),
                'canArchive' => Gate::allows('archive', $obligation),
                'canSettle' => Gate::allows('settle', $obligation),
            ],
            'defaultSettlementDate' => today()->toDateString(),
            'idempotencyKey' => Str::uuid()->toString(),
        ]);
    }

    public function edit(Obligation $obligation): Response
    {
        Gate::authorize('update', $obligation);

        return Inertia::render('obligations/edit', [
            'obligation' => [
                'id' => $obligation->id,
                'kind' => $obligation->kind->value,
                'counterparty_name' => $obligation->counterparty_name,
                'original_amount' => $obligation->original_amount,
                'started_on' => $obligation->started_on->toDateString(),
                'due_on' => $obligation->due_on?->toDateString(),
                'note' => $obligation->note,
            ],
            'kindOptions' => $this->kindOptions(),
        ]);
    }

    public function update(
        UpdateObligationRequest $request,
        Obligation $obligation,
        UpdateObligation $action,
    ): RedirectResponse {
        $action->handle($obligation, $request->obligationData());

        return to_route('obligations.show', $obligation)
            ->with('status', 'obligation-updated');
    }

    /** @return list<array{value: string, label: string}> */
    private function kindOptions(): array
    {
        return [
            ['value' => ObligationKind::Debt->value, 'label' => 'Utang'],
            ['value' => ObligationKind::Receivable->value, 'label' => 'Piutang'],
        ];
    }

    /** @return list<array{value: string, label: string}> */
    private function statusOptions(): array
    {
        return [
            ['value' => ObligationStatus::Open->value, 'label' => 'Berjalan'],
            ['value' => ObligationStatus::Settled->value, 'label' => 'Lunas'],
            ['value' => ObligationStatus::Archived->value, 'label' => 'Diarsipkan'],
        ];
    }

    /** @return list<array{value: string, label: string}> */
    private function dueFilterOptions(): array
    {
        return [
            ['value' => 'due_soon', 'label' => 'Jatuh tempo 7 hari'],
            ['value' => 'overdue', 'label' => 'Terlambat'],
            ['value' => 'no_due', 'label' => 'Tanpa jatuh tempo'],
        ];
    }
}
