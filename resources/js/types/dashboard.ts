export interface DashboardSummary {
    totalBalance: number;
    activeAccountCount: number;
    income: number;
    expense: number;
    netCashFlow: number;
    incomeComparison: number | null;
    expenseComparison: number | null;
}

export interface DashboardPeriod {
    value: string;
    label: string;
    previous: string;
    next: string;
}

export interface CashFlowPoint {
    date: string;
    income: number;
    expense: number;
}

export interface DashboardAccount {
    id: string;
    name: string;
    type: 'cash' | 'bank' | 'e_wallet';
    balance: number;
    contribution: number;
}

export interface DashboardBudget {
    id: string;
    category: string;
    spent: number;
    limit: number;
    remaining: number;
    percentage: number;
    status: 'safe' | 'warning' | 'reached' | 'over';
}

export interface DashboardTransaction {
    id: string;
    date: string;
    type: 'income' | 'expense' | 'transfer';
    label: string;
    account: string;
    note: string | null;
    amount: number;
    status: 'posted' | 'voided';
}

export interface DashboardNetWorth {
    total: number;
    accountBalance: number;
    investments: number;
    assets: number;
    receivables: number;
    debts: number;
    updatedAt: string;
}

export interface DashboardSavingsGoal {
    id: string;
    name: string;
    current: number;
    target: number;
    targetDate: string | null;
    percentage: number;
}

export interface DashboardInvestment {
    id: string;
    name: string;
    type: string;
    value: number;
    change: number | null;
    valuedOn: string | null;
}

export interface DashboardSecondarySummary {
    savingsGoal: DashboardSavingsGoal | null;
    investment: DashboardInvestment | null;
}

export interface SystemReminder {
    id: string;
    type: 'budget' | 'obligation' | 'savings' | 'investment';
    title: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
}

export interface SystemReminderResponse {
    reminders: SystemReminder[];
    count: number;
}

export interface DashboardProps {
    period: DashboardPeriod;
    summary: DashboardSummary;
    cashFlow: CashFlowPoint[];
    accounts: DashboardAccount[];
    budgets: DashboardBudget[];
    recentTransactions: DashboardTransaction[];
    netWorth: DashboardNetWorth;
    secondary: DashboardSecondarySummary;
    isNewUser: boolean;
}
