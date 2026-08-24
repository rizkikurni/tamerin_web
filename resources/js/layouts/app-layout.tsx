import type { ReactNode } from 'react';

import AppHeader from '@/components/layout/app-header';
import MobileNavigation from '@/components/layout/mobile-navigation';
import Sidebar from '@/components/layout/sidebar';

interface AppLayoutProps {
    children: ReactNode;
    title: string;
    description?: string;
    breadcrumbs?: { label: string; href?: string }[];
    headerActions?: ReactNode;
    currentPath?: string;
}

export default function AppLayout({
    children,
    title,
    description,
    breadcrumbs,
    headerActions,
    currentPath = '/dashboard',
}: AppLayoutProps) {
    return (
        <div className="min-h-screen bg-background">
            <div className="flex min-h-screen">
                {/* Sidebar — desktop only */}
                <Sidebar currentPath={currentPath} />

                {/* Main Area */}
                <div className="flex flex-1 flex-col min-w-0">
                    {/* Header */}
                    <AppHeader
                        title={title}
                        description={description}
                        breadcrumbs={breadcrumbs}
                        currentPath={currentPath}
                    >
                        {headerActions}
                    </AppHeader>

                    {/* Page Content */}
                    <main className="flex-1 bg-background p-4 pb-20 lg:p-6 lg:pb-6">
                        {children}
                    </main>
                </div>

                {/* Mobile Navigation — mobile only */}
                <MobileNavigation currentPath={currentPath} />
            </div>
        </div>
    );
}
