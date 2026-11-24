import { Form } from '@inertiajs/react';
import { Package, RotateCcw, Save, Sparkles } from 'lucide-react';
import { useState } from 'react';

import { TextAreaField, TextField } from '@/components/form-controls';
import Button, { ButtonLink } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatRupiah } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { index, show, store, update } from '@/routes/assets';
import type { AssetFormData, SelectOption } from '@/types';

type AssetFormProps = {
    asset?: AssetFormData;
    assetTypeOptions: SelectOption[];
    defaultValuedOn?: string;
};

const SUGGESTIONS = [
    'Rumah Tinggal',
    'Tanah Kavling',
    'Sepeda Motor',
    'Mobil Keluarga',
    'Laptop / PC Kerja',
    'Emas Batangan',
    'Smartphone',
];

const AMOUNT_PRESETS = [
    { label: '+1 Jt', value: 1_000_000 },
    { label: '+5 Jt', value: 5_000_000 },
    { label: '+10 Jt', value: 10_000_000 },
    { label: '+50 Jt', value: 50_000_000 },
    { label: '+100 Jt', value: 100_000_000 },
    { label: '+500 Jt', value: 500_000_000 },
];

function getTodayString(): string {
    return new Date().toISOString().split('T')[0];
}

function getYesterdayString(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);

    return d.toISOString().split('T')[0];
}

export default function AssetForm({
    asset,
    assetTypeOptions,
    defaultValuedOn,
}: AssetFormProps) {
    const isEditing = asset !== undefined;
    const form = isEditing ? update.form.patch(asset.id) : store.form();
    const cancelHref = isEditing ? show.url(asset.id) : index.url();

    const [name, setName] = useState(asset?.name ?? '');
    const [assetType, setAssetType] = useState(
        asset?.asset_type ?? assetTypeOptions[0]?.value ?? '',
    );
    const [currentValue, setCurrentValue] = useState<number | ''>(
        asset?.current_value ?? '',
    );
    const [acquisitionCost, setAcquisitionCost] = useState<number | ''>(
        asset?.acquisition_cost ?? '',
    );
    const [valuedOn, setValuedOn] = useState(
        asset?.valued_on ?? defaultValuedOn ?? getTodayString(),
    );
    const [acquiredOn, setAcquiredOn] = useState(asset?.acquired_on ?? '');

    const addCurrentValue = (added: number) => {
        const current = typeof currentValue === 'number' ? currentValue : 0;
        setCurrentValue(current + added);
    };

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
                            Catat kepemilikan aset riil, estimasi nilai pasar,
                            dan riwayat perolehannya.
                        </p>
                    </div>
                </div>

                <Form {...form} className="grid gap-5">
                    {({ errors, processing }) => (
                        <>
                            {/* Jenis Aset - 1-Tap Pills */}
                            <div className="grid gap-2">
                                <label
                                    htmlFor="asset_type"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Jenis aset{' '}
                                    <span className="text-danger">*</span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {assetTypeOptions.map((opt) => {
                                        const isSelected =
                                            assetType === opt.value;

                                        return (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() =>
                                                    setAssetType(opt.value)
                                                }
                                                className={cn(
                                                    'inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-medium transition-all active:scale-95',
                                                    isSelected
                                                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                                                        : 'border-border/80 bg-surface text-muted-foreground hover:border-primary/50 hover:text-foreground',
                                                )}
                                            >
                                                {opt.label}
                                            </button>
                                        );
                                    })}
                                </div>
                                <input
                                    id="asset_type"
                                    type="hidden"
                                    name="asset_type"
                                    value={assetType}
                                />
                                {errors.asset_type && (
                                    <p className="text-xs text-danger">
                                        {errors.asset_type}
                                    </p>
                                )}
                            </div>

                            {/* Nama Aset */}
                            <div className="grid gap-2">
                                <TextField
                                    label="Nama aset"
                                    name="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Contoh: Rumah Tinggal Bintaro atau Honda Vario 160"
                                    maxLength={120}
                                    required
                                    autoFocus
                                    error={errors.name}
                                />
                                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                    <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                                        <Sparkles className="h-3 w-3 text-primary" />
                                        Inspirasi:
                                    </span>
                                    {SUGGESTIONS.map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => setName(preset)}
                                            className={cn(
                                                'rounded-lg border px-2 py-0.5 text-xs font-normal transition-all',
                                                name === preset
                                                    ? 'border-primary bg-primary-soft text-primary'
                                                    : 'border-border/80 bg-surface text-muted-foreground hover:border-primary/50 hover:text-foreground',
                                            )}
                                        >
                                            {preset}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Nilai Saat Ini */}
                            <div className="grid gap-2">
                                <div className="flex items-baseline justify-between">
                                    <label
                                        htmlFor="current_value"
                                        className="text-sm font-medium text-foreground"
                                    >
                                        Estimasi nilai saat ini{' '}
                                        <span className="text-danger">*</span>
                                    </label>
                                    {typeof currentValue === 'number' &&
                                        currentValue > 0 && (
                                            <span className="text-xs font-semibold text-primary">
                                                {formatRupiah(currentValue)}
                                            </span>
                                        )}
                                </div>
                                <div className="relative">
                                    <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                                        Rp
                                    </span>
                                    <input
                                        id="current_value"
                                        name="current_value"
                                        type="number"
                                        min={0}
                                        step={1}
                                        value={currentValue}
                                        onChange={(e) =>
                                            setCurrentValue(
                                                e.target.value === ''
                                                    ? ''
                                                    : Number(e.target.value),
                                            )
                                        }
                                        placeholder="0"
                                        required
                                        className={cn(
                                            'border-input focus:border-ring focus:ring-ring w-full rounded-2xl border bg-surface py-2.5 pr-4 pl-10 text-sm font-medium text-foreground shadow-[var(--control-shadow)] placeholder:text-muted-foreground focus:ring-1 focus:outline-none',
                                            errors.current_value &&
                                                'border-danger focus:border-danger focus:ring-danger',
                                        )}
                                    />
                                </div>
                                {errors.current_value && (
                                    <p className="text-xs text-danger">
                                        {errors.current_value}
                                    </p>
                                )}
                                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                    <span className="text-[11px] font-medium text-muted-foreground">
                                        Tambah cepat:
                                    </span>
                                    {AMOUNT_PRESETS.map((chip) => (
                                        <button
                                            key={chip.label}
                                            type="button"
                                            onClick={() =>
                                                addCurrentValue(chip.value)
                                            }
                                            className="rounded-lg border border-border/80 bg-surface px-2.5 py-1 text-xs font-medium text-foreground transition-all hover:border-primary/50 hover:bg-primary-soft hover:text-primary active:scale-95"
                                        >
                                            {chip.label}
                                        </button>
                                    ))}
                                    {typeof currentValue === 'number' &&
                                        currentValue > 0 && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setCurrentValue('')
                                                }
                                                className="inline-flex items-center gap-1 rounded-lg border border-border/80 bg-surface px-2 py-1 text-xs font-light text-muted-foreground hover:bg-danger/10 hover:text-danger"
                                            >
                                                <RotateCcw className="h-3 w-3" />
                                                Reset
                                            </button>
                                        )}
                                </div>
                            </div>

                            {/* Tanggal Penilaian */}
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between">
                                    <label
                                        htmlFor="valued_on"
                                        className="text-sm font-medium text-foreground"
                                    >
                                        Tanggal estimasi nilai{' '}
                                        <span className="text-danger">*</span>
                                    </label>
                                    <div className="flex items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setValuedOn(getTodayString())
                                            }
                                            className={cn(
                                                'rounded px-1.5 py-0.5 text-[11px] transition-colors',
                                                valuedOn === getTodayString()
                                                    ? 'bg-primary-soft font-semibold text-primary'
                                                    : 'text-muted-foreground hover:text-foreground',
                                            )}
                                        >
                                            Hari ini
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setValuedOn(
                                                    getYesterdayString(),
                                                )
                                            }
                                            className={cn(
                                                'rounded px-1.5 py-0.5 text-[11px] transition-colors',
                                                valuedOn ===
                                                    getYesterdayString()
                                                    ? 'bg-primary-soft font-semibold text-primary'
                                                    : 'text-muted-foreground hover:text-foreground',
                                            )}
                                        >
                                            Kemarin
                                        </button>
                                    </div>
                                </div>
                                <input
                                    id="valued_on"
                                    name="valued_on"
                                    type="date"
                                    value={valuedOn}
                                    onChange={(e) =>
                                        setValuedOn(e.target.value)
                                    }
                                    required
                                    className={cn(
                                        'border-input focus:border-ring focus:ring-ring w-full rounded-2xl border bg-surface px-3 py-2 text-sm text-foreground shadow-[var(--control-shadow)] focus:ring-1 focus:outline-none',
                                        errors.valued_on &&
                                            'border-danger focus:border-danger focus:ring-danger',
                                    )}
                                />
                                {errors.valued_on && (
                                    <p className="text-xs text-danger">
                                        {errors.valued_on}
                                    </p>
                                )}
                            </div>

                            {/* Riwayat Perolehan (Opsional) */}
                            <div className="grid gap-4 rounded-2xl border border-border/70 bg-surface-muted/30 p-4 sm:grid-cols-2">
                                <div className="grid gap-1.5">
                                    <TextField
                                        label="Tanggal perolehan (opsional)"
                                        name="acquired_on"
                                        type="date"
                                        value={acquiredOn}
                                        onChange={(e) =>
                                            setAcquiredOn(e.target.value)
                                        }
                                        error={errors.acquired_on}
                                    />
                                </div>
                                <div className="grid gap-1.5">
                                    <div className="flex items-baseline justify-between">
                                        <label
                                            htmlFor="acquisition_cost"
                                            className="text-xs font-medium text-foreground"
                                        >
                                            Nilai perolehan / beli (opsional)
                                        </label>
                                        {typeof acquisitionCost === 'number' &&
                                            acquisitionCost > 0 && (
                                                <span className="text-[11px] font-semibold text-muted-foreground">
                                                    {formatRupiah(
                                                        acquisitionCost,
                                                    )}
                                                </span>
                                            )}
                                    </div>
                                    <input
                                        id="acquisition_cost"
                                        name="acquisition_cost"
                                        type="number"
                                        min={0}
                                        step={1}
                                        value={acquisitionCost}
                                        onChange={(e) =>
                                            setAcquisitionCost(
                                                e.target.value === ''
                                                    ? ''
                                                    : Number(e.target.value),
                                            )
                                        }
                                        placeholder="0"
                                        className={cn(
                                            'border-input focus:border-ring focus:ring-ring w-full rounded-2xl border bg-surface px-3 py-2 text-sm text-foreground shadow-[var(--control-shadow)] placeholder:text-muted-foreground focus:ring-1 focus:outline-none',
                                            errors.acquisition_cost &&
                                                'border-danger focus:border-danger focus:ring-danger',
                                        )}
                                    />
                                    {errors.acquisition_cost && (
                                        <p className="text-xs text-danger">
                                            {errors.acquisition_cost}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <TextAreaField
                                label="Catatan (opsional)"
                                name="note"
                                defaultValue={asset?.note ?? ''}
                                maxLength={500}
                                placeholder="Kondisi barang, kelengkapan surat, nomor seri, dll"
                                error={errors.note}
                            />

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
