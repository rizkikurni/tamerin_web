import { Head } from '@inertiajs/react';

import AssetForm from '@/components/assets/asset-form';
import AppLayout from '@/layouts/app-layout';
import { index, show } from '@/routes/assets';
import type { AssetFormData, SelectOption } from '@/types';

export default function AssetEdit({
    asset,
    assetTypeOptions,
}: {
    asset: AssetFormData;
    assetTypeOptions: SelectOption[];
}) {
    return (
        <AppLayout
            title="Ubah Aset"
            description="Perbarui informasi dan estimasi nilai terakhir aset."
            breadcrumbs={[
                { label: 'Kekayaan' },
                { label: 'Aset', href: index.url() },
                { label: asset.name, href: show.url(asset.id) },
                { label: 'Ubah' },
            ]}
            currentPath={index.url()}
        >
            <Head title={`Ubah ${asset.name}`} />
            <div className="w-full">
                <AssetForm asset={asset} assetTypeOptions={assetTypeOptions} />
            </div>
        </AppLayout>
    );
}
