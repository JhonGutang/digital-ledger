import { useQuery } from '@tanstack/react-query';
import { fetchHealthCheck } from '../services/healthService';
import type { HealthResponse } from '../services/healthService';

export const useHealthCheck = () => {
  return useQuery<HealthResponse, Error>({
    queryKey: ['healthCheck'],
    queryFn: fetchHealthCheck,
    retry: 1,
    refetchInterval: 10000 // Poll every 10 seconds for real-time status update
  });
};
