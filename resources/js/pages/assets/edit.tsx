import { Head } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import AssetForm from '@/components/assets/asset-form';
import { ButtonLink } from '@/components/ui/button';
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
            <div className="grid w-full gap-4">
                <div>
                    <ButtonLink
                        href={show.url(asset.id)}
                        variant="outline"
                        size="sm"
                        className="rounded-full px-3.5 shadow-[var(--control-shadow)]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Kembali ke Detail Aset</span>
                    </ButtonLink>
                </div>

                <AssetForm asset={asset} assetTypeOptions={assetTypeOptions} />
            </div>
        </AppLayout>
    );
}
