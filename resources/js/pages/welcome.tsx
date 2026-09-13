import { Head, Link, usePage } from '@inertiajs/react';
import { Check, CircleDollarSign, ShieldCheck } from 'lucide-react';

import DashboardPreview from '@/components/landing/dashboard-preview';
import FeatureSection from '@/components/landing/feature-section';
import LandingBrand from '@/components/landing/landing-brand';
import LandingPrimaryLink from '@/components/landing/landing-primary-link';
import { dashboard, login, register } from '@/routes';

const benefits = [
    'Ringkasan kondisi keuangan dalam satu dashboard',
    'Kategori dan akun yang fleksibel untuk kebutuhanmu',
    'Tampilan nyaman digunakan pada mode terang dan gelap',
];

export default function Welcome() {
    const { auth } = usePage().props;
    const primaryDestination = auth.user ? dashboard() : register();
    const primaryLabel = auth.user ? 'Buka dashboard' : 'Mulai sekarang';

    return (
        <>
            <Head title="Kelola Keuangan dengan Lebih Tenang">
                <meta
                    name="description"
                    content="Tamerin membantu mencatat transaksi, menyusun anggaran, memantau tabungan, investasi, aset, dan laporan keuangan dalam satu tempat."
                />
            </Head>

            <div className="min-h-screen overflow-hidden bg-background text-foreground">
                <header className="sticky top-0 z-50 border-b border-[var(--glass-border)] bg-background/80 backdrop-blur-xl">
                    <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
                        <LandingBrand />

                        <nav
                            className="hidden items-center gap-8 text-sm text-foreground-secondary md:flex"
                            aria-label="Navigasi utama"
                        >
                            <a
                                href="#fitur"
                                className="transition hover:text-foreground"
                            >
                                Fitur
                            </a>
                            <a
                                href="#cara-kerja"
                                className="transition hover:text-foreground"
                            >
                                Cara kerja
                            </a>
                            <a
                                href="#keamanan"
                                className="transition hover:text-foreground"
                            >
                                Keamanan
                            </a>
                        </nav>

                        <div className="flex items-center gap-2">
                            {!auth.user && (
                                <Link
                                    href={login()}
                                    className="hidden h-10 items-center rounded-xl px-4 text-sm font-medium text-foreground-secondary transition hover:bg-surface-muted hover:text-foreground sm:inline-flex"
                                >
                                    Masuk
                                </Link>
                            )}
                            <LandingPrimaryLink
                                href={primaryDestination}
                                label={primaryLabel}
                                compact
                            />
                        </div>
                    </div>
                </header>

                <main>
                    <section className="relative px-5 pt-20 pb-24 lg:px-8 lg:pt-28 lg:pb-32">
                        <div className="absolute top-16 left-[-8rem] size-72 rounded-full bg-secondary/10 blur-3xl" />
                        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[0.85fr_1.15fr]">
                            <div className="relative z-10 max-w-2xl">
                                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--glass-border-strong)] bg-surface/75 px-3.5 py-2 text-xs text-foreground-secondary shadow-[var(--control-shadow)]">
                                    <CircleDollarSign className="size-4 text-primary" />
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
                                    target, dan pahami perkembangan keuanganmu
                                    tanpa berpindah-pindah aplikasi.
                                </p>
                                <div className="mt-9 flex flex-wrap items-center gap-3">
                                    <LandingPrimaryLink
                                        href={primaryDestination}
                                        label={primaryLabel}
                                    />
                                    {!auth.user && (
                                        <Link
                                            href={login()}
                                            className="inline-flex h-12 items-center gap-2 rounded-xl border border-border-strong bg-surface px-5 text-sm font-medium text-foreground transition hover:bg-surface-muted"
                                        >
                                            Saya sudah punya akun
                                        </Link>
                                    )}
                                </div>
                                <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                                    <ShieldCheck className="size-4 text-success" />
                                    Data setiap pengguna tersimpan terpisah dan
                                    terlindungi.
                                </p>
                            </div>

                            <DashboardPreview />
                        </div>
                    </section>

                    <FeatureSection />

                    <section
                        id="cara-kerja"
                        className="px-5 py-24 lg:px-8 lg:py-32"
                    >
                        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
                            <div>
                                <p className="text-sm font-medium text-primary">
                                    Mulai dari hal sederhana
                                </p>
                                <h2 className="mt-3 max-w-xl text-3xl font-medium tracking-[-0.025em] text-foreground sm:text-4xl">
                                    Kebiasaan kecil yang membentuk kendali besar
                                </h2>
                                <p className="mt-5 max-w-xl leading-7 text-foreground-secondary">
                                    Tamerin dirancang mengikuti alur alami:
                                    siapkan akun, catat aktivitas, lalu gunakan
                                    ringkasannya untuk menentukan langkah
                                    berikutnya.
                                </p>
                                <ul className="mt-8 grid gap-4">
                                    {benefits.map((benefit) => (
                                        <li
                                            key={benefit}
                                            className="flex items-start gap-3 text-sm text-foreground-secondary"
                                        >
                                            <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                                                <Check className="size-3.5" />
                                            </span>
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {[
                                    [
                                        '01',
                                        'Siapkan',
                                        'Tambahkan akun dan kategori sesuai kebutuhanmu.',
                                    ],
                                    [
                                        '02',
                                        'Catat',
                                        'Masukkan transaksi serta perkembangan target secara rutin.',
                                    ],
                                    [
                                        '03',
                                        'Pantau',
                                        'Lihat anggaran, aset, kewajiban, dan pengingat.',
                                    ],
                                    [
                                        '04',
                                        'Evaluasi',
                                        'Baca laporan lalu ambil keputusan dengan data yang jelas.',
                                    ],
                                ].map(([number, title, description]) => (
                                    <article
                                        key={number}
                                        className="rounded-[22px] border border-[var(--glass-border)] bg-surface/80 p-6 shadow-[var(--glass-shadow)] even:sm:translate-y-6"
                                    >
                                        <span className="text-sm font-medium text-primary">
                                            {number}
                                        </span>
                                        <h3 className="mt-5 text-lg font-medium text-foreground">
                                            {title}
                                        </h3>
                                        <p className="mt-2 text-sm leading-7 text-foreground-secondary">
                                            {description}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section
                        id="keamanan"
                        className="px-5 pb-24 lg:px-8 lg:pb-32"
                    >
                        <div className="mx-auto max-w-7xl overflow-hidden rounded-[28px] border border-[var(--glass-border-strong)] bg-surface p-7 shadow-[var(--popup-shadow)] sm:p-10 lg:p-14">
                            <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
                                <div className="max-w-3xl">
                                    <div className="mb-5 grid size-12 place-items-center rounded-2xl bg-primary-soft text-primary">
                                        <ShieldCheck className="size-6" />
                                    </div>
                                    <h2 className="text-3xl font-medium tracking-[-0.025em] text-foreground sm:text-4xl">
                                        Catatan keuanganmu tetap menjadi milikmu
                                    </h2>
                                    <p className="mt-4 max-w-2xl leading-7 text-foreground-secondary">
                                        Akses aplikasi dilindungi autentikasi.
                                        Setiap akun hanya dapat membuka serta
                                        mengelola data keuangannya sendiri.
                                    </p>
                                </div>
                                <LandingPrimaryLink
                                    href={primaryDestination}
                                    label={primaryLabel}
                                />
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="border-t border-[var(--glass-border)] px-5 py-8 lg:px-8">
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
