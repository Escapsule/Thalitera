import { useQuery } from '@tanstack/react-query';

export interface TrustedDevice {
  browser: string;
  os: string;
  ip: string;
  fingerprint: string;
  location: string;
}

export function useTrustedDevices() {
  return useQuery<TrustedDevice[]>({
    queryKey: ['trusted-devices'],
    queryFn: async () => {
      const response = await fetch('/api/user/trust-device', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch trusted devices');
      }
      
      const result = await response.json();
      return result.data || [];
    },
  });
} 