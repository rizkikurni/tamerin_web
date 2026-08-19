<?php

namespace App\Enums;

enum ObligationKind: string
{
    case Debt = 'debt';
    case Receivable = 'receivable';
}
