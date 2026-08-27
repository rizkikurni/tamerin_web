import {
    BarChart3,
    Bell,
    CreditCard,
    HandCoins,
    Home,
    Landmark,
    Menu,
    Package,
    Plus,
    Settings,
    Tag,
    Target,
    TrendingUp,
    Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { dashboard } from '@/routes';
import { index as assetsIndex } from '@/routes/assets';
import { index as budgetsIndex } from '@/routes/budgets';
import { index as categoriesIndex } from '@/routes/categories';
import { index as financialAccountsIndex } from '@/routes/financial-accounts';
import { index as investmentsIndex } from '@/routes/investments';
import { index as obligationsIndex } from '@/routes/obligations';
import { edit as editProfile } from '@/routes/profile';
import { index as savingsGoalsIndex } from '@/routes/savings-goals';
import { index as transactionsIndex } from '@/routes/transactions';

export interface NavigationItem {
    label: string;
    icon: LucideIcon;
    href: string;
}

const navigationItems = {
    dashboard: {
        label: 'Dashboard',
        icon: Home,
        href: dashboard.url(),
    },
    transactions: {
        label: 'Transaksi',
        icon: CreditCard,
        href: transactionsIndex.url(),
    },
    accounts: {
        label: 'Akun Keuangan',
        icon: Landmark,
        href: financialAccountsIndex.url(),
    },
    categories: {
        label: 'Kategori',
        icon: Tag,
        href: categoriesIndex.url(),
    },
    budgets: {
        label: 'Budget',
        icon: Wallet,
        href: budgetsIndex.url(),
    },
    savings: {
        label: 'Target Tabungan',
        icon: Target,
        href: savingsGoalsIndex.url(),
    },
    investments: {
        label: 'Investasi',
        icon: TrendingUp,
        href: investmentsIndex.url(),
    },
    assets: {
        label: 'Aset',
        icon: Package,
        href: assetsIndex.url(),
    },
    debts: {
        label: 'Utang & Piutang',
        icon: HandCoins,
        href: obligationsIndex.url(),
    },
    reminders: {
        label: 'Pengingat',
        icon: Bell,
        href: '/reminders',
    },
    reports: {
        label: 'Laporan',
        icon: BarChart3,
        href: '/reports',
    },
    settings: {
        label: 'Pengaturan',
        icon: Settings,
        href: editProfile.url(),
    },
} satisfies Record<string, NavigationItem>;

export const headerNavigationItems: NavigationItem[] = [
    navigationItems.dashboard,
    navigationItems.transactions,
    navigationItems.reports,
];

export const sidebarNavigationGroups: NavigationItem[][] = [
    [navigationItems.dashboard],
    [
        navigationItems.transactions,
        navigationItems.accounts,
        navigationItems.categories,
        navigationItems.budgets,
    ],
    [
        navigationItems.savings,
        navigationItems.investments,
        navigationItems.assets,
        navigationItems.debts,
    ],
    [navigationItems.reminders, navigationItems.reports],
];

export const mobileBottomNavigationItems = [
    { kind: 'link', item: navigationItems.dashboard },
    { kind: 'link', item: navigationItems.transactions },
    { kind: 'action', label: 'Tambah', icon: Plus },
    { kind: 'link', item: navigationItems.budgets },
    { kind: 'menu', label: 'Lainnya', icon: Menu },
] as const;

export const mobileMoreNavigationItems: NavigationItem[] = [
    navigationItems.accounts,
    navigationItems.categories,
    navigationItems.savings,
    navigationItems.investments,
    navigationItems.assets,
    navigationItems.debts,
    navigationItems.reminders,
    navigationItems.reports,
    navigationItems.settings,
];

export function isNavigationPathActive(
    currentPath: string,
    href: string,
): boolean {
    return !href.startsWith('#') && currentPath.startsWith(href);
}
