<?php

namespace App\Enums;

enum BudgetUsageStatus: string
{
    case Safe = 'safe';
    case Warning = 'warning';
    case Reached = 'reached';
    case Over = 'over';

    public static function fromPercentage(float $percentage): self
    {
        return match (true) {
            $percentage > 100 => self::Over,
            $percentage === 100.0 => self::Reached,
            $percentage >= 80 => self::Warning,
            default => self::Safe,
        };
    }

    public function priority(): int
    {
        return match ($this) {
            self::Over => 3,
            self::Reached, self::Warning => 2,
            self::Safe => 1,
        };
    }
}
