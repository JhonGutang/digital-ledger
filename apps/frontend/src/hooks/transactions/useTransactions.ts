import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '../../services/transactions/transactionService';
import type { CreateTransactionDto, UpdateTransactionDto } from '../../types/transaction';
import { toast } from 'sonner';

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: transactionService.getAll,
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ['transactions', id],
    queryFn: () => transactionService.getById(id),
    enabled: !!id,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTransactionDto) => transactionService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success("Transaction created successfully.");
    },
    onError: (error: any) => {
      // 422 BusinessRuleException typically yields detail string or validation format depending on middleware mapping
      const errorMessage = error?.response?.data?.detail 
        || error?.response?.data?.title 
        || "Failed to create transaction. Please check your inputs.";
      toast.error(errorMessage);
    }
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionDto }) => 
      transactionService.update(id, data),
    onSuccess: async (updatedTransaction, variables) => {
      queryClient.setQueryData(['transactions', variables.id], updatedTransaction);
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success("Transaction updated successfully.");
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.detail 
        || error?.response?.data?.title 
        || "Failed to update transaction.";
      toast.error(errorMessage);
    }
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => transactionService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success("Transaction deleted successfully.");
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.detail 
        || error?.response?.data?.title 
        || "Failed to delete transaction.";
      toast.error(errorMessage);
    }
  });
}
