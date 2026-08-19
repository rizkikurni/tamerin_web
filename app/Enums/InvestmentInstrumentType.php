<?php

namespace App\Enums;

enum InvestmentInstrumentType: string
{
    case Stock = 'stock';
    case MutualFund = 'mutual_fund';
    case Crypto = 'crypto';
    case Bond = 'bond';
    case Gold = 'gold';
    case Other = 'other';
}
