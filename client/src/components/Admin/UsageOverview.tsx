import React from 'react';
import { useGetAdminOverview } from '~/data-provider/admin';

const UsageOverview = () => {
    const { data, isLoading, error } = useGetAdminOverview();

    if (isLoading) {
        return <div className="p-4 text-text-secondary animate-pulse">Loading overview...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">Error loading overview</div>;
    }

    const stats = [
        { label: 'Total Users', value: data?.users ?? 0 },
        { label: 'Total Messages', value: data?.messages ?? 0 },
        { label: 'Total Conversations', value: data?.conversations ?? 0 },
        { label: 'Active Sessions', value: data?.sessions ?? 0 },
        {
            label: 'Credits Consumed',
            value: (
                <div>
                    <div>{(data?.totalCreditsConsumed ?? 0).toLocaleString()} tokens</div>
                    <div className="text-xs text-text-secondary">≈ ${((data?.totalCreditsConsumed ?? 0) / 1000000).toFixed(4)}</div>
                </div>
            )
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-4">
            {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col rounded-lg bg-surface-tertiary p-3">
                    <span className="text-xs font-medium text-text-secondary uppercase">{stat.label}</span>
                    <span className="mt-1 text-lg font-bold text-text-primary">{stat.value}</span>
                </div>
            ))}
        </div>
    );
};

export default UsageOverview;
