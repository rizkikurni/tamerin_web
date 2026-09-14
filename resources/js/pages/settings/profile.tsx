import { Form, Head, usePage } from '@inertiajs/react';
import { Save, UserRound } from 'lucide-react';

import { update } from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { StatusMessage, TextField } from '@/components/form-controls';
import SettingsPanel from '@/components/settings/settings-panel';
import Button from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { edit as profileEdit } from '@/routes/profile';

type ProfileUser = {
    id: string;
    name: string;
    email: string;
};

export default function Profile({ user }: { user: ProfileUser }) {
    const { flash } = usePage().props;
    const initial = user.name.trim().charAt(0).toUpperCase() || 'U';

    return (
        <AppLayout
            title="Profil"
            description="Kelola informasi dasar akun Anda."
            breadcrumbs={[{ label: 'Pengaturan' }, { label: 'Profil' }]}
            currentPath={profileEdit.url()}
        >
            <Head title="Profil" />

            <div className="grid w-full gap-4">
                <StatusMessage message={flash.status} />

                <SettingsPanel
                    title="Informasi Profil"
                    description="Perbarui nama dan alamat email yang digunakan pada akun Tamerin."
                    icon={UserRound}
                >
                    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-muted/70 p-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-base font-medium text-primary-foreground shadow-[var(--brand-shadow)]">
                            {initial}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                                {user.name}
                            </p>
                            <p className="truncate text-xs font-light text-muted-foreground">
                                {user.email}
                            </p>
                        </div>
                    </div>

                    <Form {...update.form()} className="grid gap-5">
                        {({ errors, processing }) => (
                            <>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <TextField
                                        label="Nama"
                                        name="name"
                                        defaultValue={user.name}
                                        autoComplete="name"
                                        autoFocus
                                        required
                                        error={errors.name}
                                    />
                                    <TextField
                                        label="Email"
                                        name="email"
                                        type="email"
                                        defaultValue={user.email}
                                        autoComplete="email"
                                        required
                                        error={errors.email}
                                    />
                                </div>

                                <div className="flex justify-end border-t border-border pt-5">
                                    <Button
                                        type="submit"
                                        size="sm"
                                        loading={processing}
                                    >
                                        <Save className="h-4 w-4" />
                                        Simpan Profil
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </SettingsPanel>
            </div>
        </AppLayout>
    );
}
