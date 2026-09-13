import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

import ThemeProvider from '@/providers/theme-provider';

createInertiaApp({
    title: (title, page) => {
        const appName =
            typeof page.props.name === 'string' ? page.props.name : 'Tamerin';

        return title ? `${title} - ${appName}` : appName;
    },

    progress: {
        color: '#4B5563',
    },

    setup({ el, App, props }) {
        if (!el) {
            throw new Error('Inertia root element not found.');
        }

        const root = createRoot(el);

        root.render(
            <ThemeProvider
                preferences={props.initialPage.props.theme ?? undefined}
            >
                <App {...props} />
            </ThemeProvider>,
        );
    },
});
