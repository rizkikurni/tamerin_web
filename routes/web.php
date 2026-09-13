<?php

use App\Http\Controllers\ArchiveAssetController;
use App\Http\Controllers\ArchiveCategoryController;
use App\Http\Controllers\ArchiveFinancialAccountController;
use App\Http\Controllers\ArchiveInvestmentHoldingController;
use App\Http\Controllers\ArchiveObligationController;
use App\Http\Controllers\ArchiveSavingsGoalController;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CompleteManualReminderController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DismissManualReminderController;
use App\Http\Controllers\ExportAuditController;
use App\Http\Controllers\ExportReportController;
use App\Http\Controllers\FinancialAccountController;
use App\Http\Controllers\InvestmentHoldingController;
use App\Http\Controllers\InvestmentValuationController;
use App\Http\Controllers\ManualReminderController;
use App\Http\Controllers\ObligationController;
use App\Http\Controllers\ObligationSettlementController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\SavingsContributionController;
use App\Http\Controllers\SavingsGoalController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\UserPreferenceController;
use App\Http\Controllers\SystemReminderController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\VoidInvestmentValuationController;
use App\Http\Controllers\VoidSavingsContributionController;
use App\Http\Controllers\VoidTransactionController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware('guest')->group(function (): void {
    Route::get('/register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('/register', [RegisteredUserController::class, 'store'])->name('register.store');

    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store'])
        ->middleware('throttle:login')
        ->name('login.store');

    Route::get('/forgot-password', [PasswordResetLinkController::class, 'create'])
        ->name('password.request');
    Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])
        ->middleware('throttle:password-reset-link')
        ->name('password.email');

    Route::get('/reset-password/{token}', [NewPasswordController::class, 'create'])
        ->name('password.reset');
    Route::post('/reset-password', [NewPasswordController::class, 'store'])
        ->middleware('throttle:password-reset')
        ->name('password.store');
});

Route::middleware('auth')->group(function (): void {
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/system-reminders', SystemReminderController::class)
        ->name('system-reminders.index');

    Route::resource('financial-accounts', FinancialAccountController::class)
        ->except(['show', 'destroy']);
    Route::patch('/financial-accounts/{financial_account}/archive', ArchiveFinancialAccountController::class)
        ->name('financial-accounts.archive');

    Route::resource('categories', CategoryController::class)
        ->except(['show', 'destroy']);
    Route::patch('/categories/{category}/archive', ArchiveCategoryController::class)
        ->name('categories.archive');

    Route::resource('transactions', TransactionController::class)
        ->only(['index', 'create', 'store', 'show']);
    Route::patch('/transactions/{transaction}/void', VoidTransactionController::class)
        ->name('transactions.void');

    Route::resource('budgets', BudgetController::class)
        ->only(['index', 'store', 'update']);

    Route::resource('savings-goals', SavingsGoalController::class)
        ->except(['destroy']);
    Route::patch('/savings-goals/{savings_goal}/archive', ArchiveSavingsGoalController::class)
        ->name('savings-goals.archive');
    Route::post('/savings-goals/{savings_goal}/contributions', [SavingsContributionController::class, 'store'])
        ->name('savings-goals.contributions.store');
    Route::patch('/savings-contributions/{savings_contribution}/void', VoidSavingsContributionController::class)
        ->name('savings-contributions.void');

    Route::resource('investments', InvestmentHoldingController::class)
        ->except(['destroy']);
    Route::patch('/investments/{investment}/archive', ArchiveInvestmentHoldingController::class)
        ->name('investments.archive');
    Route::post('/investments/{investment}/valuations', [InvestmentValuationController::class, 'store'])
        ->name('investments.valuations.store');
    Route::patch('/investment-valuations/{investment_valuation}/void', VoidInvestmentValuationController::class)
        ->name('investment-valuations.void');

    Route::resource('assets', AssetController::class)
        ->except(['destroy']);
    Route::patch('/assets/{asset}/archive', ArchiveAssetController::class)
        ->name('assets.archive');

    Route::resource('obligations', ObligationController::class)
        ->except(['destroy']);
    Route::patch('/obligations/{obligation}/archive', ArchiveObligationController::class)
        ->name('obligations.archive');
    Route::post('/obligations/{obligation}/settlements', [ObligationSettlementController::class, 'store'])
        ->name('obligations.settlements.store');

    Route::resource('reminders', ManualReminderController::class)
        ->parameters(['reminders' => 'manual_reminder'])
        ->only(['index', 'store', 'update']);
    Route::patch('/reminders/{manual_reminder}/complete', CompleteManualReminderController::class)
        ->name('reminders.complete');
    Route::patch('/reminders/{manual_reminder}/dismiss', DismissManualReminderController::class)
        ->name('reminders.dismiss');

    Route::get('/reports', [ReportController::class, 'index'])
        ->name('reports.index');
    Route::get('/reports/exports', [ExportAuditController::class, 'index'])
        ->name('reports.exports.index');
    Route::post('/reports/exports', [ExportReportController::class, 'store'])
        ->name('reports.exports.store');

    Route::prefix('settings')->group(function (): void {
        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');

        Route::get('/password', [PasswordController::class, 'edit'])->name('password.edit');
        Route::patch('/password', [PasswordController::class, 'update'])->name('password.update');

        Route::get('/preferences', [UserPreferenceController::class, 'edit'])->name('preferences.edit');
        Route::patch('/preferences', [UserPreferenceController::class, 'update'])->name('preferences.update');
    });
});
