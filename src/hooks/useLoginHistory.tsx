import { useQuery, UseQueryResult } from '@tanstack/react-query';

export interface TrustDevice {
  browser: string;
  os: string;
  ip: string | null;
  fingerprint: string;
  location: string;
}

export interface LoginHistoryEntry {
  login_time: string;
  success: boolean;
  failure_reason: string | null;
  trust_device: TrustDevice;
}

export interface LoginHistoryResponse {
  code: number;
  message: string;
  data: LoginHistoryEntry[];
  timestamp: string;
}

interface LoginHistoryParams {
  start_time?: string;
  end_time?: string;
  success?: boolean;
}

// Function to fetch login history
const fetchLoginHistory = async (params?: LoginHistoryParams): Promise<LoginHistoryEntry[]> => {
  const response = await fetch('/api/user/login-history', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params || {}),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  const result: LoginHistoryResponse = await response.json();
  
  if (result.code !== 200) {
    throw new Error(result.message || 'Failed to fetch login history');
  }

  return result.data || [];
};

// Hook to use the login history query
export const useLoginHistory = (params?: LoginHistoryParams): UseQueryResult<LoginHistoryEntry[], Error> => {
  return useQuery<LoginHistoryEntry[], Error, LoginHistoryEntry[]>({
    queryKey: ['loginHistory', params],
    queryFn: () => fetchLoginHistory(params),
    retry: 1,
    onError: (error) => {
      console.error('Error fetching login history:', error);
    },
  });
}; 