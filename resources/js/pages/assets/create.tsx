import { Head } from '@inertiajs/react';

import AssetForm from '@/components/assets/asset-form';
import AppLayout from '@/layouts/app-layout';
import { index } from '@/routes/assets';
import type { SelectOption } from '@/types';

export default function AssetCreate({
    assetTypeOptions,
    defaultValuedOn,
}: {
    assetTypeOptions: SelectOption[];
    defaultValuedOn: string;
}) {
    return (
        <AppLayout
            title="Tambah Aset"
            description="Catat aset dan estimasi nilainya saat ini."
            breadcrumbs={[
                { label: 'Kekayaan' },
                { label: 'Aset', href: index.url() },
                { label: 'Tambah' },
            ]}
            currentPath={index.url()}
        >
            <Head title="Tambah Aset" />
            <div className="mx-auto max-w-3xl">
                <AssetForm
                    assetTypeOptions={assetTypeOptions}
                    defaultValuedOn={defaultValuedOn}
                />
            </div>
        </AppLayout>
    );
}
