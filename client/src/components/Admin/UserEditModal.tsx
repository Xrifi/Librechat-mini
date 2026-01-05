import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    OGDialog,
    OGDialogContent,
    OGDialogHeader,
    OGDialogTitle,
    OGDialogFooter,
    Button,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@librechat/client';
import { SystemRoles } from 'librechat-data-provider';
import { useLocalize } from '~/hooks';
import {
    useUpdateUserRole,
    useGetQuotaProfiles,
    useCreateQuotaAssignment,
    useDeleteQuotaAssignment,
} from '~/data-provider/admin';

type UserEditForm = {
    role: string;
    quotaProfileId: string;
};

type UserEditModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user?: any;
};

const UserEditModal: React.FC<UserEditModalProps> = ({ open, onOpenChange, user }) => {
    const localize = useLocalize();
    const updateRoleMutation = useUpdateUserRole();
    const createAssignmentMutation = useCreateQuotaAssignment();
    const deleteAssignmentMutation = useDeleteQuotaAssignment();
    const { data: profiles } = useGetQuotaProfiles();

    const {
        control,
        handleSubmit,
        reset,
        watch,
    } = useForm<UserEditForm>({
        defaultValues: {
            role: SystemRoles.USER,
            quotaProfileId: 'default',
        },
    });

    useEffect(() => {
        if (user) {
            reset({
                role: user.role,
                quotaProfileId: user.quotaAssignmentId || 'default',
            });
        }
    }, [user, reset, open]);

    const onSubmit = async (data: UserEditForm) => {
        if (!user) return;

        try {
            // Update Role if changed
            if (data.role !== user.role) {
                await updateRoleMutation.mutateAsync({ userId: user._id, role: data.role });
            }

            // Handle Quota Assignment
            const currentAssignmentId = user.quotaAssignmentId;
            const newProfileId = data.quotaProfileId === 'default' ? null : data.quotaProfileId;

            if (currentAssignmentId && !newProfileId) {
                // Was assigned, now default -> Delete
                await deleteAssignmentMutation.mutateAsync(currentAssignmentId);
            } else if (!currentAssignmentId && newProfileId) {
                // Was default, now assigned -> Create
                await createAssignmentMutation.mutateAsync({
                    user: user._id,
                    profileId: newProfileId,
                    priority: 100, // User Override Priority
                });
            } else if (currentAssignmentId && newProfileId && currentAssignmentId !== newProfileId) {
                // Was assigned, changed profile -> Delete then Create (simplest, or use Update if API supported)
                // Since our API for assignments is basic, let's delete old and create new to be safe
                // Actually, if we just create new with same user, logic might be duplicate.
                // Best is delete old, create new.
                await deleteAssignmentMutation.mutateAsync(currentAssignmentId);
                await createAssignmentMutation.mutateAsync({
                    user: user._id,
                    profileId: newProfileId,
                    priority: 100,
                });
            }

            onOpenChange(false);
        } catch (error) {
            console.error('Failed to update user', error);
            alert('Error updating user');
        }
    };

    return (
        <OGDialog open={open} onOpenChange={onOpenChange}>
            <OGDialogContent className="sm:max-w-[425px] border-border-light bg-surface-primary text-text-primary">
                <OGDialogHeader>
                    <OGDialogTitle>
                        Modifier l'utilisateur : {user?.name || user?.email}
                    </OGDialogTitle>
                </OGDialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="role">Rôle</Label>
                        <Controller
                            control={control}
                            name="role"
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger id="role">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent className="z-[1000] bg-surface-secondary border-border-light">
                                        <SelectItem value={SystemRoles.USER}>User</SelectItem>
                                        <SelectItem value={SystemRoles.ADMIN}>Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="quotaProfileId">Profil de Quota</Label>
                        <Controller
                            control={control}
                            name="quotaProfileId"
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger id="quotaProfileId">
                                        <SelectValue placeholder="Select profile" />
                                    </SelectTrigger>
                                    <SelectContent className="z-[1000] bg-surface-secondary border-border-light">
                                        <SelectItem value="default">
                                            <span className="italic text-text-secondary">Défaut / Hérité</span>
                                        </SelectItem>
                                        {profiles?.map((profile: any) => (
                                            <SelectItem key={profile._id} value={profile._id}>
                                                {profile.name} ({profile.period})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        <p className="text-[11px] text-text-secondary">
                            Sélectionner un profil ici créera une attribution prioritaire spécifique à cet utilisateur.
                        </p>
                    </div>
                </form>
                <OGDialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        {localize('com_ui_cancel')}
                    </Button>
                    <Button
                        type="submit"
                        onClick={handleSubmit(onSubmit)}
                        className="bg-primary text-white hover:bg-primary/90"
                    >
                        {localize('com_ui_save')}
                    </Button>
                </OGDialogFooter>
            </OGDialogContent>
        </OGDialog>
    );
};

export default UserEditModal;
