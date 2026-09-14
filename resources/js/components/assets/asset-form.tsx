import { Form } from '@inertiajs/react';
import { Package, Save } from 'lucide-react';

import {
    SelectField,
    TextAreaField,
    TextField,
} from '@/components/form-controls';
import Button, { ButtonLink } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { index, show, store, update } from '@/routes/assets';
import type { AssetFormData, SelectOption } from '@/types';

type AssetFormProps = {
    asset?: AssetFormData;
    assetTypeOptions: SelectOption[];
    defaultValuedOn?: string;
};

export default function AssetForm({
    asset,
    assetTypeOptions,
    defaultValuedOn,
}: AssetFormProps) {
    const isEditing = asset !== undefined;
    const form = isEditing ? update.form.patch(asset.id) : store.form();
    const cancelHref = isEditing ? show.url(asset.id) : index.url();

    return (
        <Card variant="navbar">
            <CardContent className="grid gap-5 p-5 sm:p-6">
                <div className="flex items-start gap-3 border-b border-border/70 pb-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                        <Package className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-medium text-foreground">
                            {isEditing ? 'Informasi aset' : 'Aset baru'}
                        </h2>
                        <p className="mt-1 text-sm leading-6 font-light text-muted-foreground">
                            Simpan estimasi nilai terbaru untuk aset
                            non-investasi.
                        </p>
                    </div>
                </div>

                <Form {...form} className="grid gap-4">
                    {({ errors, processing }) => (
                        <>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <TextField
                                    label="Nama aset"
                                    name="name"
                                    defaultValue={asset?.name ?? ''}
                                    placeholder="Contoh: Laptop kerja"
                                    maxLength={120}
                                    required
                                    autoFocus
                                    error={errors.name}
                                />
                                <SelectField
                                    label="Jenis aset"
                                    name="asset_type"
                                    defaultValue={asset?.asset_type ?? ''}
                                    required
                                    error={errors.asset_type}
                                >
                                    <option value="" disabled>
                                        Pilih jenis
                                    </option>
                                    {assetTypeOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </SelectField>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <TextField
                                    label="Tanggal perolehan (opsional)"
                                    name="acquired_on"
                                    type="date"
                                    defaultValue={asset?.acquired_on ?? ''}
                                    error={errors.acquired_on}
                                />
                                <TextField
                                    label="Nilai perolehan (opsional)"
                                    name="acquisition_cost"
                                    type="number"
                                    min={0}
                                    step={1}
                                    defaultValue={asset?.acquisition_cost ?? ''}
                                    placeholder="Contoh: 15000000"
                                    error={errors.acquisition_cost}
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <TextField
                                    label="Nilai saat ini"
                                    name="current_value"
                                    type="number"
                                    min={0}
                                    step={1}
                                    defaultValue={asset?.current_value ?? ''}
                                    placeholder="Contoh: 12000000"
                                    required
                                    error={errors.current_value}
                                />
                                <TextField
                                    label="Tanggal penilaian"
                                    name="valued_on"
                                    type="date"
                                    defaultValue={
                                        asset?.valued_on ??
                                        defaultValuedOn ??
                                        ''
                                    }
                                    required
                                    error={errors.valued_on}
                                />
                            </div>

                            <TextAreaField
                                label="Catatan (opsional)"
                                name="note"
                                defaultValue={asset?.note ?? ''}
                                maxLength={500}
                                placeholder="Kondisi, sumber estimasi, atau keterangan lain"
                                error={errors.note}
                            />

                            <p className="rounded-2xl border border-primary/10 bg-primary-soft/60 p-3.5 text-xs leading-5 font-light text-muted-foreground dark:border-border dark:bg-background/60">
                                Versi pertama belum menyimpan histori nilai
                                aset. Mengubah nilai akan mengganti estimasi
                                terakhir.
                            </p>

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
                                        : 'Buat aset'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </CardContent>
        </Card>
    );
}
