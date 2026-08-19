<?php

namespace App\Enums;

enum InvestmentValuationStatus: string
{
    case Active = 'active';
    case Voided = 'voided';
}
