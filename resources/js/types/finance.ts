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
