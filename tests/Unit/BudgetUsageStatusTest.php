<?php

use App\Enums\BudgetUsageStatus;

test('budget usage status follows the configured percentage thresholds', function (float $percentage, BudgetUsageStatus $expected) {
    expect(BudgetUsageStatus::fromPercentage($percentage))->toBe($expected);
})->with([
    'below warning threshold' => [79.9, BudgetUsageStatus::Safe],
    'warning threshold' => [80, BudgetUsageStatus::Warning],
    'below budget limit' => [99.9, BudgetUsageStatus::Warning],
    'budget limit reached' => [100, BudgetUsageStatus::Reached],
    'budget limit exceeded' => [100.1, BudgetUsageStatus::Over],
]);
