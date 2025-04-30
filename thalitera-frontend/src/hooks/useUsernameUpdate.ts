import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface UpdateUsernameParams {
  username: string;
}

export function useUsernameUpdate() {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { mutate: updateUsername, isPending: isUpdating } = useMutation({
    mutationFn: async ({ username }: UpdateUsernameParams) => {
      const response = await fetch(`/api/user/update-info?username=${encodeURIComponent(username)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update username');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate user info query to refetch the updated data
      queryClient.invalidateQueries({ queryKey: ['userInfo'] });
      
      // Force a refetch of userInfo data
      queryClient.refetchQueries({ queryKey: ['userInfo'] });
      
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const reset = () => {
    setError(null);
  };

  return {
    updateUsername,
    isUpdating,
    error,
    reset,
  };
} 