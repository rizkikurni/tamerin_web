import { Head, router, usePage } from '@inertiajs/react';
import {
    Archive,
    BriefcaseBusiness,
    Car,
    CircleDollarSign,
    Gift,
    GraduationCap,
    HeartPulse,
    House,
    Pencil,
    Plus,
    ShoppingCart,
    Tags,
    Utensils,
    Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
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
import { archive, create, edit, index } from '@/routes/categories';
import type { Category, PaginatedData } from '@/types';

const categoryIcons: Record<string, LucideIcon> = {
    wallet: Wallet,
    'shopping-cart': ShoppingCart,
    utensils: Utensils,
    car: Car,
    'briefcase-business': BriefcaseBusiness,
    house: House,
    'heart-pulse': HeartPulse,
    'graduation-cap': GraduationCap,
    gift: Gift,
    'circle-dollar-sign': CircleDollarSign,
};

const colorClasses: Record<string, string> = {
    blue: 'bg-primary-soft text-primary',
    green: 'bg-success/10 text-success',
    violet: 'bg-secondary-soft text-secondary',
    amber: 'bg-warning/10 text-warning',
    rose: 'bg-danger/10 text-danger',
};

export default function CategoriesIndex({
    categories,
}: {
    categories: PaginatedData<Category>;
}) {
    const { flash } = usePage().props;
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(
        null,
    );
    const [archiving, setArchiving] = useState(false);

    const archiveSelectedCategory = () => {
        if (!selectedCategory) {
            return;
        }

        router.patch(
            archive.url(selectedCategory.id),
            {},
            {
                preserveScroll: true,
                onStart: () => setArchiving(true),
                onFinish: () => setArchiving(false),
                onSuccess: () => setSelectedCategory(null),
            },
        );
    };

    return (
        <AppLayout
            title="Kategori"
            description="Atur pengelompokan pemasukan dan pengeluaran."
            breadcrumbs={[{ label: 'Keuangan' }, { label: 'Kategori' }]}
            currentPath={index.url()}
            headerActions={
                <ButtonLink
                    href={create.url()}
                    size="sm"
                    className="rounded-full px-4"
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Tambah Kategori</span>
                </ButtonLink>
            }
        >
            <Head title="Kategori" />

            <div className="mx-auto grid max-w-6xl gap-4">
                <StatusMessage message={flash.status} />

                {categories.data.length === 0 ? (
                    <EmptyState
                        icon={<Tags className="h-7 w-7 text-primary" />}
                        title="Belum ada kategori"
                        description="Buat kategori untuk mengelompokkan transaksi keuanganmu."
                        action={
                            <ButtonLink
                                href={create.url()}
                                className="rounded-full"
                            >
                                <Plus className="h-4 w-4" />
                                Tambah Kategori
                            </ButtonLink>
                        }
                    />
                ) : (
                    <>
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {categories.data.map((category) => {
                                const Icon =
                                    categoryIcons[category.icon ?? ''] ?? Tags;
                                const isArchived =
                                    category.archived_at !== null;
                                const iconColorClass =
                                    colorClasses[category.color_token ?? ''] ??
                                    'bg-surface-muted text-muted-foreground';

                                return (
                                    <Card
                                        key={category.id}
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
                                                    <div
                                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconColorClass}`}
                                                    >
                                                        <Icon className="h-5 w-5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h2 className="truncate text-sm font-medium text-foreground">
                                                            {category.name}
                                                        </h2>
                                                        <p className="mt-0.5 text-xs font-light text-muted-foreground">
                                                            Kategori{' '}
                                                            {category.type ===
                                                            'income'
                                                                ? 'pemasukan'
                                                                : 'pengeluaran'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap justify-end gap-1.5">
                                                    {category.is_system && (
                                                        <Badge variant="muted">
                                                            Sistem
                                                        </Badge>
                                                    )}
                                                    {isArchived && (
                                                        <Badge variant="muted">
                                                            Diarsipkan
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex min-h-9 items-center justify-between gap-3 border-t border-border/70 pt-3">
                                                <Badge
                                                    variant={
                                                        category.type ===
                                                        'income'
                                                            ? 'success'
                                                            : 'danger'
                                                    }
                                                >
                                                    {category.type === 'income'
                                                        ? 'Pemasukan'
                                                        : 'Pengeluaran'}
                                                </Badge>

                                                {!isArchived ? (
                                                    <div className="flex shrink-0 gap-2">
                                                        <IconLink
                                                            href={edit.url(
                                                                category.id,
                                                            )}
                                                            label={`Edit ${category.name}`}
                                                            icon={
                                                                <Pencil className="h-4 w-4" />
                                                            }
                                                        />
                                                        <IconButton
                                                            label={`Arsipkan ${category.name}`}
                                                            variant="warning"
                                                            onClick={() =>
                                                                setSelectedCategory(
                                                                    category,
                                                                )
                                                            }
                                                            icon={
                                                                <Archive className="h-4 w-4" />
                                                            }
                                                        />
                                                    </div>
                                                ) : (
                                                    <span className="text-xs font-light text-muted-foreground">
                                                        Hanya histori
                                                    </span>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                            <p className="text-xs font-light text-muted-foreground">
                                Menampilkan {categories.from}–{categories.to}{' '}
                                dari {categories.total} kategori
                            </p>
                            <Pagination links={categories.links} />
                        </div>
                    </>
                )}
            </div>

            <ConfirmationDialog
                open={selectedCategory !== null}
                title="Arsipkan kategori?"
                description={`Kategori “${selectedCategory?.name ?? ''}” tidak akan tersedia untuk data baru, tetapi histori transaksi dan budget tetap tersimpan.`}
                processing={archiving}
                onCancel={() => setSelectedCategory(null)}
                onConfirm={archiveSelectedCategory}
            />
        </AppLayout>
    );
}
