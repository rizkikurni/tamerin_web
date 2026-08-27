import { Form } from '@inertiajs/react';
import { Plus } from 'lucide-react';

import { TextAreaField, TextField } from '@/components/form-controls';
import Button from '@/components/ui/button';
import { store } from '@/routes/investments/valuations';

export default function InvestmentValuationForm({
    investmentId,
    defaultDate,
}: {
    investmentId: string;
    defaultDate: string;
}) {
    return (
        <Form
            {...store.form(investmentId)}
            options={{ preserveScroll: true }}
            resetOnSuccess
            className="grid gap-4"
        >
            {({ errors, processing }) => (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                        <TextField
                            label="Tanggal nilai"
                            name="valued_on"
                            type="date"
                            defaultValue={defaultDate}
                            required
                            error={errors.valued_on}
                        />
                        <TextField
                            label="Nilai terbaru"
                            name="value"
                            type="number"
                            min={0}
                            step={1}
                            placeholder="Contoh: 12500000"
                            required
                            error={errors.value}
                        />
                    </div>
                    <TextAreaField
                        label="Catatan sumber (opsional)"
                        name="note"
                        maxLength={500}
                        placeholder="Contoh: Harga penutupan aplikasi broker"
                        error={errors.note}
                    />
                    <p className="text-xs leading-5 font-light text-muted-foreground">
                        Satu tanggal hanya dapat dipakai sekali, termasuk
                        valuasi yang nantinya dibatalkan.
                    </p>
                    <Button type="submit" size="sm" loading={processing}>
                        <Plus className="h-4 w-4" />
                        Catat valuasi
                    </Button>
                </>
            )}
        </Form>
    );
}
