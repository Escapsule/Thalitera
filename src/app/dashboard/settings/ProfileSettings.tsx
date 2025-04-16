import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface UserProfile {
  user_id: string;
  user_name: string;
  email: string;
  telephone: string;
  avatar: string;
}

const ProfileSettings = () => {
  const [profile, setProfile] = useState<UserProfile>({
    user_id: '',
    user_name: '',
    email: '',
    telephone: '',
    avatar: ''
  });

  // Add edit mode status
  const [isEditing, setIsEditing] = useState(false);

  // Status
  const [status, setStatus] = useState({
    loading: false,
    error: null as string | null,
    success: null as string | null,
  });

  // Get user data
  const fetchUserProfile = async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true, error: null }));
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const result = await response.json();
      if (result.code === 200 && result.data) {
        setProfile({
          user_id: result.data.user_id || '',
          user_name: result.data.user_name || '',
          email: result.data.email || '',
          telephone: result.data.telephone || '',
          avatar: result.data.avatar || ''
        });
      } else {
        throw new Error(result.message || 'Failed to obtain user information');
      }
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to obtain user information'
      }));
    } finally {
      setStatus(prev => ({ ...prev, loading: false }));
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [id]: value
    }));
    setStatus(prev => ({ ...prev, error: null }));
  };

  // Form validation function
  const validateForm = (): string | null => {
    if (!profile.user_name.trim()) {
      return 'Username cannot be empty';
    }
    
    if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      return 'Email format is incorrect';
    }
    
    if (profile.telephone && !/^[0-9]{11}$/.test(profile.telephone)) {
      return 'Telephone number format is incorrect';
    }
    
    return null;
  };

  // Handle save
  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      setStatus(prev => ({ ...prev, error: validationError }));
      return;
    }

    try {
      setStatus(prev => ({ ...prev, loading: true, error: null }));
      const response = await fetch('/api/user/profile-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_name: profile.user_name,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const result = await response.json();
      if (result.code === 200) {
        setIsEditing(false); // Exit editing mode after successful saving
        setStatus(prev => ({ ...prev, success: 'Information saved successfully!' }));
        setTimeout(() => {
          setStatus(prev => ({ ...prev, success: null }));
        }, 3000);
      } else {
        throw new Error(result.message || 'Save failed, please try again');
      }
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Save failed, please try again'
      }));
    } finally {
      setStatus(prev => ({ ...prev, loading: false }));
    }
  };

  // Cancel editing, restore original data
  const handleCancel = () => {
    setIsEditing(false);
    fetchUserProfile(); // Re-fetch data
    setStatus(prev => ({ ...prev, error: null }));
  };

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatus(prev => ({ ...prev, error: 'Please upload an image file' }));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setStatus(prev => ({ ...prev, error: 'The image size cannot exceed 2MB' }));
      return;
    }

    try {
      setStatus(prev => ({ ...prev, loading: true, error: null }));
      const base64String = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('File read failed'));
        reader.readAsDataURL(file);
      });

      const response = await fetch('/api/user/profile-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ avatar: base64String }),
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const result = await response.json();
      if (result.code === 200) {
        setProfile(prev => ({
          ...prev,
          avatar: result.data.avatar
        }));
        setStatus(prev => ({ ...prev, success: 'Avatar uploaded successfully!' }));
        setTimeout(() => {
          setStatus(prev => ({ ...prev, success: null }));
        }, 3000);
      } else {
        throw new Error(result.message || 'Avatar upload failed');
      }
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Avatar upload failed'
      }));
    } finally {
      setStatus(prev => ({ ...prev, loading: false }));
      e.target.value = '';
    }
  };

  // Get user data when the component is loaded
  useEffect(() => {
    fetchUserProfile();
  }, []);

  return (
    <div>
      <div className="flex gap-8">
        {/* Left personal information */}
        <div className="flex-1">
          <div className="space-y-6">
            {/* user_id */}
            <div className="grid gap-2">
              <label htmlFor="user_id">ID</label>
              <input
                type="text"
                id="user_id"
                value={profile.user_id}
                className="w-full p-2 border rounded-md bg-gray-50"
                disabled={true}
              />
            </div>

            {/* user_name */}
            <div className="grid gap-2">
              <label htmlFor="name">Name</label>
              <input 
                title="Name"
                type="text" 
                id="user_name"
                value={profile.user_name}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-md ${!isEditing ? 'bg-gray-50' : ''}`}
                disabled={!isEditing}
              />
            </div>

            {/* email */}
            <div className="grid gap-2">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                id="email"
                value={profile.email}
                className="w-full p-2 border rounded-md bg-gray-50"
                disabled={true}
              />
            </div>

            {/* telephone */}
            <div className="grid gap-2">
              <label htmlFor="telephone">Telephone</label>
              <input 
                type="tel" 
                id="telephone"
                value={profile.telephone}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-md ${!isEditing ? 'bg-gray-50' : ''}`}
                disabled={!isEditing}
              />
            </div>
          </div>

          {/* Error and success prompts */}
          {status.error && (
            <div className="mt-4 text-red-500 text-sm">
              {status.error}
            </div>
          )}
          {status.success && (
            <div className="mt-4 text-green-500 text-sm">
              {status.success}
            </div>
          )}

          {/* Buttons */}
          <div className="mt-6 flex gap-4">
            {!isEditing ? (
              <Button 
                onClick={() => setIsEditing(true)}
                disabled={status.loading}
              >
                Change Information
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handleSave}
                  disabled={status.loading}
                >
                  {status.loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleCancel}
                  disabled={status.loading}
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Right avatar section - remains unchanged */}
        <div className="w-[240px]">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-40 h-40">
              {profile.avatar ? (
                <AvatarImage 
                  src={profile.avatar} 
                  alt="User profile picture"
                  className="w-full h-full object-cover"
                />
              ) : (
                <AvatarFallback className="text-lg">
                  {profile.user_name ? profile.user_name.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className="w-full">
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={status.loading}
              />
              <label 
                htmlFor="avatar-upload" 
                className="w-full block"
              >
                <Button 
                  variant="outline" 
                  className="w-full" 
                  disabled={status.loading}
                  type="button"
                >
                  {status.loading ? 'Uploading...' : 'Change Avatar'}
                </Button>
              </label>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProfileSettings;