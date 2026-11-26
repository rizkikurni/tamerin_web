import { Head, usePage } from '@inertiajs/react';
import { Palette, Send } from 'lucide-react';

import { StatusMessage } from '@/components/form-controls';
import SettingsPanel from '@/components/settings/settings-panel';
import TelegramSettings from '@/components/settings/telegram-settings';
import type { TelegramSettingsData } from '@/components/settings/telegram-settings';
import ThemeSettings from '@/components/settings/theme-settings';
import AppLayout from '@/layouts/app-layout';
import { edit as preferencesEdit } from '@/routes/preferences';
import type { SelectOption } from '@/types';

interface PreferencesPageProps {
    preferences?: {
        financial_cycle_start_day?: number;
        timezone?: string;
    };
    telegram?: TelegramSettingsData;
    accountOptions?: SelectOption[];
}

const defaultTelegramState: TelegramSettingsData = {
    configured: false,
    bot_username: 'tamerin_finance_bot',
    linked: false,
    telegram_username: null,
    telegram_first_name: null,
    linked_at: null,
    default_account_id: null,
    daily_reminder_enabled: true,
    link_token: null,
    connect_url: null,
    link_expires_at: null,
};

export default function Preferences({
    preferences,
    telegram = defaultTelegramState,
    accountOptions = [],
}: PreferencesPageProps) {
    const { flash } = usePage().props;

    return (
        <AppLayout
            title="Preferensi"
            description="Atur tampilan, siklus keuangan, dan integrasi Telegram akun Anda."
            breadcrumbs={[{ label: 'Pengaturan' }, { label: 'Preferensi' }]}
            currentPath={preferencesEdit.url()}
        >
            <Head title="Preferensi" />

            <div className="grid w-full gap-4">
                <StatusMessage message={flash.status} />

                <SettingsPanel
                    title="Tampilan & Siklus Keuangan"
                    description="Pilih mode tampilan, tema warna, serta tanggal mulai siklus keuangan bulanan Anda."
                    icon={Palette}
                >
                    <ThemeSettings
                        initialCycleStartDay={
                            preferences?.financial_cycle_start_day ?? 1
                        }
                        initialTimezone={
                            preferences?.timezone ?? 'Asia/Jakarta'
                        }
                    />
                </SettingsPanel>

                <SettingsPanel
                    title="Integrasi Bot Telegram"
                    description="Hubungkan akun ke Telegram untuk mencatat transaksi harian lewat chat singkat dan menerima pengingat otomatis."
                    icon={Send}
                >
                    <TelegramSettings
                        key={`${telegram.linked}-${telegram.default_account_id ?? 'none'}-${telegram.daily_reminder_enabled}`}
                        telegram={telegram}
                        accountOptions={accountOptions}
                    />
                </SettingsPanel>
            </div>
        </AppLayout>
    );
}
