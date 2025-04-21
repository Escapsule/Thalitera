import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export interface TrustedDevice {
  browser: string;
  os: string;
  ip: string;
  fingerprint: string;
  location: string;
  isCurrentDevice?: boolean;
}

export function useTrustedDevices() {
  const queryClient = useQueryClient();
  const [currentFingerprint, setCurrentFingerprint] = useState<string | null>(null);

  // Get current device fingerprint
  useEffect(() => {
    const getFingerprint = async () => {
      try {
        const fpPromise = FingerprintJS.load();
        const fp = await fpPromise;
        const result = await fp.get();
        setCurrentFingerprint(result.visitorId);
      } catch (error) {
        console.error('Error getting fingerprint:', error);
      }
    };

    getFingerprint();
  }, []);

  // Query for trusted devices
  const query = useQuery<TrustedDevice[]>({
    queryKey: ['trusted-devices', currentFingerprint],
    queryFn: async () => {
      const response = await fetch('/api/user/trust-device', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch trusted devices');
      }
      
      const result = await response.json();
      const devices = result.data || [];
      
      // Mark current device
      return devices.map((device: TrustedDevice) => ({
        ...device,
        isCurrentDevice: currentFingerprint ? device.fingerprint === currentFingerprint : false
      }));
    },
    enabled: !!currentFingerprint,
  });

  // Mutation to revoke a trusted device
  const revokeMutation = useMutation({
    mutationFn: async (fingerprint: string) => {
      const response = await fetch('/api/user/trust-device/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fingerprint }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to revoke trusted device');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch the trusted devices query
      queryClient.invalidateQueries({ queryKey: ['trusted-devices'] });
    },
  });

  // New mutation to delete a trusted device
  const deleteMutation = useMutation({
    mutationFn: async (fingerprint: string) => {
      const response = await fetch(`/api/user/trust-device-delete?fingerprint=${fingerprint}`, {
        method: 'GET',
        headers: {
          'THALITERA_FINGERPRINT': fingerprint
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete trusted device');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch the trusted devices query
      queryClient.invalidateQueries({ queryKey: ['trusted-devices'] });
    },
  });

  return {
    ...query,
    revokeDevice: revokeMutation.mutate,
    isRevoking: revokeMutation.isPending,
    revokeError: revokeMutation.error,
    deleteDevice: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    deleteError: deleteMutation.error,
    currentFingerprint,
  };
} 