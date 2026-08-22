import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

// --- Base Skeleton ---

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse rounded-xl bg-surface-muted',
                className,
            )}
            {...props}
        />
    );
}

// --- Summary Card Skeleton ---

export function SummaryCardSkeleton() {
    return (
        <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
            <div className="flex items-start gap-4">
                <Skeleton className="h-11 w-11 shrink-0 rounded-2xl" />
                <div className="flex-1 space-y-2.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-36" />
                    <Skeleton className="h-3 w-28" />
                </div>
            </div>
        </div>
    );
}

// --- Chart Skeleton ---

export function ChartSkeleton() {
    return (
        <div className="rounded-3xl border border-border bg-surface shadow-sm">
            <div className="p-5 pb-0">
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-3 w-40" />
                    </div>
                    <Skeleton className="h-8 w-36 rounded-xl" />
                </div>
                <div className="mt-3 flex gap-4">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-20" />
                </div>
            </div>
            <div className="p-5">
                <div className="flex h-64 items-end gap-3">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="flex flex-1 gap-1">
                            <Skeleton
                                className="w-full rounded-t-md"
                                style={{
                                    height: `${30 + Math.random() * 60}%`,
                                }}
                            />
                            <Skeleton
                                className="w-full rounded-t-md"
                                style={{
                                    height: `${20 + Math.random() * 50}%`,
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// --- Table Skeleton ---

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="rounded-3xl border border-border bg-surface shadow-sm">
            <div className="p-5 pb-0">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-16" />
                </div>
            </div>
            <div className="p-5">
                {/* Header */}
                <div className="mb-3 flex gap-4 border-b border-border pb-2.5">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-20 flex-1" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-14" />
                </div>
                {/* Rows */}
                <div className="space-y-3">
                    {Array.from({ length: rows }).map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <Skeleton className="h-4 w-14" />
                            <div className="flex flex-1 items-center gap-2.5">
                                <Skeleton className="h-7 w-7 rounded-lg" />
                                <Skeleton className="h-4 w-20" />
                            </div>
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-5 w-14 rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// --- List Skeleton ---

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
    return (
        <div className="rounded-3xl border border-border bg-surface shadow-sm">
            <div className="p-5 pb-0">
                <Skeleton className="h-5 w-28" />
            </div>
            <div className="space-y-3 p-5">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-9 w-9 rounded-xl" />
                            <div className="space-y-1.5">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </div>
                        <Skeleton className="h-4 w-20" />
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- Budget Skeleton ---

export function BudgetSkeleton({ rows = 4 }: { rows?: number }) {
    return (
        <div className="rounded-3xl border border-border bg-surface shadow-sm">
            <div className="p-5 pb-0">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-4 w-16" />
                </div>
            </div>
            <div className="space-y-4 p-5">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                        <Skeleton className="h-2 w-full rounded-full" />
                        <div className="flex justify-between">
                            <Skeleton className="h-3 w-32" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
