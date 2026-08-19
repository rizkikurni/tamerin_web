<?php

use App\Enums\AssetStatus;
use App\Enums\AssetType;
use App\Enums\CategoryType;
use App\Enums\ExportFormat;
use App\Enums\ExportReportType;
use App\Enums\FinancialAccountStatus;
use App\Enums\FinancialAccountType;
use App\Enums\InvestmentHoldingStatus;
use App\Enums\InvestmentInstrumentType;
use App\Enums\InvestmentValuationStatus;
use App\Enums\ManualReminderStatus;
use App\Enums\ObligationKind;
use App\Enums\ObligationStatus;
use App\Enums\SavingsContributionStatus;
use App\Enums\SavingsGoalStatus;
use App\Enums\ThemeMode;
use App\Enums\ThemePreset;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\Asset;
use App\Models\Category;
use App\Models\ExportAudit;
use App\Models\FinancialAccount;
use App\Models\InvestmentHolding;
use App\Models\InvestmentValuation;
use App\Models\ManualReminder;
use App\Models\Obligation;
use App\Models\SavingsContribution;
use App\Models\SavingsGoal;
use App\Models\Transaction;
use App\Models\UserPreference;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

/**
 * @param  class-string<Model>  $modelClass
 * @param  array<string, class-string<BackedEnum>>  $enumCasts
 */
test('factories persist valid enum values and models cast them to enums', function (
    string $modelClass,
    array $enumCasts,
) {
    /** @var Model $model */
    $model = $modelClass::factory()->create();
    $model->refresh();

    foreach ($enumCasts as $attribute => $enumClass) {
        expect($model->getRawOriginal($attribute))
            ->toBeIn(array_column($enumClass::cases(), 'value'))
            ->and($model->getAttribute($attribute))
            ->toBeInstanceOf($enumClass);
    }
})->with([
    'user preference' => [UserPreference::class, [
        'theme_mode' => ThemeMode::class,
        'theme_preset' => ThemePreset::class,
    ]],
    'financial account' => [FinancialAccount::class, [
        'type' => FinancialAccountType::class,
        'status' => FinancialAccountStatus::class,
    ]],
    'category' => [Category::class, [
        'type' => CategoryType::class,
    ]],
    'transaction' => [Transaction::class, [
        'type' => TransactionType::class,
        'status' => TransactionStatus::class,
    ]],
    'savings goal' => [SavingsGoal::class, [
        'status' => SavingsGoalStatus::class,
    ]],
    'savings contribution' => [SavingsContribution::class, [
        'status' => SavingsContributionStatus::class,
    ]],
    'investment holding' => [InvestmentHolding::class, [
        'instrument_type' => InvestmentInstrumentType::class,
        'status' => InvestmentHoldingStatus::class,
    ]],
    'investment valuation' => [InvestmentValuation::class, [
        'status' => InvestmentValuationStatus::class,
    ]],
    'asset' => [Asset::class, [
        'asset_type' => AssetType::class,
        'status' => AssetStatus::class,
    ]],
    'obligation' => [Obligation::class, [
        'kind' => ObligationKind::class,
        'status' => ObligationStatus::class,
    ]],
    'manual reminder' => [ManualReminder::class, [
        'status' => ManualReminderStatus::class,
    ]],
    'export audit' => [ExportAudit::class, [
        'report_type' => ExportReportType::class,
        'format' => ExportFormat::class,
    ]],
]);

/**
 * @param  class-string<Model>  $modelClass
 */
test('postgresql rejects invalid enum values', function (string $modelClass, string $attribute) {
    /** @var Model $model */
    $model = $modelClass::factory()->create();

    expect(fn () => DB::table($model->getTable())
        ->where('id', $model->getKey())
        ->update([$attribute => 'invalid_enum_value']))
        ->toThrow(QueryException::class);
})->with([
    'user preference theme mode' => [UserPreference::class, 'theme_mode'],
    'user preference theme preset' => [UserPreference::class, 'theme_preset'],
    'financial account type' => [FinancialAccount::class, 'type'],
    'financial account status' => [FinancialAccount::class, 'status'],
    'category type' => [Category::class, 'type'],
    'transaction type' => [Transaction::class, 'type'],
    'transaction status' => [Transaction::class, 'status'],
    'savings goal status' => [SavingsGoal::class, 'status'],
    'savings contribution status' => [SavingsContribution::class, 'status'],
    'investment instrument type' => [InvestmentHolding::class, 'instrument_type'],
    'investment holding status' => [InvestmentHolding::class, 'status'],
    'investment valuation status' => [InvestmentValuation::class, 'status'],
    'asset type' => [Asset::class, 'asset_type'],
    'asset status' => [Asset::class, 'status'],
    'obligation kind' => [Obligation::class, 'kind'],
    'obligation status' => [Obligation::class, 'status'],
    'manual reminder status' => [ManualReminder::class, 'status'],
    'export report type' => [ExportAudit::class, 'report_type'],
    'export format' => [ExportAudit::class, 'format'],
]);
