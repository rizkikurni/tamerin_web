import { Head, router, usePage } from '@inertiajs/react';
import {
    Archive,
    Banknote,
    Landmark,
    Pencil,
    Plus,
    Smartphone,
    WalletCards,
} from 'lucide-react';
import { useState } from 'react';

import { StatusMessage } from '@/components/form-controls';
import Badge from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import EmptyState from '@/components/ui/empty-state';
import IconButton, { IconLink } from '@/components/ui/icon-button';
import Pagination from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { archive, create, edit, index } from '@/routes/financial-accounts';
import type { FinancialAccount, PaginatedData } from '@/types';

const accountTypeLabels: Record<FinancialAccount['type'], string> = {
    cash: 'Tunai',
    bank: 'Bank',
    e_wallet: 'Dompet digital',
};

function AccountIcon({ type }: { type: FinancialAccount['type'] }) {
    const Icon =
        type === 'cash' ? Banknote : type === 'bank' ? Landmark : Smartphone;

    return <Icon className="h-5 w-5" />;
}

function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

function formatDate(value: string): string {
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(new Date(`${value}T00:00:00Z`));
}

export default function FinancialAccountsIndex({
    accounts,
}: {
    accounts: PaginatedData<FinancialAccount>;
}) {
    const { flash } = usePage().props;
    const [selectedAccount, setSelectedAccount] =
        useState<FinancialAccount | null>(null);
    const [archiving, setArchiving] = useState(false);

    const archiveSelectedAccount = () => {
        if (!selectedAccount) {
            return;
        }

        router.patch(
            archive.url(selectedAccount.id),
            {},
            {
                preserveScroll: true,
                onStart: () => setArchiving(true),
                onFinish: () => setArchiving(false),
                onSuccess: () => setSelectedAccount(null),
            },
        );
    };

    return (
        <AppLayout
            title="Akun Keuangan"
            description="Kelola sumber dana tanpa menghilangkan histori."
            breadcrumbs={[{ label: 'Keuangan' }, { label: 'Akun Keuangan' }]}
            currentPath={index.url()}
            headerActions={
                <ButtonLink
                    href={create.url()}
                    size="sm"
                    className="rounded-full px-4"
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Tambah Akun</span>
                </ButtonLink>
            }
        >
            <Head title="Akun Keuangan" />

            <div className="grid w-full gap-4">
                <StatusMessage message={flash.status} />

                {accounts.data.length === 0 ? (
                    <EmptyState
                        icon={<WalletCards className="h-7 w-7 text-primary" />}
                        title="Belum ada akun keuangan"
                        description="Tambahkan akun pertama untuk menyiapkan sumber dana transaksi."
                        action={
                            <ButtonLink
                                href={create.url()}
                                className="rounded-full"
                            >
                                <Plus className="h-4 w-4" />
                                Tambah Akun
                            </ButtonLink>
                        }
                    />
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {accounts.data.map((account) => {
                                const isArchived =
                                    account.status === 'archived';

                                return (
                                    <Card
                                        key={account.id}
                                        variant="navbar"
                                        className={cn(
                                            'transition-[background-color,border-color,box-shadow,opacity] duration-200 ease-out',
                                            'hover:border-[var(--glass-border-strong)] hover:bg-surface/95 hover:shadow-[var(--glass-shadow-hover)]',
                                            'focus-within:border-[var(--glass-border-strong)] focus-within:shadow-[var(--glass-shadow-hover)]',
                                            isArchived &&
                                                'opacity-75 hover:opacity-90',
                                        )}
                                    >
                                        <CardContent className="grid gap-4 p-4 sm:p-5">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                                                        <AccountIcon
                                                            type={account.type}
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h2 className="truncate text-sm font-medium text-foreground">
                                                            {account.name}
                                                        </h2>
                                                        <p className="mt-0.5 text-xs font-light text-muted-foreground">
                                                            {
                                                                accountTypeLabels[
                                                                    account.type
                                                                ]
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                                <Badge
                                                    variant={
                                                        isArchived
                                                            ? 'muted'
                                                            : 'success'
                                                    }
                                                >
                                                    {isArchived
                                                        ? 'Diarsipkan'
                                                        : 'Aktif'}
                                                </Badge>
                                            </div>

                                            <div className="grid gap-1 border-y border-border/70 py-3">
                                                <p className="text-xs font-light text-muted-foreground">
                                                    Saldo awal
                                                </p>
                                                <p className="mt-1 text-lg font-medium text-foreground">
                                                    {formatRupiah(
                                                        account.opening_balance,
                                                    )}
                                                </p>
                                            </div>

                                            <div className="flex min-h-9 items-center justify-between gap-3">
                                                <p className="text-xs font-light text-muted-foreground">
                                                    Dibuka{' '}
                                                    {formatDate(
                                                        account.opened_on,
                                                    )}
                                                </p>
                                                {!isArchived && (
                                                    <div className="flex gap-2">
                                                        <IconLink
                                                            href={edit.url(
                                                                account.id,
                                                            )}
                                                            label={`Edit ${account.name}`}
                                                            icon={
                                                                <Pencil className="h-4 w-4" />
                                                            }
                                                        />
                                                        <IconButton
                                                            label={`Arsipkan ${account.name}`}
                                                            variant="warning"
                                                            onClick={() =>
                                                                setSelectedAccount(
                                                                    account,
                                                                )
                                                            }
                                                            icon={
                                                                <Archive className="h-4 w-4" />
                                                            }
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                            <p className="text-xs font-light text-muted-foreground">
                                Menampilkan {accounts.from}–{accounts.to} dari{' '}
                                {accounts.total} akun
                            </p>
                            <Pagination links={accounts.links} />
                        </div>
                    </>
                )}
            </div>

            <ConfirmationDialog
                open={selectedAccount !== null}
                title="Arsipkan akun keuangan?"
                description={`Akun “${selectedAccount?.name ?? ''}” tidak akan tersedia untuk transaksi baru, tetapi seluruh historinya tetap tersimpan.`}
                processing={archiving}
                onCancel={() => setSelectedAccount(null)}
                onConfirm={archiveSelectedAccount}
            />
        </AppLayout>
    );
}
