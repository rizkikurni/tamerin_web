import { Link, usePage } from '@inertiajs/react';
import { Activity, Check, Compass, PenLine, WalletCards } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import DashboardPreview from '@/components/landing/dashboard-preview';
import FeatureSection from '@/components/landing/feature-section';
import LandingBrand from '@/components/landing/landing-brand';
import LandingHeader from '@/components/landing/landing-header';
import LandingPrimaryLink from '@/components/landing/landing-primary-link';
import Reveal from '@/components/landing/reveal';
import SeoHead from '@/components/seo-head';
import { dashboard, login, register } from '@/routes';

interface WorkflowStep {
    step: string;
    title: string;
    description: string;
    icon: LucideIcon;
}

const benefits = [
    'Ringkasan kondisi keuangan dalam satu dashboard',
    'Kategori dan akun yang fleksibel untuk kebutuhanmu',
    'Tampilan nyaman digunakan pada mode terang dan gelap',
];

const workflowSteps: WorkflowStep[] = [
    {
        step: 'Langkah 1',
        title: 'Siapkan',
        description:
            'Tambahkan akun dan kategori sesuai kebutuhan alur keuanganmu.',
        icon: WalletCards,
    },
    {
        step: 'Langkah 2',
        title: 'Catat',
        description:
            'Masukkan transaksi serta perkembangan target secara rutin.',
        icon: PenLine,
    },
    {
        step: 'Langkah 3',
        title: 'Pantau',
        description:
            'Lihat alokasi anggaran, aset, kewajiban, dan pengingat aktif.',
        icon: Activity,
    },
    {
        step: 'Langkah 4',
        title: 'Evaluasi',
        description:
            'Baca laporan lalu ambil keputusan dengan data yang jelas.',
        icon: Compass,
    },
];

export default function Welcome() {
    const { auth } = usePage().props;
    const primaryDestination = auth.user ? dashboard() : register();
    const primaryLabel = auth.user ? 'Buka dashboard' : 'Mulai sekarang';

    return (
        <>
            <SeoHead title="Kelola Keuangan dengan Lebih Tenang" index />

            <div className="landing-page min-h-screen overflow-x-clip bg-background text-foreground">
                <LandingHeader authenticated={Boolean(auth.user)} />

                <main>
                    <section className="px-5 pt-20 pb-24 lg:px-8 lg:pt-28 lg:pb-32">
                        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[0.85fr_1.15fr]">
                            <Reveal
                                direction="bottom"
                                className="relative z-10 max-w-2xl"
                            >
                                <div>
                                    <div className="mb-6 inline-flex items-center rounded-full border border-primary/20 bg-primary-soft px-3.5 py-2 text-xs text-primary">
                                        Satu tempat untuk seluruh keuanganmu
                                    </div>
                                    <h1 className="text-4xl leading-tight font-medium tracking-[-0.035em] text-foreground sm:text-5xl lg:text-6xl">
                                        Keuangan lebih jelas.{' '}
                                        <span className="text-primary">
                                            Keputusan lebih tenang.
                                        </span>
                                    </h1>
                                    <p className="mt-6 max-w-xl text-base leading-8 text-foreground-secondary sm:text-lg">
                                        Catat transaksi, susun anggaran, kejar
                                        target, dan pahami perkembangan
                                        keuanganmu tanpa berpindah-pindah
                                        aplikasi.
                                    </p>
                                    <div className="mt-9 flex flex-wrap items-center gap-3">
                                        <LandingPrimaryLink
                                            href={primaryDestination}
                                            label={primaryLabel}
                                        />
                                        {!auth.user && (
                                            <Link
                                                href={login()}
                                                className="inline-flex h-12 items-center rounded-xl border border-primary/15 bg-surface px-5 text-sm font-medium text-foreground transition hover:border-primary/30 hover:bg-primary-soft"
                                            >
                                                Saya sudah punya akun
                                            </Link>
                                        )}
                                    </div>
                                    <p className="mt-5 border-l-2 border-success pl-3 text-xs text-muted-foreground">
                                        Data setiap pengguna tersimpan terpisah
                                        dan terlindungi.
                                    </p>
                                </div>
                            </Reveal>

                            <DashboardPreview />
                        </div>
                    </section>

                    <FeatureSection />

                    <section
                        id="cara-kerja"
                        className="scroll-mt-24 px-5 py-24 lg:px-8 lg:py-32"
                    >
                        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
                            <Reveal direction="bottom">
                                <div>
                                    <p className="text-sm font-medium text-primary">
                                        Mulai dari hal sederhana
                                    </p>
                                    <h2 className="mt-3 max-w-xl text-3xl font-medium tracking-[-0.025em] text-foreground sm:text-4xl">
                                        Kebiasaan kecil yang membentuk kendali
                                        besar
                                    </h2>
                                    <p className="mt-5 max-w-xl leading-7 text-foreground-secondary">
                                        Tamerin dirancang mengikuti alur alami:
                                        siapkan akun, catat aktivitas, lalu
                                        gunakan ringkasannya untuk menentukan
                                        langkah berikutnya.
                                    </p>
                                    <ul className="mt-8 grid gap-3">
                                        {benefits.map((benefit) => (
                                            <li
                                                key={benefit}
                                                className="flex items-center gap-3.5 rounded-2xl border border-primary/10 bg-surface p-4 text-sm text-foreground-secondary transition-colors hover:border-primary/20"
                                            >
                                                <span className="grid size-6 shrink-0 place-items-center rounded-lg border border-primary/20 bg-primary-soft text-primary">
                                                    <Check className="size-3.5" />
                                                </span>
                                                <span>{benefit}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Reveal>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {workflowSteps.map((item, index) => (
                                    <Reveal
                                        key={item.title}
                                        direction="bottom"
                                        delay={index * 110}
                                        className="h-full"
                                    >
                                        <article className="group flex h-full flex-col justify-between rounded-[22px] border border-primary/10 bg-surface p-6 shadow-[var(--glass-shadow)] transition duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[var(--glass-shadow-hover)]">
                                            <div>
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="grid size-10 place-items-center rounded-xl border border-primary/15 bg-primary-soft text-primary transition-transform duration-300 group-hover:scale-105">
                                                        <item.icon className="size-5" />
                                                    </div>
                                                    <span className="rounded-full border border-primary/15 bg-surface-tinted px-2.5 py-1 text-xs font-medium text-primary">
                                                        {item.step}
                                                    </span>
                                                </div>
                                                <h3 className="mt-5 text-lg font-medium text-foreground">
                                                    {item.title}
                                                </h3>
                                                <p className="mt-2 text-sm leading-7 text-foreground-secondary">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </article>
                                    </Reveal>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section
                        id="keamanan"
                        className="scroll-mt-24 px-5 pb-24 lg:px-8 lg:pb-32"
                    >
                        <Reveal
                            direction="bottom"
                            className="mx-auto max-w-7xl"
                        >
                            <div className="overflow-hidden rounded-[28px] border border-primary/20 bg-primary-soft/75 p-7 shadow-[var(--glass-shadow)] sm:p-10 lg:p-14">
                                <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
                                    <div className="max-w-3xl">
                                        <p className="text-sm font-medium text-primary">
                                            Privasi sejak awal
                                        </p>
                                        <h2 className="mt-3 text-3xl font-medium tracking-[-0.025em] text-foreground sm:text-4xl">
                                            Catatan keuanganmu tetap menjadi
                                            milikmu
                                        </h2>
                                        <p className="mt-4 max-w-2xl leading-7 text-foreground-secondary">
                                            Akses aplikasi dilindungi
                                            autentikasi. Setiap akun hanya dapat
                                            membuka serta mengelola data
                                            keuangannya sendiri.
                                        </p>
                                    </div>
                                    <LandingPrimaryLink
                                        href={primaryDestination}
                                        label={primaryLabel}
                                    />
                                </div>
                            </div>
                        </Reveal>
                    </section>
                </main>

                <footer className="border-t border-primary/10 px-5 py-8 lg:px-8">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
                        <LandingBrand />
                        <p className="text-center text-xs text-muted-foreground sm:text-right">
                            Kelola uang dengan lebih jelas, satu langkah setiap
                            hari.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
