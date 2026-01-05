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
import { useCreateQuotaProfile, useUpdateQuotaProfile } from '~/data-provider/admin';

type QuotaProfileForm = {
    name: string;
    description: string;
    period: string;
    creditLimit: number;
};

type QuotaProfileModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    profile?: any; // If provided, we are in edit mode
};

const QuotaProfileModal: React.FC<QuotaProfileModalProps> = ({ open, onOpenChange, profile }) => {
    const localize = useLocalize();
    const createMutation = useCreateQuotaProfile();
    const updateMutation = useUpdateQuotaProfile();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<QuotaProfileForm>({
        defaultValues: {
            name: '',
            description: '',
            period: 'day',
            creditLimit: 1000,
        },
    });

    const periodValue = watch('period');

    useEffect(() => {
        if (profile) {
            reset({
                name: profile.name,
                description: profile.description || '',
                period: profile.period,
                creditLimit: profile.creditLimit,
            });
        } else {
            reset({
                name: '',
                description: '',
                period: 'day',
                creditLimit: 1000,
            });
        }
    }, [profile, reset, open]);

    const onSubmit = (data: QuotaProfileForm) => {
        if (profile) {
            updateMutation.mutate(
                { id: profile._id, payload: data },
                {
                    onSuccess: () => {
                        onOpenChange(false);
                    },
                }
            );
        } else {
            createMutation.mutate(data, {
                onSuccess: () => {
                    onOpenChange(false);
                },
            });
        }
    };

    return (
        <OGDialog open={open} onOpenChange={onOpenChange}>
            <OGDialogContent className="sm:max-w-[425px] border-border-light bg-surface-primary text-text-primary">
                <OGDialogHeader>
                    <OGDialogTitle>
                        {profile ? localize('com_ui_quota_edit') : localize('com_ui_quota_create')}
                    </OGDialogTitle>
                </OGDialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">{localize('com_ui_quota_name')}</Label>
                        <Input
                            id="name"
                            {...register('name', { required: true })}
                            placeholder="e.g. Free Tier, Pro Period"
                            className={errors.name ? 'border-red-500' : ''}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">{localize('com_ui_quota_description')}</Label>
                        <Input
                            id="description"
                            {...register('description')}
                            placeholder="Optional description"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="period">{localize('com_ui_quota_period')}</Label>
                            <Select
                                value={periodValue}
                                onValueChange={(val) => setValue('period', val)}
                            >
                                <SelectTrigger id="period">
                                    <SelectValue placeholder="Select period" />
                                </SelectTrigger>
                                <SelectContent className="z-[1000] bg-surface-secondary border-border-light">
                                    <SelectItem value="day">{localize('com_ui_quota_period_day')}</SelectItem>
                                    <SelectItem value="week">{localize('com_ui_quota_period_week')}</SelectItem>
                                    <SelectItem value="month">{localize('com_ui_quota_period_month')}</SelectItem>
                                    <SelectItem value="year">{localize('com_ui_quota_period_year')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="creditLimit">{localize('com_ui_quota_limit')}</Label>
                            <InputNumber
                                id="creditLimit"
                                value={watch('creditLimit')}
                                onChange={(val) => setValue('creditLimit', Number(val))}
                                min={0}
                            />
                        </div>
                    </div>
                </form>
                <OGDialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        {localize('com_ui_cancel')}
                    </Button>
                    <Button
                        type="submit"
                        onClick={handleSubmit(onSubmit)}
                        disabled={createMutation.isLoading || updateMutation.isLoading}
                        className="bg-primary text-white hover:bg-primary/90"
                    >
                        {localize('com_ui_save')}
                    </Button>
                </OGDialogFooter>
            </OGDialogContent>
        </OGDialog>
    );
};

export default QuotaProfileModal;
