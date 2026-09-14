import type { ReactNode } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
    title: string;
    value: string;
    comparison?: string;
    icon?: ReactNode;
    iconBg?: string;
}

export default function SummaryCard({
    title,
    value,
    comparison,
    icon,
    iconBg = 'bg-primary-soft',
}: SummaryCardProps) {
    return (
        <Card variant="navbar">
            <CardContent className="flex items-start gap-4">
                {icon && (
                    <div
                        className={cn(
                            'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl',
                            iconBg,
                        )}
                    >
                        {icon}
                    </div>
                )}

                <div className="min-w-0 flex-1">
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="mt-1 text-xl font-medium text-foreground">
                        {value}
                    </p>
                    {comparison && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {comparison}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
