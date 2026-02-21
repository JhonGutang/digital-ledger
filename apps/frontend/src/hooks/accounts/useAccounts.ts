import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountService } from '../../services/accounts/accountService';
import type { CreateAccountDto, UpdateAccountDto } from '../../types/account';
import { toast } from 'sonner';

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: accountService.getAll,
  });
}

export function useAccount(id: string) {
  return useQuery({
    queryKey: ['accounts', id],
    queryFn: () => accountService.getById(id),
    enabled: !!id,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAccountDto) => accountService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success("Account created successfully.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to create account. Please check your inputs.");
    }
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAccountDto }) => 
      accountService.update(id, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success("Account updated successfully.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to update account.");
    }
  });
}
