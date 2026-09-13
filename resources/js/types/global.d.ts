import type { Auth } from '@/types/auth';
import type { ThemePreferences } from '@/types/theme';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            seo: {
                siteName: string;
                description: string;
                homeUrl: string;
                locale: string;
                language: string;
            };
            auth: Auth;
            flash: {
                status: string | null;
            };
            theme?: ThemePreferences | null;
            [key: string]: unknown;
        };
    }
}
