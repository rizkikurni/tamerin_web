interface SummaryCardProps {
    title: string;
    value: string;
    description?: string;
}

export default function SummaryCard({
    title,
    value,
    description,
}: SummaryCardProps) {
    return (
        <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-gray-500">
                {title}
            </p>

            <p className="mt-2 text-2xl font-semibold">
                {value}
            </p>

            {description && (
                <p className="mt-1 text-sm text-gray-500">
                    {description}
                </p>
            )}
        </div>
    );
}
