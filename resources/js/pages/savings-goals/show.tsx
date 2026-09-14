import { Head, router, usePage } from '@inertiajs/react';
import {
    Archive,
    CalendarDays,
    CheckCircle2,
    Pencil,
    PiggyBank,
    Plus,
    Target,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';

import SummaryCard from '@/components/dashboard/summary-card';
import { StatusMessage } from '@/components/form-controls';
import SavingsContributionCard from '@/components/savings-goals/savings-contribution-card';
import SavingsContributionForm from '@/components/savings-goals/savings-contribution-form';
import VoidSavingsContributionDialog from '@/components/savings-goals/void-savings-contribution-dialog';
import Badge from '@/components/ui/badge';
import Button, { ButtonLink } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import EmptyState from '@/components/ui/empty-state';
import Pagination from '@/components/ui/pagination';
import Progress from '@/components/ui/progress';
import AppLayout from '@/layouts/app-layout';
import { formatDate, formatRupiah } from '@/lib/formatters';
import { archive, edit, index } from '@/routes/savings-goals';
import type {
    PaginatedData,
    SavingsContributionListItem,
    SavingsGoalListItem,
    SavingsGoalPermissions,
    SavingsGoalStatus,
    SelectOption,
} from '@/types';

const statusConfig: Record<
    SavingsGoalStatus,
    { label: string; variant: 'default' | 'success' | 'muted' }
> = {
    active: { label: 'Aktif', variant: 'default' },
    completed: { label: 'Selesai', variant: 'success' },
    archived: { label: 'Diarsipkan', variant: 'muted' },
};

type SavingsGoalShowProps = {
    goal: SavingsGoalListItem;
    contributions: PaginatedData<SavingsContributionListItem>;
    accountOptions: SelectOption[];
    permissions: SavingsGoalPermissions;
    defaultContributionDate: string;
};

export default function SavingsGoalShow({
    goal,
    contributions,
    accountOptions,
    permissions,
    defaultContributionDate,
}: SavingsGoalShowProps) {
    const { flash } = usePage().props;
    const [showArchiveDialog, setShowArchiveDialog] = useState(false);
    const [archiving, setArchiving] = useState(false);
    const [voidContributionId, setVoidContributionId] = useState<string | null>(
        null,
    );
    const status = statusConfig[goal.status];

    const archiveGoal = () => {
        router.patch(
            archive.url(goal.id),
            {},
            {
                preserveScroll: true,
                onStart: () => setArchiving(true),
                onFinish: () => setArchiving(false),
                onSuccess: () => setShowArchiveDialog(false),
            },
        );
    };

    return (
        <AppLayout
            title={goal.name}
            description="Detail progres dan riwayat setoran target tabungan."
            breadcrumbs={[
                { label: 'Kekayaan' },
                { label: 'Target Tabungan', href: index.url() },
                { label: goal.name },
            ]}
            currentPath={index.url()}
            headerActions={
                permissions.canEdit || permissions.canArchive ? (
                    <div className="flex items-center gap-2">
                        {permissions.canEdit && (
                            <ButtonLink
                                href={edit.url(goal.id)}
                                variant="outline"
                                size="sm"
                            >
                                <Pencil className="h-4 w-4" />
                                <span className="hidden sm:inline">Ubah</span>
                            </ButtonLink>
                        )}
                        {permissions.canArchive && (
                            <Button
                                type="button"
                                variant="danger"
                                size="sm"
                                onClick={() => setShowArchiveDialog(true)}
                            >
                                <Archive className="h-4 w-4" />
                                <span className="hidden sm:inline">
                                    Arsipkan
                                </span>
                            </Button>
                        )}
                    </div>
                ) : undefined
            }
        >
            <Head title={goal.name} />

            <div className="grid w-full gap-5">
                <StatusMessage message={flash.status} />

                <Card variant="navbar">
                    <CardContent className="grid gap-5 p-5 sm:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex min-w-0 items-center gap-3.5">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                                    <Target className="h-6 w-6" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-lg font-medium text-foreground">
                                            {goal.name}
                                        </h2>
                                        <Badge variant={status.variant}>
                                            {status.label}
                                        </Badge>
                                    </div>
                                    <p className="mt-1 text-xs font-light text-muted-foreground">
                                        {goal.target_date
                                            ? `Target ${formatDate(goal.target_date)}`
                                            : 'Tanpa target tanggal'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-left sm:text-right">
                                <p className="text-xs font-light text-muted-foreground">
                                    Progres keseluruhan
                                </p>
                                <p className="mt-1 text-2xl font-medium text-foreground">
                                    {goal.percentage}%
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Progress
                                value={goal.saved_amount}
                                max={goal.target_amount}
                            />
                            <div className="flex justify-between gap-3 text-xs font-light text-muted-foreground">
                                <span>
                                    {formatRupiah(goal.saved_amount)} terkumpul
                                </span>
                                <span>
                                    dari {formatRupiah(goal.target_amount)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Terkumpul"
                        value={formatRupiah(goal.saved_amount)}
                        comparison="Dari setoran berstatus aktif"
                        icon={<PiggyBank className="h-5 w-5 text-success" />}
                        iconBg="bg-success/10"
                    />
                    <SummaryCard
                        title="Target"
                        value={formatRupiah(goal.target_amount)}
                        comparison="Nominal yang ingin dicapai"
                        icon={<Wallet className="h-5 w-5 text-primary" />}
                        iconBg="bg-primary-soft"
                    />
                    <SummaryCard
                        title="Sisa"
                        value={formatRupiah(goal.remaining_amount)}
                        comparison="Nominal yang masih dibutuhkan"
                        icon={<Target className="h-5 w-5 text-accent" />}
                        iconBg="bg-accent-soft"
                    />
                    <SummaryCard
                        title="Target Tanggal"
                        value={
                            goal.target_date
                                ? formatDate(goal.target_date)
                                : 'Fleksibel'
                        }
                        comparison={
                            goal.status === 'completed'
                                ? 'Target sudah tercapai'
                                : 'Tanggal penyelesaian'
                        }
                        icon={
                            goal.status === 'completed' ? (
                                <CheckCircle2 className="h-5 w-5 text-success" />
                            ) : (
                                <CalendarDays className="h-5 w-5 text-warning" />
                            )
                        }
                        iconBg={
                            goal.status === 'completed'
                                ? 'bg-success/10'
                                : 'bg-warning/10'
                        }
                    />
                </div>

                <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                    <Card variant="navbar">
                        <CardContent className="grid gap-4 p-5">
                            <div>
                                <h2 className="text-base font-medium text-foreground">
                                    Tambah setoran
                                </h2>
                                <p className="mt-1 text-xs leading-5 font-light text-muted-foreground">
                                    Catat progres tabungan tanpa mengubah saldo
                                    akun.
                                </p>
                            </div>

                            {permissions.canContribute ? (
                                <SavingsContributionForm
                                    goalId={goal.id}
                                    accountOptions={accountOptions}
                                    defaultDate={defaultContributionDate}
                                />
                            ) : (
                                <div className="rounded-2xl border border-border bg-surface-muted/60 p-4 text-sm font-light text-muted-foreground">
                                    {goal.status === 'completed'
                                        ? 'Target ini sudah selesai dan tidak menerima setoran baru.'
                                        : 'Target ini sudah diarsipkan dan tidak menerima setoran baru.'}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="grid gap-4">
                        <div>
                            <h2 className="text-base font-medium text-foreground">
                                Riwayat setoran
                            </h2>
                            <p className="mt-1 text-xs font-light text-muted-foreground">
                                Setoran dibatalkan tetap ditampilkan sebagai
                                riwayat.
                            </p>
                        </div>

                        {contributions.data.length === 0 ? (
                            <EmptyState
                                icon={<Plus className="h-7 w-7 text-primary" />}
                                title="Belum ada setoran"
                                description="Catat setoran pertama untuk mulai menambah progres target."
                            />
                        ) : (
                            <>
                                <div className="grid gap-3">
                                    {contributions.data.map((contribution) => (
                                        <SavingsContributionCard
                                            key={contribution.id}
                                            contribution={contribution}
                                            onVoid={() =>
                                                setVoidContributionId(
                                                    contribution.id,
                                                )
                                            }
                                        />
                                    ))}
                                </div>

                                <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                                    <p className="text-xs font-light text-muted-foreground">
                                        Menampilkan {contributions.from}–
                                        {contributions.to} dari{' '}
                                        {contributions.total} setoran
                                    </p>
                                    <Pagination links={contributions.links} />
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmationDialog
                open={showArchiveDialog}
                title="Arsipkan target tabungan?"
                description={`Target “${goal.name}” tidak akan menerima setoran baru, tetapi seluruh riwayatnya tetap tersimpan.`}
                processing={archiving}
                onCancel={() => setShowArchiveDialog(false)}
                onConfirm={archiveGoal}
            />

            <VoidSavingsContributionDialog
                contributionId={voidContributionId}
                onClose={() => setVoidContributionId(null)}
            />
        </AppLayout>
    );
}
