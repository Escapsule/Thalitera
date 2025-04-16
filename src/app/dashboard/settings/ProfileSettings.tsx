import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface UserProfile {
  user_id: string;
  user_name: string;
  email: string;
  avatar: string;
}

const ProfileSettings = () => {
  const [profile, setProfile] = useState<UserProfile>({
    user_id: '',
    user_name: '',
    email: '',
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
      const response = await fetch('/api/user/info', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const result = await response.json();
      if (result.data) {
        setProfile({
          user_id: result.data.user_id || '',
          user_name: result.data.username || '',
          email: result.data.email || '',
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
      if (result.code === 1073741824) {
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
      if (result.code === 1073741824) {
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
    <div className="p-6 bg-white rounded-lg hover:bg-[lch(97_0_0)] transition-colors">
      <div className="flex flex-col md:flex-row md:gap-8">
        {/* Avatar section - moved to left side on desktop */}
        <div className="w-full md:w-[240px] mb-6 md:mb-0">
          <div className="flex flex-col items-center gap-4">
            <Avatar className="w-40 h-40 border-4 border-[lch(94_5_133)]">
              {profile.avatar ? (
                <AvatarImage 
                  src={profile.avatar} 
                  alt="User profile picture"
                  className="w-full h-full object-cover"
                />
              ) : (
                <AvatarFallback className="text-4xl bg-[lch(94_5_133)] text-[lch(17_23_133)]">
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
                  className="w-full border-[lch(17_23_133)] text-[lch(17_23_133)] hover:bg-[lch(94_5_133)] hover:text-[lch(17_23_133)]" 
                  disabled={status.loading}
                  type="button"
                >
                  {status.loading ? 'Uploading...' : 'Change Avatar'}
                </Button>
              </label>
            </div>
          </div>
        </div>

        {/* Personal information - right side */}
        <div className="flex-1">
          <div className="space-y-6">
            {/* user_name */}
            <div className="grid gap-2">
              <label htmlFor="name" className="font-medium text-[lch(17_23_133)]">Name</label>
              <input 
                title="Name"
                type="text" 
                id="user_name"
                value={profile.user_name}
                onChange={handleInputChange}
                className={`w-full p-2 border rounded-md ${!isEditing ? 'bg-[lch(97_0_0)]' : 'border-[lch(17_23_133)]'}`}
                disabled={!isEditing}
              />
            </div>

            {/* email */}
            <div className="grid gap-2">
              <label htmlFor="email" className="font-medium text-[lch(17_23_133)]">Email</label>
              <input 
                type="email" 
                id="email"
                value={profile.email}
                className="w-full p-2 border rounded-md bg-[lch(97_0_0)]"
                disabled={true}
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
                className="bg-[lch(17_23_133)] hover:bg-[lch(25_25_133)]"
              >
                Change Information
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handleSave}
                  disabled={status.loading}
                  className="bg-[lch(17_23_133)] hover:bg-[lch(25_25_133)]"
                >
                  {status.loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleCancel}
                  disabled={status.loading}
                  className="border-[lch(17_23_133)] text-[lch(17_23_133)] hover:bg-[lch(94_5_133)]"
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;