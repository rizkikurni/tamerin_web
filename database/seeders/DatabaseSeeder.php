<?php

namespace Database\Seeders;

use App\Enums\FinancialAccountType;
use App\Enums\InvestmentInstrumentType;
use App\Models\Asset;
use App\Models\AuditEvent;
use App\Models\Budget;
use App\Models\Category;
use App\Models\ExportAudit;
use App\Models\FinancialAccount;
use App\Models\InvestmentHolding;
use App\Models\InvestmentValuation;
use App\Models\ManualReminder;
use App\Models\Obligation;
use App\Models\ObligationSettlement;
use App\Models\SavingsContribution;
use App\Models\SavingsGoal;
use App\Models\Transaction;
use App\Models\User;
use App\Models\UserPreference;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        DB::transaction(function (): void {
            $user = User::factory()->create([
                'name' => 'Demo User',
                'email' => 'demo@tamerin.test',
            ]);

            UserPreference::factory()->for($user)->create();

            $primaryAccount = FinancialAccount::factory()->for($user)->create([
                'name' => 'Primary Bank',
                'type' => FinancialAccountType::Bank,
            ]);

            $walletAccount = FinancialAccount::factory()->for($user)->create([
                'name' => 'Daily Wallet',
                'type' => FinancialAccountType::EWallet,
            ]);

            FinancialAccount::factory()->archived()->for($user)->create([
                'name' => 'Old Cash',
                'type' => FinancialAccountType::Cash,
            ]);

            $incomeCategory = Category::factory()->income()->for($user)->create([
                'name' => 'Salary',
            ]);

            $foodCategory = Category::factory()->expense()->for($user)->create([
                'name' => 'Food and Drinks',
            ]);

            $transportCategory = Category::factory()->expense()->for($user)->create([
                'name' => 'Transportation',
            ]);

            $incomeTransaction = Transaction::factory()->income()->for($user)->create([
                'account_id' => $primaryAccount->id,
                'category_id' => $incomeCategory->id,
                'amount' => 8_000_000,
            ]);

            Transaction::factory()->expense()->count(10)->for($user)->create([
                'account_id' => $walletAccount->id,
                'category_id' => $foodCategory->id,
            ]);

            Transaction::factory()->transfer()->count(2)->for($user)->create([
                'account_id' => $primaryAccount->id,
                'destination_account_id' => $walletAccount->id,
            ]);

            Budget::factory()->for($user)->create([
                'category_id' => $foodCategory->id,
            ]);

            $savingsGoal = SavingsGoal::factory()->for($user)->create([
                'name' => 'Emergency Fund',
            ]);

            SavingsContribution::factory()->count(3)->for($user)->create([
                'savings_goal_id' => $savingsGoal->id,
                'account_id' => $primaryAccount->id,
            ]);

            $investmentHolding = InvestmentHolding::factory()->for($user)->create([
                'name' => 'Index Fund',
                'instrument_type' => InvestmentInstrumentType::MutualFund,
                'last_valuation_at' => today(),
            ]);

            foreach ([2, 1, 0] as $monthsAgo) {
                InvestmentValuation::factory()->for($user)->create([
                    'investment_holding_id' => $investmentHolding->id,
                    'valued_on' => today()->subMonths($monthsAgo),
                ]);
            }

            Asset::factory()->count(2)->for($user)->create();

            $obligation = Obligation::factory()->for($user)->create([
                'counterparty_name' => 'Sample Counterparty',
                'original_amount' => 3_000_000,
                'outstanding_amount' => 2_500_000,
            ]);

            $settlementTransaction = Transaction::factory()->expense()->for($user)->create([
                'account_id' => $primaryAccount->id,
                'category_id' => $transportCategory->id,
                'amount' => 500_000,
            ]);

            ObligationSettlement::factory()->for($user)->create([
                'obligation_id' => $obligation->id,
                'account_id' => $primaryAccount->id,
                'transaction_id' => $settlementTransaction->id,
                'amount' => 500_000,
                'settled_on' => $settlementTransaction->transacted_on,
            ]);

            ManualReminder::factory()->count(3)->for($user)->create();
            ExportAudit::factory()->count(2)->for($user)->create();

            AuditEvent::factory()->count(3)->for($user)->create([
                'auditable_type' => Transaction::class,
                'auditable_id' => $incomeTransaction->id,
            ]);
        });
    }
}
