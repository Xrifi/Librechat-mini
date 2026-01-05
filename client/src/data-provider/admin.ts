import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult, UseQueryOptions } from '@tanstack/react-query';
import { QueryKeys, dataService } from 'librechat-data-provider';

export const useGetAdminOverview = (): UseQueryResult<any, Error> => {
    return useQuery([QueryKeys.adminOverview], () => dataService.getAdminOverview(), {
        refetchOnWindowFocus: false,
        retry: false,
    });
};

export const useGetAdminUsage = (): UseQueryResult<any, Error> => {
    return useQuery([QueryKeys.adminUsage], () => dataService.getAdminUsage(), {
        refetchOnWindowFocus: false,
        retry: false,
    });
};

export const useGetQuotaProfiles = (): UseQueryResult<any[], Error> => {
    return useQuery([QueryKeys.quotaProfiles], () => dataService.getQuotaProfiles(), {
        refetchOnWindowFocus: false,
        retry: false,
    });
};

export const useCreateQuotaProfile = (): UseMutationResult<any, Error, any> => {
    const queryClient = useQueryClient();
    return useMutation((payload: any) => dataService.createQuotaProfile(payload), {
        onSuccess: () => {
            queryClient.invalidateQueries([QueryKeys.quotaProfiles]);
        },
    });
};

export const useUpdateQuotaProfile = (): UseMutationResult<any, Error, { id: string; payload: any }> => {
    const queryClient = useQueryClient();
    return useMutation((vars: { id: string; payload: any }) => dataService.updateQuotaProfile(vars), {
        onSuccess: () => {
            queryClient.invalidateQueries([QueryKeys.quotaProfiles]);
        },
    });
};

export const useDeleteQuotaProfile = (): UseMutationResult<any, Error, string> => {
    const queryClient = useQueryClient();
    return useMutation((id: string) => dataService.deleteQuotaProfile(id), {
        onSuccess: () => {
            queryClient.invalidateQueries([QueryKeys.quotaProfiles]);
        },
    });
};

export const useGetQuotaAssignments = (): UseQueryResult<any[], Error> => {
    return useQuery([QueryKeys.quotaAssignments], () => dataService.getQuotaAssignments(), {
        refetchOnWindowFocus: false,
        retry: false,
    });
};

export const useCreateQuotaAssignment = (): UseMutationResult<any, Error, any> => {
    const queryClient = useQueryClient();
    return useMutation((payload: any) => dataService.createQuotaAssignment(payload), {
        onSuccess: () => {
            queryClient.invalidateQueries([QueryKeys.quotaAssignments]);
        },
    });
};

export const useDeleteQuotaAssignment = (): UseMutationResult<any, Error, string> => {
    const queryClient = useQueryClient();
    return useMutation((id: string) => dataService.deleteQuotaAssignment(id), {
        onSuccess: () => {
            queryClient.invalidateQueries([QueryKeys.quotaAssignments]);
        },
    });
};

export const useGetAdminUsers = (
    params: { page: number; search?: string },
    options?: UseQueryOptions<any, Error>
): UseQueryResult<any, Error> => {
    return useQuery(
        [QueryKeys.adminUsers, params],
        () => dataService.getAdminUsers(params),
        {
            refetchOnWindowFocus: false,
            retry: false,
            ...options,
        }
    );
};

export const useAdjustUserCredits = (): UseMutationResult<any, Error, { userId: string; amount: number; reason?: string }> => {
    const queryClient = useQueryClient();
    return useMutation((payload: { userId: string; amount: number; reason?: string }) => dataService.adjustUserCredits(payload), {
        onSuccess: () => {
            queryClient.invalidateQueries([QueryKeys.adminUsers]);
            queryClient.invalidateQueries([QueryKeys.adminOverview]);
        },
    });
};

export const useGetAdminAuditLogs = (
    params: { page: number },
    options?: UseQueryOptions<any, Error>
): UseQueryResult<any, Error> => {
    return useQuery(
        [QueryKeys.adminAudit, params],
        () => dataService.getAdminAuditLogs(params),
        {
            refetchOnWindowFocus: false,
            retry: false,
            ...options,
        }
    );
};

export const useUpdateUserRole = (): UseMutationResult<any, Error, { userId: string; role: string }> => {
    const queryClient = useQueryClient();
    return useMutation((payload: { userId: string; role: string }) => dataService.updateUserRole(payload), {
        onSuccess: () => {
            queryClient.invalidateQueries([QueryKeys.adminUsers]);
        },
    });
};
