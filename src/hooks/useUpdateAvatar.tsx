import { useState } from 'react';
import { toast } from 'sonner';

interface UpdateAvatarResponse {
  code: number;
  message: string;
  data: {
    file_key: string;
    url: string;
    size: number;
    sha256_hash: string;
  };
  timestamp: string;
}

export const useUpdateAvatar = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateAvatar = async (file: File): Promise<UpdateAvatarResponse | null> => {
    if (!file) {
      setError('No file provided');
      return null;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return null;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('The image size cannot exceed 2MB');
      return null;
    }

    try {
      setIsUpdating(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('action', 'avatar');

      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.code !== 200) {
        throw new Error(data.message || 'Upload failed');
      }

      // Update user profile with new avatar URL
      const updateProfileResponse = await fetch('/api/user/profile-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          avatar: data.data.url
        }),
      });

      if (!updateProfileResponse.ok) {
        throw new Error('Failed to update profile with new avatar');
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update avatar';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateAvatar,
    isUpdating,
    error,
  };
}; 