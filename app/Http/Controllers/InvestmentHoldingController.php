<?php

namespace App\Http\Controllers;

use App\Actions\Investments\CreateInvestmentHolding;
use App\Actions\Investments\UpdateInvestmentHolding;
use App\Enums\InvestmentHoldingStatus;
use App\Enums\InvestmentInstrumentType;
use App\Http\Requests\IndexInvestmentHoldingRequest;
use App\Http\Requests\StoreInvestmentHoldingRequest;
use App\Http\Requests\UpdateInvestmentHoldingRequest;
use App\Models\InvestmentHolding;
use App\Models\User;
use App\Queries\Investments\InvestmentHoldingDetailQuery;
use App\Queries\Investments\InvestmentHoldingIndexQuery;
use App\Queries\Investments\InvestmentPerformanceQuery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class InvestmentHoldingController extends Controller
{
    public function index(
        IndexInvestmentHoldingRequest $request,
        InvestmentHoldingIndexQuery $query,
        InvestmentPerformanceQuery $performanceQuery,
    ): Response {
        Gate::authorize('viewAny', InvestmentHolding::class);

        /** @var User $user */
        $user = $request->user();
        $filters = $request->filters();

        return Inertia::render('investments/index', [
            'investments' => $query->paginate($user, $filters),
            'summary' => $performanceQuery->summary($user),
            'filters' => $filters,
            'instrumentOptions' => $this->instrumentOptions(),
            'statusOptions' => $this->statusOptions(),
            'valuationConditionOptions' => $this->valuationConditionOptions(),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', InvestmentHolding::class);

        return Inertia::render('investments/create', [
            'instrumentOptions' => $this->instrumentOptions(),
            'defaultAcquiredOn' => today()->toDateString(),
        ]);
    }

    public function store(
        StoreInvestmentHoldingRequest $request,
        CreateInvestmentHolding $action,
    ): RedirectResponse {
        /** @var User $user */
        $user = $request->user();
        $holding = $action->handle($user, $request->holdingData());

        return to_route('investments.show', $holding)
            ->with('status', 'investment-created');
    }

    public function show(
        InvestmentHolding $investment,
        InvestmentHoldingDetailQuery $query,
    ): Response {
        Gate::authorize('view', $investment);

        return Inertia::render('investments/show', [
            'investment' => $query->holding($investment),
            'valuations' => $query->valuations($investment),
            'chart' => $query->chart($investment),
            'permissions' => [
                'canEdit' => Gate::allows('update', $investment),
                'canArchive' => Gate::allows('archive', $investment),
                'canValue' => Gate::allows('value', $investment),
            ],
            'defaultValuedOn' => today()->toDateString(),
        ]);
    }

    public function edit(InvestmentHolding $investment): Response
    {
        Gate::authorize('update', $investment);

        return Inertia::render('investments/edit', [
            'investment' => [
                'id' => $investment->id,
                'name' => $investment->name,
                'instrument_type' => $investment->instrument_type->value,
                'acquisition_cost' => $investment->acquisition_cost,
                'acquired_on' => $investment->acquired_on->toDateString(),
                'units' => $investment->units,
            ],
            'instrumentOptions' => $this->instrumentOptions(),
        ]);
    }

    public function update(
        UpdateInvestmentHoldingRequest $request,
        InvestmentHolding $investment,
        UpdateInvestmentHolding $action,
    ): RedirectResponse {
        $action->handle($investment, $request->holdingData());

        return to_route('investments.show', $investment)
            ->with('status', 'investment-updated');
    }

    /** @return list<array{value: string, label: string}> */
    private function instrumentOptions(): array
    {
        return [
            ['value' => InvestmentInstrumentType::Stock->value, 'label' => 'Saham'],
            ['value' => InvestmentInstrumentType::MutualFund->value, 'label' => 'Reksa Dana'],
            ['value' => InvestmentInstrumentType::Crypto->value, 'label' => 'Crypto'],
            ['value' => InvestmentInstrumentType::Bond->value, 'label' => 'Obligasi'],
            ['value' => InvestmentInstrumentType::Gold->value, 'label' => 'Emas'],
            ['value' => InvestmentInstrumentType::Other->value, 'label' => 'Lainnya'],
        ];
    }

    /** @return list<array{value: string, label: string}> */
    private function statusOptions(): array
    {
        return [
            ['value' => InvestmentHoldingStatus::Active->value, 'label' => 'Aktif'],
            ['value' => InvestmentHoldingStatus::Archived->value, 'label' => 'Diarsipkan'],
        ];
    }

    /** @return list<array{value: string, label: string}> */
    private function valuationConditionOptions(): array
    {
        return [
            ['value' => 'current', 'label' => 'Terbaru'],
            ['value' => 'stale', 'label' => 'Perlu diperbarui'],
            ['value' => 'unvalued', 'label' => 'Belum dinilai'],
        ];
    }
}
