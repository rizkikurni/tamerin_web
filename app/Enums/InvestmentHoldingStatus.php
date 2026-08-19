<?php

namespace App\Enums;

enum InvestmentHoldingStatus: string
{
    case Active = 'active';
    case Archived = 'archived';
}
