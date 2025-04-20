import { useState } from 'react';

interface PasswordUpdateData {
  old_password: string;
  new_password: string;
}

interface PasswordUpdateResponse {
  code: number;
  message: string;
  timestamp: string;
}

interface UsePasswordUpdateReturn {
  updatePassword: (data: PasswordUpdateData) => Promise<PasswordUpdateResponse>;
  isUpdating: boolean;
  error: string | null;
  success: boolean;
  reset: () => void;
}

export function usePasswordUpdate(): UsePasswordUpdateReturn {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const reset = () => {
    setError(null);
    setSuccess(false);
  };

  const updatePassword = async (data: PasswordUpdateData): Promise<PasswordUpdateResponse> => {
    try {
      setIsUpdating(true);
      setError(null);
      setSuccess(false);

      const response = await fetch('/api/user/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result: PasswordUpdateResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Request failed with status ${response.status}`);
      }

      if (result.code === 200) {
        setSuccess(true);
      } else {
        throw new Error(result.message || 'Password update failed');
      }

      return result;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Password update failed');
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updatePassword,
    isUpdating,
    error,
    success,
    reset
  };
} 