import React from 'react';
import { useGetAdminUsage } from '~/data-provider/admin';

const TopSpenders = () => {
    const { data, isLoading, error } = useGetAdminUsage();

    if (isLoading) {
        return <div className="p-4 text-text-secondary animate-pulse">Loading top spenders...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">Error loading usage stats</div>;
    }

    const topUsers = data?.topUsers ?? [];

    return (
        <div className="space-y-2">
            {topUsers.length === 0 && <div className="text-sm text-text-secondary italic text-center py-2">No usage data yet.</div>}
            {topUsers.map((user: any) => (
                <div key={user._id} className="flex items-center justify-between rounded-lg bg-surface-tertiary p-3">
                    <div className="flex flex-col overflow-hidden">
                        <span className="truncate text-sm font-semibold">{user.name || 'Anonymous'}</span>
                        <span className="truncate text-[10px] text-text-secondary">{user.email}</span>
                    </div>
                    <span className="text-xs font-bold text-text-primary whitespace-nowrap bg-surface-primary px-2 py-1 rounded border border-border-light shadow-sm">
                        {user.total.toLocaleString()}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default TopSpenders;
