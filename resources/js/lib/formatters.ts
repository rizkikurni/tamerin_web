export function formatRupiah(value: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

export function formatCompactRupiah(value: number): string {
    if (Math.abs(value) >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(1)}jt`;
    }

    if (Math.abs(value) >= 1_000) {
        return `${(value / 1_000).toFixed(0)}rb`;
    }

    return value.toString();
}

export function formatDate(
    value: string,
    options: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    },
): string {
    return new Intl.DateTimeFormat('id-ID', {
        ...options,
        timeZone: 'UTC',
    }).format(new Date(`${value}T00:00:00Z`));
}
