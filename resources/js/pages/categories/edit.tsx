import { Head } from '@inertiajs/react';
import { Tags } from 'lucide-react';

import { update } from '@/actions/App/Http/Controllers/CategoryController';
import CategoryForm from '@/components/categories/category-form';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { index } from '@/routes/categories';
import type { CategoryFormData, SelectOption } from '@/types';

type EditCategoryProps = {
    category: CategoryFormData;
    categoryTypes: SelectOption[];
    colorOptions: SelectOption[];
    iconOptions: SelectOption[];
};

export default function EditCategory({
    category,
    categoryTypes,
    colorOptions,
    iconOptions,
}: EditCategoryProps) {
    return (
        <AppLayout
            title="Edit Kategori"
            description="Perbarui identitas kategori yang masih aktif."
            breadcrumbs={[
                { label: 'Keuangan' },
                { label: 'Kategori', href: index.url() },
                { label: 'Edit' },
            ]}
            currentPath={index.url()}
        >
            <Head title={`Edit ${category.name}`} />

            <Card className="mx-auto max-w-3xl">
                <CardHeader>
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                            <Tags className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-base font-medium text-foreground">
                                Informasi kategori
                            </h1>
                            <p className="mt-1 text-sm font-light text-muted-foreground">
                                Histori transaksi dan budget tetap
                                dipertahankan.
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <CategoryForm
                        form={update.form.patch(category.id)}
                        categoryTypes={categoryTypes}
                        colorOptions={colorOptions}
                        iconOptions={iconOptions}
                        cancelUrl={index.url()}
                        category={category}
                        submitLabel="Simpan Perubahan"
                    />
                </CardContent>
            </Card>
        </AppLayout>
    );
}
