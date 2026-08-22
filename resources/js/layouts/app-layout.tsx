import type { ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50">
            <aside>
                Sidebar
            </aside>

            <div>
                <header>
                    Header
                </header>

                <main>
                    {children}
                </main>
            </div>
        </div>
    );
}
