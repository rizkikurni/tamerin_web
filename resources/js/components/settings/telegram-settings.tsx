import { router } from '@inertiajs/react';
import {
    BellRing,
    Bot,
    Check,
    Copy,
    ExternalLink,
    Link2,
    RefreshCw,
    Save,
    Unplug,
} from 'lucide-react';
import { useState } from 'react';

import {
    destroy,
    generateLinkToken,
    update,
} from '@/actions/App/Http/Controllers/Settings/TelegramIntegrationController';
import { SelectField } from '@/components/form-controls';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import ConfirmationDialog from '@/components/ui/confirmation-dialog';
import { cn } from '@/lib/utils';
import type { SelectOption } from '@/types';

function formatLinkedAt(value: string): string {
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}

export interface TelegramSettingsData {
    configured: boolean;
    bot_username: string;
    linked: boolean;
    telegram_username: string | null;
    telegram_first_name: string | null;
    linked_at: string | null;
    default_account_id: string | null;
    daily_reminder_enabled: boolean;
    link_token: string | null;
    connect_url: string | null;
    link_expires_at: string | null;
}

interface TelegramSettingsProps {
    telegram: TelegramSettingsData;
    accountOptions: SelectOption[];
}

export default function TelegramSettings({
    telegram,
    accountOptions,
}: TelegramSettingsProps) {
    const [defaultAccountId, setDefaultAccountId] = useState(
        telegram.default_account_id ?? '',
    );
    const [dailyReminderEnabled, setDailyReminderEnabled] = useState(
        telegram.daily_reminder_enabled,
    );
    const [generatingLink, setGeneratingLink] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false);
    const [disconnectOpen, setDisconnectOpen] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleGenerateLink = () => {
        router.post(
            generateLinkToken.url(),
            {},
            {
                preserveScroll: true,
                onStart: () => setGeneratingLink(true),
                onFinish: () => setGeneratingLink(false),
            },
        );
    };

    const handleCheckStatus = () => {
        router.reload({
            only: ['telegram'],
            onStart: () => setCheckingStatus(true),
            onFinish: () => setCheckingStatus(false),
        });
    };

    const handleSaveSettings = () => {
        router.patch(
            update.url(),
            {
                default_account_id: defaultAccountId || null,
                daily_reminder_enabled: dailyReminderEnabled,
            },
            {
                preserveScroll: true,
                onStart: () => setSavingSettings(true),
                onFinish: () => setSavingSettings(false),
            },
        );
    };

    const handleDisconnect = () => {
        router.delete(destroy.url(), {
            preserveScroll: true,
            onStart: () => setDisconnecting(true),
            onFinish: () => {
                setDisconnecting(false);
                setDisconnectOpen(false);
            },
        });
    };

    const handleCopyCommand = async () => {
        if (!telegram.link_token) {
            return;
        }

        try {
            await navigator.clipboard.writeText(
                `/start ${telegram.link_token}`,
            );
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

    const connectedIdentity = telegram.telegram_username
        ? `@${telegram.telegram_username}`
        : (telegram.telegram_first_name ?? 'Pengguna Telegram');

    return (
        <div className="grid gap-5">
            {/* Status Header Card */}
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-muted/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                        <Bot className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium text-foreground">
                                @{telegram.bot_username}
                            </p>
                            <Badge
                                variant={telegram.linked ? 'success' : 'muted'}
                            >
                                {telegram.linked
                                    ? 'Terhubung'
                                    : 'Belum Terhubung'}
                            </Badge>
                        </div>
                        <p className="mt-1 text-xs font-light text-muted-foreground">
                            {telegram.linked
                                ? `Terhubung dengan ${connectedIdentity}${telegram.linked_at ? ` • ${formatLinkedAt(telegram.linked_at)}` : ''}`
                                : 'Catat transaksi cepat, cek saldo siklus, dan terima pengingat langsung dari chat Telegram.'}
                        </p>
                    </div>
                </div>

                {telegram.linked && (
                    <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        className="w-full rounded-full sm:w-auto"
                        onClick={() => setDisconnectOpen(true)}
                    >
                        <Unplug className="h-4 w-4" />
                        <span>Putuskan</span>
                    </Button>
                )}
            </div>

            {!telegram.configured && (
                <div className="rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3 text-xs leading-5 font-normal text-foreground">
                    Token bot Telegram (<code>TELEGRAM_BOT_TOKEN</code>) belum
                    diatur pada konfigurasi server.
                </div>
            )}

            {!telegram.linked ? (
                <div className="grid gap-4">
                    <div className="grid gap-2.5 sm:grid-cols-3">
                        <div className="rounded-2xl border border-border bg-surface p-3.5">
                            <p className="text-xs font-medium text-foreground">
                                1. Catat 1 Baris Chat
                            </p>
                            <p className="mt-1 text-xs leading-5 font-light text-muted-foreground">
                                Ketik <code>13rb warteg</code> atau{' '}
                                <code>+ 5jt gaji</code> langsung tercatat ke
                                buku besar.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-border bg-surface p-3.5">
                            <p className="text-xs font-medium text-foreground">
                                2. Cek Saldo & Siklus
                            </p>
                            <p className="mt-1 text-xs leading-5 font-light text-muted-foreground">
                                Gunakan <code>/saldo</code>,{' '}
                                <code>/ringkasan</code>, dan{' '}
                                <code>/budget</code> kapan saja.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-border bg-surface p-3.5">
                            <p className="text-xs font-medium text-foreground">
                                3. Pengingat Otomatis
                            </p>
                            <p className="mt-1 text-xs leading-5 font-light text-muted-foreground">
                                Terima notifikasi pengingat jatuh tempo tanpa
                                perlu buka browser.
                            </p>
                        </div>
                    </div>

                    {telegram.connect_url && telegram.link_token && (
                        <div className="grid gap-3 rounded-2xl border border-primary/30 bg-primary-soft/50 p-4">
                            <div>
                                <p className="text-sm font-medium text-foreground">
                                    Link Penghubung Siap Digunakan
                                </p>
                                <p className="mt-0.5 text-xs font-light text-muted-foreground">
                                    Klik tombol di bawah untuk membuka Telegram,
                                    lalu tekan <b>Start</b> pada chat bot. Link
                                    berlaku 15 menit.
                                </p>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                                <a
                                    href={telegram.connect_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-4 text-xs font-medium text-primary-foreground shadow-[var(--brand-shadow)] transition hover:brightness-105"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    <span>
                                        Buka @{telegram.bot_username} & Klik
                                        Start
                                    </span>
                                </a>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full px-3.5"
                                    onClick={handleCopyCommand}
                                >
                                    {copied ? (
                                        <Check className="h-4 w-4 text-success" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                    <span>
                                        {copied
                                            ? 'Tersalin!'
                                            : 'Salin Kode /start'}
                                    </span>
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    loading={checkingStatus}
                                    className="rounded-full px-3.5"
                                    onClick={handleCheckStatus}
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    <span>Sudah Klik Start? Cek Status</span>
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-start">
                        <Button
                            type="button"
                            size="sm"
                            loading={generatingLink}
                            disabled={!telegram.configured}
                            className="rounded-full px-4"
                            onClick={handleGenerateLink}
                        >
                            <Link2 className="h-4 w-4" />
                            <span>
                                {telegram.connect_url
                                    ? 'Buat Ulang Link Telegram'
                                    : 'Hubungkan Telegram Sekarang'}
                            </span>
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="grid gap-5">
                    <div className="grid gap-4 md:grid-cols-2">
                        <SelectField
                            label="Akun default pencatatan cepat"
                            name="default_account_id"
                            value={defaultAccountId}
                            onChange={(event) =>
                                setDefaultAccountId(event.target.value)
                            }
                        >
                            <option value="">
                                Tanya lewat tombol setiap mencatat
                            </option>
                            {accountOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </SelectField>

                        <div className="grid gap-2">
                            <span className="text-xs font-medium text-foreground-secondary">
                                Notifikasi pengingat harian
                            </span>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={dailyReminderEnabled}
                                onClick={() =>
                                    setDailyReminderEnabled(
                                        (current) => !current,
                                    )
                                }
                                className={cn(
                                    'flex min-h-11 items-center justify-between gap-3 rounded-[14px] border px-3.5 py-2.5 text-left transition',
                                    dailyReminderEnabled
                                        ? 'border-primary/40 bg-primary-soft/50 text-foreground'
                                        : 'border-[var(--control-border)] bg-[var(--control-background)] text-muted-foreground',
                                )}
                            >
                                <span className="flex items-center gap-2.5 text-xs font-normal">
                                    <BellRing className="h-4 w-4 shrink-0 text-primary" />
                                    <span>
                                        Kirim ringkasan jatuh tempo pukul 07:00
                                    </span>
                                </span>
                                <span
                                    className={cn(
                                        'rounded-full px-2.5 py-0.5 text-[11px] font-medium',
                                        dailyReminderEnabled
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-surface-muted text-muted-foreground',
                                    )}
                                >
                                    {dailyReminderEnabled
                                        ? 'Aktif'
                                        : 'Nonaktif'}
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-surface-muted/50 p-4">
                        <p className="text-xs font-medium text-foreground">
                            Contoh Chat Cepat ke @{telegram.bot_username}
                        </p>
                        <div className="mt-2 grid gap-1.5 text-xs font-light text-muted-foreground sm:grid-cols-2">
                            <p>
                                • Pengeluaran: <code>13rb warteg</code> atau{' '}
                                <code>- 25k bensin @bri</code>
                            </p>
                            <p>
                                • Pemasukan: <code>+ 5jt gaji @bca</code>
                            </p>
                            <p>
                                • Transfer: <code>tf 200rb bri ke gopay</code>
                            </p>
                            <p>
                                • Perintah: <code>/saldo</code>,{' '}
                                <code>/ringkasan</code>, <code>/budget</code>,{' '}
                                <code>/pengingat</code>
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end border-t border-border pt-4">
                        <Button
                            type="button"
                            size="sm"
                            loading={savingSettings}
                            className="rounded-full px-5"
                            onClick={handleSaveSettings}
                        >
                            <Save className="h-4 w-4" />
                            <span>Simpan Pengaturan Telegram</span>
                        </Button>
                    </div>
                </div>
            )}

            <ConfirmationDialog
                open={disconnectOpen}
                title="Putuskan sambungan Telegram?"
                description="Bot tidak lagi dapat mencatat transaksi atau mengirim pengingat ke akun Telegram Anda sampai dihubungkan kembali."
                confirmLabel="Putuskan"
                processing={disconnecting}
                onCancel={() => setDisconnectOpen(false)}
                onConfirm={handleDisconnect}
            />
        </div>
    );
}
