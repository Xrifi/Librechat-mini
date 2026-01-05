import React, { useState } from 'react';
import { Plus, Trash2, User, Users, Shield } from 'lucide-react';
import { useGetQuotaAssignments, useDeleteQuotaAssignment, useGetQuotaProfiles } from '~/data-provider/admin';
import QuotaAssignmentModal from './QuotaAssignmentModal';
import { Button } from '@librechat/client';
import { useLocalize } from '~/hooks';

const QuotaAssignments = () => {
    const localize = useLocalize();
    const { data: assignments, isLoading: loadingAssignments, error: errorAssignments } = useGetQuotaAssignments();
    const { data: profiles, isLoading: loadingProfiles } = useGetQuotaProfiles();
    const deleteMutation = useDeleteQuotaAssignment();

    const [modalOpen, setModalOpen] = useState(false);

    if (loadingAssignments || loadingProfiles) {
        return <div className="p-4 text-text-secondary animate-pulse text-center text-xs">Chargement des attributions...</div>;
    }

    const getProfileName = (profileId: string) => {
        return profiles?.find((p: any) => p._id === profileId)?.name || 'Profil inconnu';
    };

    const handleDelete = (id: string) => {
        if (window.confirm(localize('com_ui_delete') + '?')) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className="space-y-3">
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {assignments?.length === 0 && (
                    <div className="text-sm text-text-secondary italic text-center py-6 border border-dashed border-border-light rounded-lg">
                        Aucune attribution n'est encore définie.
                    </div>
                )}
                {assignments?.map((assignment: any) => (
                    <div
                        key={assignment._id}
                        className="group flex items-center justify-between rounded-lg border border-border-light bg-surface-tertiary p-3 hover:border-primary/40 transition-all shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-surface-primary rounded-full border border-border-light text-text-secondary group-hover:text-primary transition-colors">
                                {assignment.user ? <User className="size-4" /> : assignment.role ? <Shield className="size-4" /> : <Users className="size-4" />}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-text-primary flex items-center gap-2">
                                    {assignment.user || assignment.role || assignment.group || 'Global Default'}
                                    <span className="text-[10px] text-text-secondary font-normal italic">
                                        (Prio: {assignment.priority})
                                    </span>
                                </div>
                                <div className="text-[11px] font-medium text-primary/80">
                                    {getProfileName(assignment.profileId)}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => handleDelete(assignment._id)}
                            className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 rounded transition-all"
                            title={localize('com_ui_delete')}
                        >
                            <Trash2 className="size-4 text-text-secondary hover:text-red-500" />
                        </button>
                    </div>
                ))}
            </div>

            <Button
                onClick={() => setModalOpen(true)}
                variant="outline"
                className="w-full h-9 gap-2 text-primary border-primary/30 hover:bg-primary/5 hover:border-primary/60 transition-all font-semibold text-xs rounded-xl"
            >
                <Plus className="size-4" />
                {localize('com_ui_add')} une attribution
            </Button>

            <QuotaAssignmentModal
                open={modalOpen}
                onOpenChange={setModalOpen}
            />
        </div>
    );
};

export default QuotaAssignments;
