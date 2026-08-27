<?php

namespace App\Queries\Dashboard;

use App\Enums\BudgetUsageStatus;
use App\Enums\InvestmentHoldingStatus;
use App\Enums\ObligationKind;
use App\Enums\ObligationStatus;
use App\Enums\SavingsContributionStatus;
use App\Enums\SavingsGoalStatus;
use App\Models\InvestmentHolding;
use App\Models\Obligation;
use App\Models\SavingsGoal;
use App\Models\User;
use App\Queries\Budgets\BudgetUsageQuery;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;

/**
 * @phpstan-type SystemReminder array{
 *     id: string,
 *     type: 'budget'|'obligation'|'savings'|'investment',
 *     title: string,
 *     message: string,
 *     priority: 'high'|'medium'|'low',
 *     href: string
 * }
 */
class SystemReminderQuery
{
    public function __construct(private BudgetUsageQuery $budgetUsageQuery) {}

    /**
     * @return list<SystemReminder>
     */
    public function get(User $user, CarbonInterface $date, int $limit = 8): array
    {
        $reminders = [
            ...$this->budgetReminders($user, $date),
            ...$this->obligationReminders($user, $date),
            ...$this->savingsReminders($user, $date),
            ...$this->investmentReminders($user, $date),
        ];

        usort(
            $reminders,
            fn (array $left, array $right): int => match ($left['priority']) {
                'high' => 1,
                'medium' => 2,
                default => 3,
            } <=> match ($right['priority']) {
                'high' => 1,
                'medium' => 2,
                default => 3,
            },
        );

        return array_slice($reminders, 0, $limit);
    }

    /** @return list<SystemReminder> */
    private function budgetReminders(User $user, CarbonInterface $date): array
    {
        $reminders = [];

        foreach ($this->budgetUsageQuery->get($user, $date->copy()->startOfMonth()) as $budget) {
            if ($budget['percentage'] >= 80) {
                $reminders[] = $this->budgetReminder($budget);
            }
        }

        return $reminders;
    }

    /**
     * @param  array{id: string, category: string, spent: int, limit: int, remaining: int, percentage: float, status: BudgetUsageStatus}  $budget
     * @return SystemReminder
     */
    private function budgetReminder(array $budget): array
    {
        $isOver = $budget['status'] === BudgetUsageStatus::Over;

        return [
            'id' => "budget:{$budget['id']}",
            'type' => 'budget',
            'title' => "Budget {$budget['category']}",
            'message' => $isOver
                ? 'Sudah melewati batas yang ditentukan.'
                : "Sudah terpakai {$budget['percentage']}% dari batas.",
            'priority' => $isOver ? 'high' : 'medium',
            'href' => route('budgets.index'),
        ];
    }

    /** @return list<SystemReminder> */
    private function obligationReminders(User $user, CarbonInterface $date): array
    {
        $reminders = Obligation::query()
            ->whereBelongsTo($user)
            ->where('status', ObligationStatus::Open)
            ->whereNotNull('due_on')
            ->whereDate('due_on', '<=', $date->copy()->addDays(7))
            ->select(['id', 'kind', 'counterparty_name', 'due_on'])
            ->orderBy('due_on')
            ->limit(5)
            ->get()
            ->map(function (Obligation $obligation) use ($date): array {
                $dueOn = Carbon::parse($obligation->getAttribute('due_on'));
                $daysUntilDue = (int) $date->diffInDays($dueOn, false);
                $kind = $obligation->kind === ObligationKind::Debt
                    ? 'Utang'
                    : 'Piutang';

                return [
                    'id' => "obligation:{$obligation->id}",
                    'type' => 'obligation',
                    'title' => "{$kind} {$obligation->counterparty_name}",
                    'message' => match (true) {
                        $daysUntilDue < 0 => 'Sudah melewati tanggal jatuh tempo.',
                        $daysUntilDue === 0 => 'Jatuh tempo hari ini.',
                        default => "Jatuh tempo {$daysUntilDue} hari lagi.",
                    },
                    'priority' => 'high',
                    'href' => route('obligations.show', $obligation),
                ];
            })
            ->values()
            ->all();

        return array_values($reminders);
    }

    /** @return list<SystemReminder> */
    private function savingsReminders(User $user, CarbonInterface $date): array
    {
        $reminders = SavingsGoal::query()
            ->whereBelongsTo($user)
            ->where('status', SavingsGoalStatus::Active)
            ->whereNotNull('target_date')
            ->whereDate('target_date', '<=', $date->copy()->addDays(30))
            ->select(['id', 'name', 'target_amount', 'target_date'])
            ->withSum([
                'contributions as saved_amount' => fn (Builder $query): Builder => $query
                    ->where('status', SavingsContributionStatus::Active),
            ], 'amount')
            ->orderBy('target_date')
            ->limit(5)
            ->get()
            ->filter(fn (SavingsGoal $goal): bool => (int) $goal->getAttribute('saved_amount') < (int) $goal->getAttribute('target_amount'))
            ->map(function (SavingsGoal $goal): array {
                $current = (int) $goal->getAttribute('saved_amount');
                $target = (int) $goal->getAttribute('target_amount');
                $percentage = round(($current / $target) * 100, 1);

                return [
                    'id' => "savings:{$goal->id}",
                    'type' => 'savings',
                    'title' => $goal->name,
                    'message' => "Target segera jatuh tempo dengan progres {$percentage}%.",
                    'priority' => 'medium',
                    'href' => route('savings-goals.show', $goal),
                ];
            })
            ->values()
            ->all();

        return array_values($reminders);
    }

    /** @return list<SystemReminder> */
    private function investmentReminders(User $user, CarbonInterface $date): array
    {
        $reminders = InvestmentHolding::query()
            ->whereBelongsTo($user)
            ->where('status', InvestmentHoldingStatus::Active)
            ->where(function (Builder $query) use ($date): void {
                $query->whereNull('last_valuation_at')
                    ->orWhereDate('last_valuation_at', '<=', $date->copy()->subDays(30));
            })
            ->select(['id', 'name', 'last_valuation_at'])
            ->orderByRaw('last_valuation_at ASC NULLS FIRST')
            ->limit(5)
            ->get()
            ->map(fn (InvestmentHolding $holding): array => [
                'id' => "investment:{$holding->id}",
                'type' => 'investment',
                'title' => $holding->name,
                'message' => $holding->last_valuation_at === null
                    ? 'Belum memiliki data penilaian.'
                    : 'Nilai investasi belum diperbarui lebih dari 30 hari.',
                'priority' => 'low',
                'href' => route('investments.show', $holding),
            ])
            ->values()
            ->all();

        return array_values($reminders);
    }
}
