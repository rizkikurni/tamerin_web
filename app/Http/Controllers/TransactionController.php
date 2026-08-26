<?php

namespace App\Http\Controllers;

use App\Actions\Transactions\RecordTransaction;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Http\Requests\IndexTransactionRequest;
use App\Http\Requests\StoreTransactionRequest;
use App\Models\Category;
use App\Models\FinancialAccount;
use App\Models\Transaction;
use App\Models\User;
use App\Queries\Transactions\TransactionIndexQuery;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(
        IndexTransactionRequest $request,
        TransactionIndexQuery $query,
    ): Response {
        /** @var User $user */
        $user = $request->user();
        $filters = $request->filters();

        return Inertia::render('transactions/index', [
            'transactions' => $query->paginate($user, $filters),
            'filters' => $filters,
            'filterOptions' => [
                'types' => $this->transactionTypes(),
                'statuses' => $this->transactionStatuses(),
                'accounts' => $this->accountOptions($user, false),
                'categories' => $this->categoryOptions($user, false),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        Gate::authorize('create', Transaction::class);

        /** @var User $user */
        $user = $request->user();

        return Inertia::render('transactions/create', [
            'transactionTypes' => $this->transactionTypes(),
            'accounts' => $this->accountOptions($user, true),
            'categories' => $this->categoryOptions($user, true),
            'idempotencyKey' => (string) Str::uuid(),
            'defaultDate' => today()->toDateString(),
        ]);
    }

    public function store(
        StoreTransactionRequest $request,
        RecordTransaction $action,
    ): RedirectResponse {
        /** @var User $user */
        $user = $request->user();
        $transaction = $action->handle($user, $request->transactionData());

        return to_route('transactions.show', $transaction)
            ->with('status', 'transaction-created');
    }

    public function show(Transaction $transaction): Response
    {
        Gate::authorize('view', $transaction);

        $transaction->loadMissing([
            'account:id,name',
            'destinationAccount:id,name',
            'category:id,name,type',
        ]);

        return Inertia::render('transactions/show', [
            'transaction' => [
                'id' => $transaction->id,
                'type' => $transaction->type->value,
                'amount' => $transaction->amount,
                'transacted_on' => $transaction->transacted_on->toDateString(),
                'note' => $transaction->note,
                'status' => $transaction->status->value,
                'voided_at' => $transaction->voided_at?->toISOString(),
                'void_reason' => $transaction->void_reason,
                'created_at' => $transaction->created_at?->toISOString(),
                'account' => [
                    'id' => $transaction->account->id,
                    'name' => $transaction->account->name,
                ],
                'destination_account' => $transaction->destinationAccount === null
                    ? null
                    : [
                        'id' => $transaction->destinationAccount->id,
                        'name' => $transaction->destinationAccount->name,
                    ],
                'category' => $transaction->category === null
                    ? null
                    : [
                        'id' => $transaction->category->id,
                        'name' => $transaction->category->name,
                        'type' => $transaction->category->type->value,
                    ],
                'can_void' => Gate::allows('void', $transaction),
            ],
        ]);
    }

    /** @return list<array{value: string, label: string}> */
    private function transactionTypes(): array
    {
        return [
            ['value' => TransactionType::Income->value, 'label' => 'Pemasukan'],
            ['value' => TransactionType::Expense->value, 'label' => 'Pengeluaran'],
            ['value' => TransactionType::Transfer->value, 'label' => 'Transfer'],
        ];
    }

    /** @return list<array{value: string, label: string}> */
    private function transactionStatuses(): array
    {
        return [
            ['value' => TransactionStatus::Posted->value, 'label' => 'Tercatat'],
            ['value' => TransactionStatus::Voided->value, 'label' => 'Dibatalkan'],
        ];
    }

    /** @return list<array{id: string, name: string}> */
    private function accountOptions(User $user, bool $onlyActive): array
    {
        $options = $user->financialAccounts()
            ->when($onlyActive, fn (Builder $query): Builder => $query->active())
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (FinancialAccount $account): array => [
                'id' => $account->id,
                'name' => $account->name,
            ])
            ->all();

        return array_values($options);
    }

    /** @return list<array{id: string, name: string, type: string}> */
    private function categoryOptions(User $user, bool $onlyActive): array
    {
        $options = $user->categories()
            ->when($onlyActive, fn (Builder $query): Builder => $query->active())
            ->orderBy('name')
            ->get(['id', 'name', 'type'])
            ->map(fn (Category $category): array => [
                'id' => $category->id,
                'name' => $category->name,
                'type' => $category->type->value,
            ])
            ->all();

        return array_values($options);
    }
}
