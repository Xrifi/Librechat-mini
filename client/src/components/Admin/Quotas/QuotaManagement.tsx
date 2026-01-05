import React, { useState } from 'react';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { useGetQuotaProfiles, useDeleteQuotaProfile } from '~/data-provider/admin';
import QuotaProfileModal from './QuotaProfileModal';
import { Button } from '@librechat/client';
import { useLocalize } from '~/hooks';

const QuotaManagement = () => {
    const localize = useLocalize();
    const { data: profiles, isLoading, error } = useGetQuotaProfiles();
    const deleteMutation = useDeleteQuotaProfile();

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState<any>(null);

    if (isLoading) {
        return <div className="p-4 text-text-secondary animate-pulse text-center">Chargement des profils...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500 text-center text-xs">Erreur lors du chargement des profils</div>;
    }

    const handleEdit = (profile: any) => {
        setSelectedProfile(profile);
        setModalOpen(true);
    };

    const handleCreate = () => {
        setSelectedProfile(null);
        setModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm(localize('com_ui_delete') + '?')) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className="space-y-3">
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {profiles?.length === 0 && (
                    <div className="text-sm text-text-secondary italic text-center py-6 border border-dashed border-border-light rounded-lg">
                        Aucun profil de quota n'est encore défini.
                    </div>
                )}
                {profiles?.map((profile: any) => (
                    <div
                        key={profile._id}
                        className="group flex flex-col rounded-lg border border-border-light bg-surface-tertiary p-3 hover:border-primary/40 transition-all shadow-sm"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-text-primary">{profile.name}</span>
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(profile)}
                                    className="p-1 hover:bg-surface-secondary rounded transition-colors"
                                    title={localize('com_ui_edit')}
                                >
                                    <Edit2 className="size-3.5 text-text-secondary hover:text-primary" />
                                </button>
                                <button
                                    onClick={() => handleDelete(profile._id)}
                                    className="p-1 hover:bg-red-500/10 rounded transition-colors"
                                    title={localize('com_ui_delete')}
                                >
                                    <Trash2 className="size-3.5 text-text-secondary hover:text-red-500" />
                                </button>
                            </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                    {localize(`com_ui_quota_period_${profile.period}`)}
                                </span>
                                <span className="text-xs text-text-secondary font-medium">
                                    {profile.creditLimit.toLocaleString()} <span className="text-[10px] opacity-70">credits</span>
                                </span>
                            </div>
                            {profile.description && (
                                <span className="text-[10px] text-text-secondary truncate max-w-[100px] italic">
                                    {profile.description}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <Button
                onClick={handleCreate}
                variant="outline"
                className="w-full h-9 gap-2 text-primary border-primary/30 hover:bg-primary/5 hover:border-primary/60 transition-all font-semibold text-xs rounded-xl"
            >
                <Plus className="size-4" />
                {localize('com_ui_quota_create')}
            </Button>

            <QuotaProfileModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                profile={selectedProfile}
            />
        </div>
    );
};

export default QuotaManagement;
