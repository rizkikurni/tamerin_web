import { Form } from '@inertiajs/react';
import { CalendarDays, Save, Target } from 'lucide-react';

import { TextField } from '@/components/form-controls';
import Button, { ButtonLink } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { index, show, store, update } from '@/routes/savings-goals';
import type { SavingsGoalFormData } from '@/types';

export default function SavingsGoalForm({
    goal,
}: {
    goal?: SavingsGoalFormData;
}) {
    const isEditing = goal !== undefined;
    const form = isEditing ? update.form.patch(goal.id) : store.form();
    const cancelHref = isEditing ? show.url(goal.id) : index.url();

    return (
        <Card variant="navbar">
            <CardContent className="grid gap-5 p-5 sm:p-6">
                <div className="flex items-start gap-3 border-b border-border/70 pb-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                        <Target className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-medium text-foreground">
                            {isEditing
                                ? 'Informasi target'
                                : 'Target tabungan baru'}
                        </h2>
                        <p className="mt-1 text-sm leading-6 font-light text-muted-foreground">
                            Tentukan nominal yang ingin dicapai dan tanggal
                            target bila diperlukan.
                        </p>
                    </div>
                </div>

                <Form {...form} className="grid gap-4">
                    {({ errors, processing }) => (
                        <>
                            <TextField
                                label="Nama target"
                                name="name"
                                defaultValue={goal?.name ?? ''}
                                placeholder="Contoh: Dana darurat"
                                maxLength={120}
                                required
                                autoFocus
                                error={errors.name}
                            />

                            <TextField
                                label="Target nominal"
                                name="target_amount"
                                type="number"
                                min={1}
                                step={1}
                                defaultValue={goal?.target_amount ?? ''}
                                placeholder="Contoh: 12000000"
                                required
                                error={errors.target_amount}
                            />

                            <TextField
                                label="Target tanggal (opsional)"
                                name="target_date"
                                type="date"
                                defaultValue={goal?.target_date ?? ''}
                                error={errors.target_date}
                            />

                            <div className="flex items-start gap-3 rounded-2xl border border-primary/10 bg-primary-soft/60 p-3.5 dark:border-border dark:bg-background/60">
                                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                <p className="text-xs leading-5 font-light text-muted-foreground">
                                    Tanggal target hanya menjadi panduan. Target
                                    tetap dapat dicapai sebelum atau sesudah
                                    tanggal tersebut.
                                </p>
                            </div>

                            <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
                                <ButtonLink
                                    href={cancelHref}
                                    variant="ghost"
                                    size="sm"
                                >
                                    Batal
                                </ButtonLink>
                                <Button
                                    type="submit"
                                    size="sm"
                                    loading={processing}
                                >
                                    <Save className="h-4 w-4" />
                                    {isEditing
                                        ? 'Simpan perubahan'
                                        : 'Buat target'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </CardContent>
        </Card>
    );
}
