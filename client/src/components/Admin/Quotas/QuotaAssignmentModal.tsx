import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
    OGDialog,
    OGDialogContent,
    OGDialogHeader,
    OGDialogTitle,
    OGDialogFooter,
    Button,
    Label,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    InputNumber,
} from '@librechat/client';
import { useLocalize } from '~/hooks';
import { useCreateQuotaAssignment, useGetQuotaProfiles } from '~/data-provider/admin';

type QuotaAssignmentForm = {
    profileId: string;
    type: 'user' | 'role' | 'group' | 'default';
    value: string;
    priority: number;
};

type QuotaAssignmentModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const QuotaAssignmentModal: React.FC<QuotaAssignmentModalProps> = ({ open, onOpenChange }) => {
    const localize = useLocalize();
    const createMutation = useCreateQuotaAssignment();
    const { data: profiles } = useGetQuotaProfiles();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<QuotaAssignmentForm>({
        defaultValues: {
            profileId: '',
            type: 'user',
            value: '',
            priority: 0,
        },
    });

    const typeValue = watch('type');
    const profileIdValue = watch('profileId');

    useEffect(() => {
        if (open) {
            reset({
                profileId: profiles?.[0]?._id || '',
                type: 'user',
                value: '',
                priority: 0,
            });
        }
    }, [open, reset, profiles]);

    const onSubmit = (data: QuotaAssignmentForm) => {
        const payload: any = {
            profileId: data.profileId,
            priority: data.priority,
        };

        if (data.type === 'user') payload.user = data.value;
        else if (data.type === 'role') payload.role = data.value;
        else if (data.type === 'group') payload.group = data.value;
        // 'default' doesn't add extra fields, but usually has low priority

        createMutation.mutate(payload, {
            onSuccess: () => {
                onOpenChange(false);
            },
        });
    };

    return (
        <OGDialog open={open} onOpenChange={onOpenChange}>
            <OGDialogContent className="sm:max-w-[425px] border-border-light bg-surface-primary text-text-primary">
                <OGDialogHeader>
                    <OGDialogTitle>Ajouter une Attribution</OGDialogTitle>
                </OGDialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="profileId">Profil de Quota</Label>
                        <Select
                            value={profileIdValue}
                            onValueChange={(val) => setValue('profileId', val)}
                        >
                            <SelectTrigger id="profileId">
                                <SelectValue placeholder="Sélectionner un profil" />
                            </SelectTrigger>
                            <SelectContent>
                                {profiles?.map((p: any) => (
                                    <SelectItem key={p._id} value={p._id}>
                                        {p.name} ({p.creditLimit} cr / {p.period})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="type">Cible</Label>
                            <Select
                                value={typeValue}
                                onValueChange={(val: any) => setValue('type', val)}
                            >
                                <SelectTrigger id="type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">Utilisateur (ID)</SelectItem>
                                    <SelectItem value="role">Rôle</SelectItem>
                                    <SelectItem value="group">Groupe (ID)</SelectItem>
                                    <SelectItem value="default">Par défaut (Global)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="priority">Priorité</Label>
                            <InputNumber
                                id="priority"
                                value={watch('priority')}
                                onChange={(val) => setValue('priority', Number(val))}
                                min={0}
                            />
                        </div>
                    </div>

                    {typeValue !== 'default' && (
                        <div className="grid gap-2">
                            <Label htmlFor="value">
                                {typeValue === 'user' ? 'ID Utilisateur' : typeValue === 'role' ? 'Nom du Rôle' : 'ID Groupe'}
                            </Label>
                            <Input
                                id="value"
                                {...register('value', { required: typeValue !== 'default' })}
                                placeholder={typeValue === 'role' ? 'e.g. user, admin, pro' : 'ID hexadécimal'}
                                className={errors.value ? 'border-red-500' : ''}
                            />
                        </div>
                    )}
                </form>
                <OGDialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        {localize('com_ui_cancel')}
                    </Button>
                    <Button
                        type="submit"
                        onClick={handleSubmit(onSubmit)}
                        disabled={createMutation.isLoading || !profileIdValue}
                        className="bg-primary text-white hover:bg-primary/90"
                    >
                        Attribuer
                    </Button>
                </OGDialogFooter>
            </OGDialogContent>
        </OGDialog>
    );
};

export default QuotaAssignmentModal;
