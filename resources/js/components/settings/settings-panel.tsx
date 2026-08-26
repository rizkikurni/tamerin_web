import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Card, CardContent } from '@/components/ui/card';

interface SettingsPanelProps {
    title: string;
    description: string;
    icon: LucideIcon;
    children: ReactNode;
}

export default function SettingsPanel({
    title,
    description,
    icon: Icon,
    children,
}: SettingsPanelProps) {
    return (
        <Card variant="navbar">
            <CardContent className="grid gap-6 p-5 sm:p-6">
                <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                        <Icon className="h-5 w-5" />
                    </div>

                    <div className="grid gap-1">
                        <h1 className="text-lg font-medium text-foreground">
                            {title}
                        </h1>
                        <p className="text-sm font-light text-muted-foreground">
                            {description}
                        </p>
                    </div>
                </div>

                {children}
            </CardContent>
        </Card>
    );
}
