<?php

namespace App\Enums;

enum ExportReportType: string
{
    case Transactions = 'transactions';
    case CashFlow = 'cash_flow';
    case Budgets = 'budgets';
    case Savings = 'savings';
    case Investments = 'investments';
    case NetWorth = 'net_worth';
    case Obligations = 'obligations';
}
