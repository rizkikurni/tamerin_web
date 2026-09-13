import {
    BellRing,
    FileSpreadsheet,
    Landmark,
    PiggyBank,
    ReceiptText,
    Target,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Feature {
    title: string;
    description: string;
    icon: LucideIcon;
    tone: string;
}

const features: Feature[] = [
    {
        title: 'Transaksi terpusat',
        description:
            'Catat pemasukan dan pengeluaran dari seluruh akun dalam satu alur yang rapi.',
        icon: ReceiptText,
        tone: 'bg-primary-soft text-primary',
    },
    {
        title: 'Anggaran terarah',
        description:
            'Tetapkan batas setiap kategori dan pantau pemakaiannya sebelum pengeluaran berlebih.',
        icon: Target,
        tone: 'bg-accent-soft text-accent',
    },
    {
        title: 'Target tabungan',
        description:
            'Susun target, tenggat, dan kontribusi agar setiap rencana terasa lebih nyata.',
        icon: PiggyBank,
        tone: 'bg-secondary-soft text-secondary',
    },
    {
        title: 'Aset dan investasi',
        description:
            'Lihat aset serta investasi berdampingan untuk memahami perkembangan kekayaanmu.',
        icon: Landmark,
        tone: 'bg-primary-soft text-primary',
    },
    {
        title: 'Pengingat kewajiban',
        description:
            'Jangan lewatkan tagihan atau jatuh tempo dengan pengingat yang mudah ditindaklanjuti.',
        icon: BellRing,
        tone: 'bg-accent-soft text-accent',
    },
    {
        title: 'Laporan siap unduh',
        description:
            'Pelajari arus keuangan berdasarkan periode lalu ekspor laporannya ke PDF atau XLSX.',
        icon: FileSpreadsheet,
        tone: 'bg-secondary-soft text-secondary',
    },
];

export default function FeatureSection() {
    return (
        <section
            id="fitur"
            className="border-y border-[var(--glass-border)] bg-surface/45 px-5 py-24 lg:px-8"
        >
            <div className="mx-auto max-w-7xl">
                <div className="mx-auto max-w-2xl text-center">
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

                <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => {
                        const Icon = feature.icon;

                        return (
                            <article
                                key={feature.title}
                                className="group rounded-[22px] border border-[var(--glass-border)] bg-surface/85 p-6 shadow-[var(--glass-shadow)] transition duration-200 hover:-translate-y-1 hover:border-[var(--glass-border-strong)] hover:shadow-[var(--glass-shadow-hover)]"
                            >
                                <div
                                    className={`grid size-11 place-items-center rounded-xl ${feature.tone}`}
                                >
                                    <Icon className="size-5" />
                                </div>
                                <h3 className="mt-5 text-lg font-medium text-foreground">
                                    {feature.title}
                                </h3>
                                <p className="mt-2 text-sm leading-7 text-foreground-secondary">
                                    {feature.description}
                                </p>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
