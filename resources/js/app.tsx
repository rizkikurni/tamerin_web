import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

import ThemeProvider from '@/providers/theme-provider';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),

    progress: {
        color: '#4B5563',
    },

    setup({ el, App, props }) {
        if (!el) {
            throw new Error('Inertia root element not found.');
        }

        const root = createRoot(el);

        root.render(
            <ThemeProvider preferences={props.initialPage.props.theme ?? undefined}>
                <App {...props} />
            </ThemeProvider>,
        );
    },
});
