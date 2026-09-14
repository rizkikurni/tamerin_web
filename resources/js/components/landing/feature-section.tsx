import {
    BellRing,
    FileSpreadsheet,
    ReceiptText,
    SlidersHorizontal,
    Target,
    TrendingUp,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import Reveal from './reveal';

interface Feature {
    title: string;
    description: string;
    badge: string;
    icon: LucideIcon;
    accent: string;
    iconBg: string;
    iconColor: string;
}

const features: Feature[] = [
    {
        title: 'Transaksi terpusat',
        description:
            'Catat pemasukan dan pengeluaran dari seluruh akun dalam satu alur yang rapi.',
        badge: 'Aktivitas',
        icon: ReceiptText,
        accent: 'bg-primary',
        iconBg: 'bg-primary-soft',
        iconColor: 'text-primary',
    },
    {
        title: 'Anggaran terarah',
        description:
            'Tetapkan batas setiap kategori dan pantau pemakaiannya sebelum pengeluaran berlebih.',
        badge: 'Alokasi',
        icon: SlidersHorizontal,
        accent: 'bg-accent',
        iconBg: 'bg-accent-soft',
        iconColor: 'text-accent',
    },
    {
        title: 'Target tabungan',
        description:
            'Susun target, tenggat, dan kontribusi agar setiap rencana terasa lebih nyata.',
        badge: 'Rencana',
        icon: Target,
        accent: 'bg-secondary',
        iconBg: 'bg-secondary-soft',
        iconColor: 'text-secondary',
    },
    {
        title: 'Aset dan investasi',
        description:
            'Lihat aset serta investasi berdampingan untuk memahami perkembangan kekayaanmu.',
        badge: 'Portofolio',
        icon: TrendingUp,
        accent: 'bg-primary',
        iconBg: 'bg-primary-soft',
        iconColor: 'text-primary',
    },
    {
        title: 'Pengingat kewajiban',
        description:
            'Jangan lewatkan tagihan atau jatuh tempo dengan pengingat yang mudah ditindaklanjuti.',
        badge: 'Jatuh tempo',
        icon: BellRing,
        accent: 'bg-accent',
        iconBg: 'bg-accent-soft',
        iconColor: 'text-accent',
    },
    {
        title: 'Laporan siap unduh',
        description:
            'Pelajari arus keuangan berdasarkan periode lalu ekspor laporannya ke PDF atau XLSX.',
        badge: 'Wawasan',
        icon: FileSpreadsheet,
        accent: 'bg-secondary',
        iconBg: 'bg-secondary-soft',
        iconColor: 'text-secondary',
    },
];

export default function FeatureSection() {
    return (
        <section
            id="fitur"
            className="scroll-mt-24 border-y border-primary/10 bg-surface-tinted/55 px-5 py-24 lg:px-8"
        >
            <div className="mx-auto max-w-7xl">
                <Reveal
                    direction="bottom"
                    className="mx-auto max-w-2xl text-center"
                >
                    <div>
                        <p className="text-sm font-medium text-primary">
                            Semua yang kamu perlukan
                        </p>
                        <h2 className="mt-3 text-3xl font-medium tracking-[-0.025em] text-foreground sm:text-4xl">
                            Dari catatan harian sampai gambaran besar
                        </h2>
                        <p className="mt-4 leading-7 text-foreground-secondary">
                            Setiap bagian saling terhubung agar kondisi keuangan
                            lebih mudah dibaca dan ditindaklanjuti.
                        </p>
                    </div>
                </Reveal>

                <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => (
                        <Reveal
                            key={feature.title}
                            direction="bottom"
                            delay={(index % 3) * 100}
                            className="h-full"
                        >
                            <article className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[22px] border border-primary/10 bg-surface p-6 shadow-[var(--glass-shadow)] transition duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[var(--glass-shadow-hover)]">
                                <span
                                    className={`absolute inset-x-0 top-0 h-1 ${feature.accent}`}
                                />
                                <div>
                                    <div className="flex items-center justify-between gap-3">
                                        <div
                                            className={`grid size-11 place-items-center rounded-xl border border-primary/10 ${feature.iconBg} ${feature.iconColor} transition-transform duration-300 group-hover:scale-105`}
                                        >
                                            <feature.icon className="size-5" />
                                        </div>
                                        <span className="rounded-full border border-primary/10 bg-surface-tinted px-2.5 py-1 text-xs font-medium text-foreground-secondary">
                                            {feature.badge}
                                        </span>
                                    </div>
                                    <h3 className="mt-5 text-lg font-medium text-foreground">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-2 text-sm leading-7 text-foreground-secondary">
                                        {feature.description}
                                    </p>
                                </div>
                            </article>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
