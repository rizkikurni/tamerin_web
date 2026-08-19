<?php

namespace App\Enums;

enum SavingsContributionStatus: string
{
    case Active = 'active';
    case Voided = 'voided';
}
