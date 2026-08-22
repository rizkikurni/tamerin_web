export interface DashboardSummary {
    totalBalance: number;
    income: number;
    expense: number;
    netCashFlow: number;
}

export interface DashboardProps {
    summary: DashboardSummary;
}
