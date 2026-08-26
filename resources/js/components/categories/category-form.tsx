import { Form, Link } from '@inertiajs/react';
import { Save } from 'lucide-react';

import { SelectField, TextField } from '@/components/form-controls';
import Button from '@/components/ui/button';
import type { CategoryFormData, SelectOption } from '@/types';

type CategoryFormProps = {
    form: { action: string; method: 'post' };
    categoryTypes: SelectOption[];
    colorOptions: SelectOption[];
    iconOptions: SelectOption[];
    cancelUrl: string;
    category?: CategoryFormData;
    submitLabel: string;
};

export default function CategoryForm({
    form,
    categoryTypes,
    colorOptions,
    iconOptions,
    cancelUrl,
    category,
    submitLabel,
}: CategoryFormProps) {
    return (
        <Form {...form} className="grid gap-5">
            {({ errors, processing }) => (
                <>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <TextField
                            label="Nama kategori"
                            name="name"
                            defaultValue={category?.name ?? ''}
                            placeholder="Contoh: Makanan"
                            maxLength={60}
                            autoFocus
                            required
                            error={errors.name}
                        />
                        <SelectField
                            label="Tipe kategori"
                            name="type"
                            defaultValue={category?.type ?? ''}
                            required
                            error={errors.type}
                        >
                            <option value="" disabled>
                                Pilih tipe kategori
                            </option>
                            {categoryTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </SelectField>
                        <SelectField
                            label="Warna"
                            name="color_token"
                            defaultValue={category?.color_token ?? ''}
                            error={errors.color_token}
                        >
                            <option value="">Tanpa warna khusus</option>
                            {colorOptions.map((color) => (
                                <option key={color.value} value={color.value}>
                                    {color.label}
                                </option>
                            ))}
                        </SelectField>
                        <SelectField
                            label="Ikon"
                            name="icon"
                            defaultValue={category?.icon ?? ''}
                            error={errors.icon}
                        >
                            <option value="">Tanpa ikon khusus</option>
                            {iconOptions.map((icon) => (
                                <option key={icon.value} value={icon.value}>
                                    {icon.label}
                                </option>
                            ))}
                        </SelectField>
                    </div>

                    <div className="flex justify-end gap-2 border-t border-border pt-5">
                        <Link
                            href={cancelUrl}
                            className="inline-flex h-9 items-center justify-center rounded-xl px-3 text-sm font-medium text-foreground transition hover:bg-surface-muted"
                        >
                            Batal
                        </Link>
                        <Button type="submit" size="sm" loading={processing}>
                            <Save className="h-4 w-4" />
                            {submitLabel}
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
}
