import { Head } from '@inertiajs/react';
import { Tags } from 'lucide-react';

import { store } from '@/actions/App/Http/Controllers/CategoryController';
import CategoryForm from '@/components/categories/category-form';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { index } from '@/routes/categories';
import type { SelectOption } from '@/types';

type CreateCategoryProps = {
    categoryTypes: SelectOption[];
    colorOptions: SelectOption[];
    iconOptions: SelectOption[];
};

export default function CreateCategory({
    categoryTypes,
    colorOptions,
    iconOptions,
}: CreateCategoryProps) {
    return (
        <AppLayout
            title="Tambah Kategori"
            description="Kelompokkan pemasukan dan pengeluaran dengan rapi."
            breadcrumbs={[
                { label: 'Keuangan' },
                { label: 'Kategori', href: index.url() },
                { label: 'Tambah' },
            ]}
            currentPath={index.url()}
        >
            <Head title="Tambah Kategori" />

            <Card>
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
                                Nama harus unik untuk setiap tipe kategori.
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <CategoryForm
                        form={store.form()}
                        categoryTypes={categoryTypes}
                        colorOptions={colorOptions}
                        iconOptions={iconOptions}
                        cancelUrl={index.url()}
                        submitLabel="Simpan Kategori"
                    />
                </CardContent>
            </Card>
        </AppLayout>
    );
}
