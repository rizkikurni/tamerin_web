import type { AssetType, InvestmentInstrumentType } from '@/types';

export const investmentInstrumentLabels: Record<
    InvestmentInstrumentType,
    string
> = {
    stock: 'Saham',
    mutual_fund: 'Reksa Dana',
    crypto: 'Crypto',
    bond: 'Obligasi',
    gold: 'Emas',
    other: 'Lainnya',
};

export const assetTypeLabels: Record<AssetType, string> = {
    vehicle: 'Kendaraan',
    electronics: 'Elektronik',
    property: 'Properti',
    jewelry: 'Perhiasan',
    other: 'Lainnya',
};
