import { Head } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import AssetForm from '@/components/assets/asset-form';
import { ButtonLink } from '@/components/ui/button';
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
            <div className="grid w-full gap-4">
                <div>
                    <ButtonLink
                        href={index.url()}
                        variant="outline"
                        size="sm"
                        className="rounded-full px-3.5 shadow-[var(--control-shadow)]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Kembali ke Aset</span>
                    </ButtonLink>
                </div>

                <AssetForm
                    assetTypeOptions={assetTypeOptions}
                    defaultValuedOn={defaultValuedOn}
                />
            </div>
        </AppLayout>
    );
}
