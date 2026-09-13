<?php

namespace App\Queries\Reports;

use App\Enums\ExportReportType;
use App\Models\Category;
use App\Models\FinancialAccount;
use App\Models\User;

class FinancialReportQuery
{
    public function __construct(
        private TransactionReportQuery $transactionReportQuery,
        private CashFlowReportQuery $cashFlowReportQuery,
        private BudgetReportQuery $budgetReportQuery,
        private SavingsReportQuery $savingsReportQuery,
        private InvestmentReportQuery $investmentReportQuery,
        private NetWorthReportQuery $netWorthReportQuery,
        private ObligationReportQuery $obligationReportQuery,
    ) {}

    /** @param array{report_type: string, date_from: string, date_to: string, account_id: string|null, category_id: string|null, status: string|null} $filters
     * @return array<string, mixed>
     */
    public function get(User $user, array $filters, int $perPage = 15): array
    {
        return match (ExportReportType::from($filters['report_type'])) {
            ExportReportType::Transactions => $this->transactionReportQuery->get($user, $filters, $perPage),
            ExportReportType::CashFlow => $this->cashFlowReportQuery->get($user, $filters, $perPage),
            ExportReportType::Budgets => $this->budgetReportQuery->get($user, $filters, $perPage),
            ExportReportType::Savings => $this->savingsReportQuery->get($user, $filters, $perPage),
            ExportReportType::Investments => $this->investmentReportQuery->get($user, $filters, $perPage),
            ExportReportType::NetWorth => $this->netWorthReportQuery->get($user, $filters, $perPage),
            ExportReportType::Obligations => $this->obligationReportQuery->get($user, $filters, $perPage),
        };
    }

    /** @return list<array{value: string, label: string}> */
    public function reportOptions(): array
    {
        return [
            ['value' => ExportReportType::Transactions->value, 'label' => 'Transaksi'],
            ['value' => ExportReportType::CashFlow->value, 'label' => 'Arus Kas'],
            ['value' => ExportReportType::Budgets->value, 'label' => 'Budget'],
            ['value' => ExportReportType::Savings->value, 'label' => 'Tabungan'],
            ['value' => ExportReportType::Investments->value, 'label' => 'Investasi'],
            ['value' => ExportReportType::NetWorth->value, 'label' => 'Kekayaan Bersih'],
            ['value' => ExportReportType::Obligations->value, 'label' => 'Utang & Piutang'],
        ];
    }

    /** @return array{accounts: list<array{value: string, label: string}>, categories: list<array{value: string, label: string}>} */
    public function filterOptions(User $user): array
    {
        return [
            'accounts' => array_values(FinancialAccount::query()
                ->whereBelongsTo($user)
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (FinancialAccount $account): array => ['value' => $account->id, 'label' => $account->name])
                ->values()
                ->all()),
            'categories' => array_values(Category::query()
                ->whereBelongsTo($user)
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (Category $category): array => ['value' => $category->id, 'label' => $category->name])
                ->values()
                ->all()),
        ];
    }

    /** @return list<array{value: string, label: string}> */
    public function statusOptions(string $reportType): array
    {
        return match ($reportType) {
            'transactions', 'cash_flow' => [
                ['value' => 'posted', 'label' => 'Aktif'],
                ['value' => 'voided', 'label' => 'Dibatalkan'],
            ],
            'budgets' => [
                ['value' => 'safe', 'label' => 'Aman'],
                ['value' => 'warning', 'label' => 'Peringatan'],
                ['value' => 'reached', 'label' => 'Tercapai'],
                ['value' => 'over', 'label' => 'Melebihi'],
            ],
            'savings' => [
                ['value' => 'active', 'label' => 'Aktif'],
                ['value' => 'completed', 'label' => 'Selesai'],
                ['value' => 'archived', 'label' => 'Diarsipkan'],
            ],
            'investments' => [
                ['value' => 'active', 'label' => 'Aktif'],
                ['value' => 'archived', 'label' => 'Diarsipkan'],
            ],
            'obligations' => [
                ['value' => 'open', 'label' => 'Berjalan'],
                ['value' => 'settled', 'label' => 'Lunas'],
                ['value' => 'archived', 'label' => 'Diarsipkan'],
            ],
            default => [],
        };
    }
}
