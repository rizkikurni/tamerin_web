export type SelectOption = {
    value: string;
    label: string;
};

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type PaginatedData<T> = {
    current_page: number;
    data: T[];
    from: number | null;
    last_page: number;
    links: PaginationLink[];
    per_page: number;
    to: number | null;
    total: number;
};

export type FinancialAccount = {
    id: string;
    name: string;
    type: 'cash' | 'bank' | 'e_wallet';
    opening_balance: number;
    opened_on: string;
    status: 'active' | 'archived';
    archived_at: string | null;
};

export type FinancialAccountFormData = Pick<
    FinancialAccount,
    'id' | 'name' | 'type' | 'opening_balance' | 'opened_on'
>;

export type Category = {
    id: string;
    name: string;
    type: 'income' | 'expense';
    color_token: string | null;
    icon: string | null;
    is_system: boolean;
    archived_at: string | null;
};

export type CategoryFormData = Pick<
    Category,
    'id' | 'name' | 'type' | 'color_token' | 'icon'
>;

export type TransactionType = 'income' | 'expense' | 'transfer';

export type TransactionStatus = 'posted' | 'voided';

export type TransactionAccountOption = {
    id: string;
    name: string;
};

export type TransactionCategoryOption = {
    id: string;
    name: string;
    type: 'income' | 'expense';
};

export type TransactionRelation = {
    id: string;
    name: string;
};

export type TransactionCategoryRelation = TransactionRelation & {
    type: 'income' | 'expense';
};

export type TransactionListItem = {
    id: string;
    type: TransactionType;
    amount: number;
    transacted_on: string;
    note: string | null;
    status: TransactionStatus;
    voided_at: string | null;
    account: TransactionRelation;
    destination_account: TransactionRelation | null;
    category: TransactionCategoryRelation | null;
};

export type TransactionDetail = TransactionListItem & {
    void_reason: string | null;
    created_at: string;
    can_void: boolean;
};

export type TransactionFilters = {
    date_from: string | null;
    date_to: string | null;
    type: string | null;
    account_id: string | null;
    category_id: string | null;
    status: string | null;
};

export type TransactionFilterOptions = {
    types: SelectOption[];
    statuses: SelectOption[];
    accounts: TransactionAccountOption[];
    categories: TransactionCategoryOption[];
};

export type BudgetStatus = 'safe' | 'warning' | 'reached' | 'over';

export type BudgetListItem = {
    id: string;
    category: {
        id: string;
        name: string;
        color_token: string | null;
        icon: string | null;
    };
    period_start: string;
    amount: number;
    spent: number;
    remaining: number;
    percentage: number;
    status: BudgetStatus;
};

export type BudgetSummary = {
    allocated: number;
    spent: number;
    remaining: number;
    percentage: number;
    overBudgetCount: number;
};

export type SavingsGoalStatus = 'active' | 'completed' | 'archived';

export type SavingsContributionStatus = 'active' | 'voided';

export type SavingsGoalListItem = {
    id: string;
    name: string;
    target_amount: number;
    saved_amount: number;
    remaining_amount: number;
    percentage: number;
    target_date: string | null;
    status: SavingsGoalStatus;
    completed_at: string | null;
    archived_at: string | null;
};

export type SavingsGoalFormData = Pick<
    SavingsGoalListItem,
    'id' | 'name' | 'target_amount' | 'target_date'
>;

export type SavingsGoalSummary = {
    activeCount: number;
    totalTarget: number;
    totalSaved: number;
    completedCount: number;
};

export type SavingsGoalFilters = {
    status: string | null;
};

export type SavingsContributionListItem = {
    id: string;
    amount: number;
    contributed_on: string;
    note: string | null;
    status: SavingsContributionStatus;
    voided_at: string | null;
    void_reason: string | null;
    account: TransactionRelation | null;
};

export type SavingsGoalPermissions = {
    canEdit: boolean;
    canArchive: boolean;
    canContribute: boolean;
};

export type InvestmentInstrumentType =
    'stock' | 'mutual_fund' | 'crypto' | 'bond' | 'gold' | 'other';

export type InvestmentHoldingStatus = 'active' | 'archived';

export type InvestmentValuationStatus = 'active' | 'voided';

export type InvestmentListItem = {
    id: string;
    name: string;
    instrument_type: InvestmentInstrumentType;
    acquisition_cost: number;
    acquired_on: string;
    units: string | null;
    status: InvestmentHoldingStatus;
    last_valuation_at: string | null;
    archived_at: string | null;
    current_value: number | null;
    profit_loss: number | null;
    profit_loss_percentage: number | null;
};

export type InvestmentFormData = Pick<
    InvestmentListItem,
    | 'id'
    | 'name'
    | 'instrument_type'
    | 'acquisition_cost'
    | 'acquired_on'
    | 'units'
>;

export type InvestmentSummary = {
    totalCurrentValue: number;
    totalAcquisitionCost: number;
    profitLoss: number;
    staleCount: number;
};

export type InvestmentFilters = {
    instrument_type: string | null;
    status: string | null;
    valuation_condition: string | null;
};

export type InvestmentValuation = {
    id: string;
    valued_on: string;
    value: number;
    note: string | null;
    status: InvestmentValuationStatus;
};

export type InvestmentChartPoint = Pick<
    InvestmentValuation,
    'valued_on' | 'value'
>;

export type InvestmentPermissions = {
    canEdit: boolean;
    canArchive: boolean;
    canValue: boolean;
};

export type AssetType =
    'vehicle' | 'electronics' | 'property' | 'jewelry' | 'other';

export type AssetStatus = 'active' | 'archived';

export type AssetListItem = {
    id: string;
    name: string;
    asset_type: AssetType;
    acquired_on: string | null;
    acquisition_cost: number | null;
    current_value: number;
    valued_on: string;
    note: string | null;
    status: AssetStatus;
    archived_at: string | null;
    estimated_difference: number | null;
};

export type AssetFormData = Pick<
    AssetListItem,
    | 'id'
    | 'name'
    | 'asset_type'
    | 'acquired_on'
    | 'acquisition_cost'
    | 'current_value'
    | 'valued_on'
    | 'note'
>;

export type AssetSummary = {
    totalCurrentValue: number;
    totalAcquisitionCost: number;
    activeCount: number;
    oldestValuedOn: string | null;
};

export type AssetFilters = {
    asset_type: string | null;
    status: string | null;
};

export type AssetPermissions = {
    canEdit: boolean;
    canArchive: boolean;
};

export type ObligationKind = 'debt' | 'receivable';
export type ObligationStatus = 'open' | 'settled' | 'archived';

export type ObligationListItem = {
    id: string;
    kind: ObligationKind;
    counterparty_name: string;
    original_amount: number;
    outstanding_amount: number;
    paid_amount: number;
    progress_percentage: number;
    started_on: string;
    due_on: string | null;
    status: ObligationStatus;
    settled_at: string | null;
    archived_at: string | null;
    note: string | null;
    is_overdue: boolean;
};

export type ObligationFormData = Pick<
    ObligationListItem,
    | 'id'
    | 'kind'
    | 'counterparty_name'
    | 'original_amount'
    | 'started_on'
    | 'due_on'
    | 'note'
>;

export type ObligationSummary = {
    totalDebt: number;
    totalReceivable: number;
    dueSoonCount: number;
    overdueCount: number;
};

export type ObligationFilters = {
    kind: string | null;
    status: string | null;
    due_filter: string | null;
    search: string | null;
};

export type ObligationSettlement = {
    id: string;
    amount: number;
    settled_on: string;
    note: string | null;
    account: TransactionRelation;
    transaction: {
        id: string;
        type: TransactionType;
        status: TransactionStatus;
    };
};

export type ObligationPermissions = {
    canEdit: boolean;
    canArchive: boolean;
    canSettle: boolean;
};

export type ManualReminderStatus = 'active' | 'done' | 'dismissed';
export type ManualReminderGroup =
    'overdue' | 'today' | 'upcoming' | 'no_due' | 'completed';

export type ManualReminderListItem = {
    id: string;
    title: string;
    due_on: string | null;
    note: string | null;
    status: ManualReminderStatus;
    group: ManualReminderGroup;
    updated_at: string;
};

export type ManualReminderFilters = {
    status: string | null;
    due_filter: string | null;
    search: string | null;
};

export type ManualReminderSummary = {
    activeCount: number;
    dueTodayCount: number;
    overdueCount: number;
    completedThisMonthCount: number;
};
