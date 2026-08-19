<?php

namespace App\Enums;

enum ObligationStatus: string
{
    case Open = 'open';
    case Settled = 'settled';
    case Archived = 'archived';
}
