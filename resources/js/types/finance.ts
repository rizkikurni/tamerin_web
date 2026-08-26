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
