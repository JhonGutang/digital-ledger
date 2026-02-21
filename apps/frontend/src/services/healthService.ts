import api from './api';

export interface HealthResponse {
  status: string;
  timestamp: string;
  environment: string;
}

export const fetchHealthCheck = async (): Promise<HealthResponse> => {
  const response = await api.get<HealthResponse>('/health');
  return response.data;
};
