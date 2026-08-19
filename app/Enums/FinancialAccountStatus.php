<?php

namespace App\Enums;

enum FinancialAccountStatus: string
{
    case Active = 'active';
    case Archived = 'archived';
}
