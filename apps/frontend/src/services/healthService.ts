export interface HealthResponse {
  status: string;
  timestamp: string;
  environment: string;
}

export const fetchHealthCheck = async (): Promise<HealthResponse> => {
  const response = await fetch('http://localhost:5148/api/health');
  
  if (!response.ok) {
    throw new Error('Network response from health check was not ok');
  }
  
  return response.json();
};
