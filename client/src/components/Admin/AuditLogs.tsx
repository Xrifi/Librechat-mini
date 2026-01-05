import React, { useState } from 'react';
import { History, Shield, Info, AlertTriangle } from 'lucide-react';
import { useGetAdminAuditLogs } from '~/data-provider/admin';
import { Button } from '@librechat/client';
import { useLocalize } from '~/hooks';

const AuditLogs = () => {
    const localize = useLocalize();
    const [page, setPage] = useState(1);
    const { data, isLoading } = useGetAdminAuditLogs({ page });

    if (isLoading && page === 1) {
        return <div className="p-4 text-center animate-pulse">Chargement de l'historique...</div>;
    }

    const getActionIcon = (action: string) => {
        if (action.includes('ADJUSTMENT')) return <Shield className="size-3.5 text-blue-500" />;
        if (action.includes('CREATE')) return <Info className="size-3.5 text-green-500" />;
        if (action.includes('DELETE')) return <AlertTriangle className="size-3.5 text-red-500" />;
        return <History className="size-3.5 text-text-secondary" />;
    };

    return (
        <div className="space-y-4">
            <div className="max-h-[400px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {data?.logs?.length === 0 && (
                    <div className="text-sm text-text-secondary italic text-center py-10 border border-dashed border-border-light rounded-lg">
                        Aucun journal d'audit disponible.
                    </div>
                )}
                {data?.logs?.map((log: any) => (
                    <div
                        key={log._id}
                        className="flex flex-col rounded-lg border border-border-light bg-surface-tertiary p-3 hover:border-primary/30 transition-all shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                {getActionIcon(log.action)}
                                <span className="text-xs font-bold text-text-primary uppercase tracking-tight">
                                    {log.action.replace(/_/g, ' ')}
                                </span>
                            </div>
                            <span className="text-[10px] text-text-secondary font-mono">
                                {new Date(log.createdAt).toLocaleString()}
                            </span>
                        </div>
                        <div className="text-[11px] text-text-secondary">
                            <span className="font-bold text-text-primary">{log.admin?.name || 'Admin'}</span> a modifié{' '}
                            <span className="font-medium text-text-primary">{log.targetModel}</span> ({log.targetId})
                        </div>
                        {log.metadata && (
                            <div className="mt-2 p-1.5 rounded bg-surface-primary border border-border-light text-[10px] text-text-secondary overflow-x-auto whitespace-pre font-mono">
                                {JSON.stringify(log.metadata, null, 2)}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {data?.totalPages > 1 && (
                <div className="flex items-center justify-between px-2">
                    <span className="text-xs text-text-secondary">
                        Page {data.currentPage} sur {data.totalPages}
                    </span>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs font-semibold"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            Précédent
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs font-semibold"
                            onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                            disabled={page === data.totalPages}
                        >
                            Suivant
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLogs;
