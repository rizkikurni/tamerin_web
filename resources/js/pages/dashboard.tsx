import { useTheme } from '@/hooks/use-theme';

export default function Dashboard() {
    const {
    mode,
    preset,
    setMode,
    setPreset,
} = useTheme();

    return (
        <div className="min-h-screen bg-background p-8 text-foreground">
            <div className="rounded-3xl border border-border bg-surface p-6">
                <p className="text-sm text-muted-foreground">
                    Mode sekarang: {mode}
                </p>

                <h1 className="mt-2 text-3xl font-semibold">
                    Rp12.500.000
                </h1>

                <div className="mt-6 flex gap-2">
                    <button
                        className="rounded-xl border border-border px-4 py-2"
                        onClick={() => setMode('light')}
                    >
                        Light
                    </button>

                    <button
                        className="rounded-xl border border-border px-4 py-2"
                        onClick={() => setMode('dark')}
                    >
                        Dark
                    </button>

                    <button
                        className="rounded-xl border border-border px-4 py-2"
                        onClick={() => setMode('system')}
                    >
                        System
                    </button>
                </div>

                <div className="mt-4 flex gap-2">
    <button
        onClick={() => setPreset('ocean')}
        className="rounded-xl bg-primary px-4 py-2 text-primary-foreground"
    >
        Ocean
    </button>

    <button
        onClick={() => setPreset('forest')}
        className="rounded-xl bg-primary px-4 py-2 text-primary-foreground"
    >
        Forest
    </button>

    <button
        onClick={() => setPreset('violet')}
        className="rounded-xl bg-primary px-4 py-2 text-primary-foreground"
    >
        Violet
    </button>
</div>
            </div>
        </div>
    );
}
