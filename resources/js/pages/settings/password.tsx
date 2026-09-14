import { Form, Head, usePage } from '@inertiajs/react';
import { KeyRound, Save, ShieldCheck } from 'lucide-react';

import { update } from '@/actions/App/Http/Controllers/Settings/PasswordController';
import { StatusMessage, TextField } from '@/components/form-controls';
import SettingsPanel from '@/components/settings/settings-panel';
import Button from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { edit as passwordEdit } from '@/routes/password';

export default function Password() {
    const { flash } = usePage().props;

    return (
        <AppLayout
            title="Kata Sandi"
            description="Perbarui keamanan akun Anda."
            breadcrumbs={[{ label: 'Pengaturan' }, { label: 'Kata Sandi' }]}
            currentPath={passwordEdit.url()}
        >
            <Head title="Kata Sandi" />

            <div className="grid w-full gap-4">
                <StatusMessage message={flash.status} />

                <SettingsPanel
                    title="Ubah Kata Sandi"
                    description="Gunakan kata sandi yang kuat dan berbeda dari layanan lainnya."
                    icon={KeyRound}
                >
                    <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface-muted/70 p-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
                            <ShieldCheck className="h-4 w-4" />
                        </div>
                        <div className="grid gap-1">
                            <p className="text-sm font-medium text-foreground">
                                Jaga keamanan akun
                            </p>
                            <p className="text-xs leading-relaxed font-light text-muted-foreground">
                                Hindari kata sandi yang mudah ditebak dan jangan
                                gunakan kembali kata sandi dari akun lain.
                            </p>
                        </div>
                    </div>

                    <Form
                        {...update.form()}
                        resetOnSuccess
                        className="grid gap-5"
                    >
                        {({ errors, processing }) => (
                            <>
                                <TextField
                                    label="Kata sandi saat ini"
                                    name="current_password"
                                    type="password"
                                    autoComplete="current-password"
                                    autoFocus
                                    required
                                    error={errors.current_password}
                                />

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <TextField
                                        label="Kata sandi baru"
                                        name="password"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        error={errors.password}
                                    />
                                    <TextField
                                        label="Konfirmasi kata sandi baru"
                                        name="password_confirmation"
                                        type="password"
                                        autoComplete="new-password"
                                        required
                                        error={errors.password_confirmation}
                                    />
                                </div>

                                <div className="flex justify-end border-t border-border pt-5">
                                    <Button
                                        type="submit"
                                        size="sm"
                                        loading={processing}
                                    >
                                        <Save className="h-4 w-4" />
                                        Perbarui Kata Sandi
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
