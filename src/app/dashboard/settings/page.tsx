"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Eye, EyeOff, Monitor, Smartphone, Laptop, User, Lock, Tablet, Shield } from 'lucide-react'
import useDeviceInfo from '@/hooks/use-device-info'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface UserProfile {
  user_id: string;
  user_name: string;
  email: string;
  avatar: string;
}

const Page = () => {
  // Profile state
  const [profile, setProfile] = useState<UserProfile>({
    user_id: '',
    user_name: '',
    email: '',
    avatar: ''
  });
  
  // Get device info from hook
  const deviceInfo = useDeviceInfo();
  
  // Profile edit mode
  const [isEditing, setIsEditing] = useState(false);
  
  // Active section in sidebar
  const [activeSection, setActiveSection] = useState('security');
  
  // New Password fields
  const [newPasswords, setNewPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Password visibility toggles
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  // Status management
  const [status, setStatus] = useState({
    loading: false,
    error: null as string | null,
    success: null as string | null,
  });

  // Get user profile data
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

  // Handle profile input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [id]: value
    }));
    setStatus(prev => ({ ...prev, error: null }));
  };

  // Handle password input changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewPasswords(prev => ({
      ...prev,
      [id]: value
    }));
    setStatus(prev => ({ ...prev, error: null }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Validate profile form
  const validateProfileForm = (): string | null => {
    if (!profile.user_name.trim()) {
      return 'Username cannot be empty';
    }
    
    if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      return 'Email format is incorrect';
    }
    
    return null;
  };

  // Validate password form
  const validatePasswordForm = (): string | null => {
    if (!newPasswords.currentPassword) {
      return 'Please enter your current password';
    }
    if (!newPasswords.newPassword) {
      return 'Please enter a new password';
    }
    if (newPasswords.newPassword !== newPasswords.confirmPassword) {
      return 'The new passwords you entered do not match';
    }
    if (newPasswords.newPassword.length < 8) {
      return 'The new password must be at least 8 characters long';
    }
    return null;
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    const validationError = validateProfileForm();
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
        setIsEditing(false);
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

  // Cancel profile editing
  const handleCancelProfile = () => {
    setIsEditing(false);
    fetchUserProfile();
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

  // Update password
  const handleUpdatePassword = async () => {
    const validationError = validatePasswordForm();
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
          current_password: newPasswords.currentPassword,
          new_password: newPasswords.newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const result = await response.json();
      if (result.code === 200) {
        setNewPasswords({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setStatus(prev => ({ ...prev, success: 'Password updated successfully!' }));
        setTimeout(() => {
          setStatus(prev => ({ ...prev, success: null }));
        }, 3000);
      } else {
        throw new Error(result.message || 'Password update failed, please try again');
      }
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Password update failed, please try again'
      }));
    } finally {
      setStatus(prev => ({ ...prev, loading: false }));
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Get device icon based on type
  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-5 w-5" />;
      case 'tablet':
        return <Smartphone className="h-5 w-5" />;
      case 'laptop':
        return <Laptop className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  // Helper for rendering the security tab content
  const renderSecurityContent = () => {
    return (
      <div className="flex-1 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-[lch(17_23_133)] mb-4">Security Settings</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input 
                      id="current-password" 
                      type={showPasswords.currentPassword ? "text" : "password"} 
                      value={newPasswords.currentPassword}
                      onChange={handlePasswordChange}
                    />
                    <Button 
                      variant="ghost" 
                      type="button"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3" 
                      onClick={() => togglePasswordVisibility('currentPassword')}
                    >
                      {showPasswords.currentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input 
                      id="new-password" 
                      type={showPasswords.newPassword ? "text" : "password"} 
                      value={newPasswords.newPassword}
                      onChange={handlePasswordChange}
                    />
                    <Button 
                      variant="ghost" 
                      type="button"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3" 
                      onClick={() => togglePasswordVisibility('newPassword')}
                    >
                      {showPasswords.newPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Input 
                      id="confirm-password" 
                      type={showPasswords.confirmPassword ? "text" : "password"} 
                      value={newPasswords.confirmPassword}
                      onChange={handlePasswordChange}
                    />
                    <Button 
                      variant="ghost" 
                      type="button"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"  
                      onClick={() => togglePasswordVisibility('confirmPassword')}
                    >
                      {showPasswords.confirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => {
                setNewPasswords({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: '',
                });
              }}>Cancel</Button>
              <Button onClick={handleUpdatePassword} disabled={status.loading}>
                {status.loading ? 'Updating...' : 'Update Password'}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Multi-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <Shield className="h-10 w-10 text-[lch(40_40_270)]" />
                    <div>
                      <h3 className="font-medium">Authenticator App</h3>
                      <p className="text-sm text-muted-foreground">
                        Use an authenticator app like Google Authenticator or Microsoft Authenticator
                        to get verification codes when you sign in.
                      </p>
                    </div>
                  </div>
                  <Link href="/dashboard/mfa-setup">
                    <Button variant="outline">Setup MFA</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Login History</CardTitle>
              <CardDescription>
                Review your recent login activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">
                        {i === 0 ? 'Current Session' : `Login ${i}`}
                      </p>
                      <div className="text-sm text-muted-foreground">
                        <p>IP: 192.168.1.{i + 1}</p>
                        <p>{i === 0 ? 'Today, ' : 'Yesterday, '} 
                          {new Date().toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge variant={i === 0 ? "default" : "secondary"} className={i === 0 ? "bg-green-500" : ""}>
                      {i === 0 ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // Modify renderContent function to use the new renderSecurityContent
  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="p-6 bg-white rounded-lg">
            <h2 className="text-xl font-semibold text-[lch(17_23_133)] mb-6">Profile Settings</h2>
            
            <div className="flex flex-col md:flex-row md:gap-16">
              {/* Avatar section - increased right margin */}
              <div className="w-full md:w-[200px] mb-6 md:mb-0">
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

              {/* Personal information */}
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
                        onClick={handleSaveProfile}
                        disabled={status.loading}
                        className="bg-[lch(17_23_133)] hover:bg-[lch(25_25_133)]"
                      >
                        {status.loading ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={handleCancelProfile}
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
      case 'security':
        return renderSecurityContent();
      case 'device':
        return (
          <div className="p-6 bg-white rounded-lg">
            <h2 className="text-xl font-semibold text-[lch(17_23_133)] mb-6">Your Current Device</h2>
            
            {deviceInfo ? (
              <div className="p-4 border rounded-lg border-[lch(17_23_133)]">
                <div className="flex items-center gap-3">
                  <div className="text-[lch(17_23_133)]">
                    {getDeviceIcon(deviceInfo.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <p className="font-medium">{deviceInfo.name}</p>
                      {deviceInfo.isNewDevice && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          New Device
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Operating System:</span>
                        <span className="text-sm text-muted-foreground">{deviceInfo.os}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Browser:</span>
                        <span className="text-sm text-muted-foreground">{deviceInfo.browser}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Last Login:</span>
                        <span className="text-sm text-muted-foreground">{new Date().toLocaleString()}</span>
                      </div>
                      {deviceInfo.fingerprint && (
                        <div className="flex items-center gap-2 col-span-2">
                          <span className="text-sm font-medium">Device Fingerprint:</span>
                          <span className="text-sm text-muted-foreground font-mono">{deviceInfo.fingerprint}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 text-muted-foreground">
                Unable to detect device information
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container py-6 ml-12 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[lch(17_23_133)] mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and security settings</p>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar - made narrower with sharper edges */}
        <div className="w-full md:w-52 space-y-1.5">
          <div 
            className={`p-2 rounded-md flex items-center gap-2 cursor-pointer ${activeSection === 'profile' ? 'bg-[lch(94_5_133)] text-[lch(17_23_133)]' : 'hover:bg-[lch(97_1_133)] text-[lch(17_23_133)]'}`}
            onClick={() => setActiveSection('profile')}
          >
            <User className="h-4 w-4" />
            <span className="font-medium text-sm">Profile</span>
          </div>
          <div 
            className={`p-2 rounded-md flex items-center gap-2 cursor-pointer ${activeSection === 'security' ? 'bg-[lch(94_5_133)] text-[lch(17_23_133)]' : 'hover:bg-[lch(97_1_133)] text-[lch(17_23_133)]'}`}
            onClick={() => setActiveSection('security')}
          >
            <Lock className="h-4 w-4" />
            <span className="font-medium text-sm">Security</span>
          </div>
          <div 
            className={`p-2 rounded-md flex items-center gap-2 cursor-pointer ${activeSection === 'device' ? 'bg-[lch(94_5_133)] text-[lch(17_23_133)]' : 'hover:bg-[lch(97_1_133)] text-[lch(17_23_133)]'}`}
            onClick={() => setActiveSection('device')}
          >
            <Tablet className="h-4 w-4" />
            <span className="font-medium text-sm">Device Info</span>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1">
          {renderContent()}

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
        </div>
      </div>
    </div>
  );
};
  
export default Page;