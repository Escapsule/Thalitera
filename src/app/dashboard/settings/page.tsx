"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Eye, EyeOff, Monitor, Smartphone, Laptop, User, Lock, Tablet, Shield, LogOut, Check, X, Clock } from 'lucide-react'
import useDeviceInfo from '@/hooks/use-device-info'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuth } from '@/hooks/useAuth'
import { useUserInfo, UserInfo } from '@/hooks/useUserInfo'
import { useLoginHistory } from '@/hooks/useLoginHistory'
import { useTrustedDevices, TrustedDevice } from '@/hooks/useTrustedDevices'
import { usePasswordUpdate } from '@/hooks/usePasswordUpdate'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface StatusState {
  loading: boolean;
  error: string | null;
  success: string | null;
}

// Sidebar component
const SettingsSidebar = ({ 
  activeSection, 
  setActiveSection, 
  handleLogout, 
  loading 
}: { 
  activeSection: string; 
  setActiveSection: (section: string) => void; 
  handleLogout: () => Promise<void>; 
  loading: boolean;
}) => {
  return (
    <div className="w-52 space-y-1.5 fixed top-6 pl-2">
      <div className="mb-8 mt-4">
        <h1 className="text-xl font-bold text-[lch(17_23_133)] mb-2">Settings</h1>
      </div>
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
      
      {/* Logout button */}
      <div className="mt-4">
        <Button 
          variant="outline" 
          size="sm"
          className="w-full flex items-center gap-2 bg-[lch(0_0_0)] text-white hover:bg-[lch(10_0_0)] hover:text-white border-0" 
          onClick={handleLogout}
          disabled={loading}
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="text-xs">Logout</span>
        </Button>
      </div>
    </div>
  );
};

const Page = () => {
  // Profile state
  const [profile, setProfile] = useState<UserInfo>({
    user_id: '',
    user_name: '',
    email: '',
    avatar: ''
  });
  
  // Auth hook for logout functionality
  const { logout } = useAuth();
  
  // Get user info from React Query
  const { data: userInfo, isLoading: isLoadingUserInfo, error: userInfoError, refetch: refetchUserInfo } = useUserInfo();
  
  // Get device info from hook
  const deviceInfo = useDeviceInfo();
  
  // Password update hook
  const { updatePassword, isUpdating, reset: resetPasswordUpdate } = usePasswordUpdate();
  
  // Profile edit mode
  const [isEditing, setIsEditing] = useState(false);
  
  // Active section in sidebar
  const [activeSection, setActiveSection] = useState('security');
  
  // New Password fields
  const [newPasswords, setNewPasswords] = useState<PasswordFormData>({
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
  const [status, setStatus] = useState<StatusState>({
    loading: false,
    error: null,
    success: null,
  });

  // Login history filter state
  const [loginFilter, setLoginFilter] = useState<{success?: boolean, start_time?: string}>(() => {
    // 计算3天前的日期
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    return {
      start_time: threeDaysAgo.toISOString()
    };
  });
  
  // 添加分别获取成功和失败登录记录的查询
  const { 
    data: failedLogins = [], 
    isLoading: isLoadingFailedLogins,
    error: failedLoginsError,
  } = useLoginHistory({ ...loginFilter, success: false });

  const { 
    data: successfulLogins = [], 
    isLoading: isLoadingSuccessfulLogins,
    error: successfulLoginsError,
  } = useLoginHistory({ ...loginFilter, success: true });

  // 默认登录记录，仅用于显示筛选后的数据
  const { 
    data,
    isLoading: isLoadingLoginHistory, 
    error: loginHistoryError,
  } = useLoginHistory(loginFilter.success !== undefined ? loginFilter : { start_time: loginFilter.start_time });

  // Fetch trusted devices
  const { 
    data: trustedDevices = [], 
    isLoading: isLoadingTrustedDevices,
    error: trustedDevicesError,
    isRevoking,
    deleteDevice,
    isDeleting
  } = useTrustedDevices();

  // 添加调试代码
  useEffect(() => {
    console.log('Login filter state:', loginFilter);
    console.log('Failed logins:', failedLogins);
    console.log('Successful logins:', successfulLogins);
    console.log('Filtered data:', data);
  }, [loginFilter, failedLogins, successfulLogins, data]);

  // 组合所有登录记录，按时间排序
  const allLoginHistory = React.useMemo(() => {
    // 如果设置了过滤器，直接使用过滤后的数据
    if (loginFilter.success !== undefined) {
      return data || [];
    }
    
    // 否则合并成功和失败的登录记录
    const combinedHistory = [
      ...(failedLogins || []),
      ...(successfulLogins || [])
    ];
    
    // 按登录时间排序（最新的在前）
    return combinedHistory.sort((a, b) => 
      new Date(b.login_time).getTime() - new Date(a.login_time).getTime()
    );
  }, [loginFilter, data, failedLogins, successfulLogins]);

  // 登录记录是否正在加载
  const isLoginHistoryLoading = loginFilter.success !== undefined
    ? isLoadingLoginHistory
    : isLoadingFailedLogins || isLoadingSuccessfulLogins;

  // 登录记录是否有错误
  const hasLoginHistoryError = loginFilter.success !== undefined
    ? !!loginHistoryError
    : (!!failedLoginsError || !!successfulLoginsError);

  // Update profile state when user info is loaded
  useEffect(() => {
    if (userInfo) {
      setProfile(userInfo as UserInfo);
    }
  }, [userInfo]);

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
        // Refetch user info to update the data
        refetchUserInfo();
        
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
    if (userInfo) {
      setProfile(userInfo as UserInfo);
    }
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
        // Refetch user info to update the avatar
        refetchUserInfo();
        
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
      
      await updatePassword({
        old_password: newPasswords.currentPassword,
        new_password: newPasswords.newPassword,
      });
      
      // Reset form fields on success
      setNewPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      setStatus(prev => ({ 
        ...prev, 
        success: 'Password updated successfully!' 
      }));
      
      setTimeout(() => {
        setStatus(prev => ({ ...prev, success: null }));
      }, 3000);
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Password update failed, please try again'
      }));
    } finally {
      setStatus(prev => ({ ...prev, loading: false }));
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true }));
      await logout();
      // Redirect will be handled by the logout function in useAuth
    } catch (error) {
      console.error('Logout error:', error);
      setStatus(prev => ({ 
        ...prev, 
        loading: false,
        error: 'Logout failed. Please try again.',
      }));
    }
  };

  // Add state for delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<TrustedDevice | null>(null);

  // Show loading state while fetching user info
  if (isLoadingUserInfo) {
    return <div className="flex h-screen items-center justify-center">Loading user information...</div>;
  }

  // Show error state if user info failed to load
  if (userInfoError) {
    return (
      <div className="flex h-screen items-center justify-center flex-col">
        <div className="text-red-500 mb-4">Failed to load user information</div>
        <Button onClick={() => refetchUserInfo()}>Try Again</Button>
      </div>
    );
  }
  
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
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input 
                      id="currentPassword" 
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
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input 
                      id="newPassword" 
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
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input 
                      id="confirmPassword" 
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
            <CardFooter className="flex flex-col space-y-3">
              <div className="flex w-full justify-between">
                <Button variant="outline" onClick={() => {
                  setNewPasswords({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  });
                  resetPasswordUpdate();
                }}>Cancel</Button>
                <Button 
                  onClick={handleUpdatePassword} 
                  disabled={status.loading || isUpdating}
                  className="cursor-pointer hover:bg-[lch(25_25_133)]"
                >
                  {status.loading || isUpdating ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
              
              {/* Show password update status messages here */}
              {status.error && status.error.includes('password') && (
                <div className="text-red-500 text-sm w-full">
                  {status.error}
                </div>
              )}
              {status.success && status.success.includes('Password') && (
                <div className="text-green-500 text-sm w-full">
                  {status.success}
                </div>
              )}
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
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500">Active</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Trusted Devices</CardTitle>
              <CardDescription>
                Devices that are currently trusted to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTrustedDevices ? (
                <div className="py-6 text-center text-muted-foreground">
                  Loading trusted devices...
                </div>
              ) : trustedDevicesError ? (
                <div className="py-6 text-center text-red-500">
                  Failed to load trusted devices
                </div>
              ) : trustedDevices.length > 0 ? (
                <div className="space-y-5">
                  {trustedDevices.map((device: TrustedDevice, index: number) => (
                    <div key={index} className={`flex items-start justify-between border-b pb-4 last:border-0 last:pb-0 ${device.isCurrentDevice ? 'bg-blue-50 p-3 rounded-md -mx-3' : ''}`}>
                      <div className="flex gap-3">
                        <div className="mt-1">
                          <div className={`${device.isCurrentDevice ? 'bg-blue-200' : 'bg-blue-100'} p-1.5 rounded-full`}>
                            {device.browser.toLowerCase().includes('mobile') ? (
                              <Smartphone className={`h-4 w-4 ${device.isCurrentDevice ? 'text-blue-700' : 'text-blue-600'}`} />
                            ) : (
                              <Laptop className={`h-4 w-4 ${device.isCurrentDevice ? 'text-blue-700' : 'text-blue-600'}`} />
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {device.browser}
                            {device.isCurrentDevice && (
                              <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800 border-blue-200">
                                Current Device
                              </Badge>
                            )}
                          </p>
                          <div className="text-sm text-muted-foreground mt-1">
                            <div className="grid grid-cols-1 gap-y-1">
                              <p>OS: {device.os}</p>
                              <p>Location: {device.location}</p>
                              <p>IP: {device.ip || 'Unknown'}</p>
                              <p className="font-mono text-xs mt-1">ID: {device.fingerprint}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={device.isCurrentDevice ? "default" : "outline"} className={device.isCurrentDevice ? "bg-blue-500" : "border-blue-300 text-blue-700"}>
                          {device.isCurrentDevice ? 'This Device' : 'Trusted'}
                        </Badge>
                        
                        {!device.isCurrentDevice && (
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="rounded-md bg-red-500 hover:bg-red-600 text-white"
                            onClick={() => {
                              setDeviceToDelete(device);
                              setDeleteDialogOpen(true);
                            }}
                            disabled={isDeleting || isRevoking}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-muted-foreground">
                  No trusted devices found
                </div>
              )}
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
              <Tabs defaultValue="all" className="w-full mb-4" onValueChange={(value) => {
                // 保持时间范围不变
                const start_time = loginFilter.start_time;
                
                if (value === 'all') {
                  setLoginFilter({ start_time });
                } else if (value === 'success') {
                  setLoginFilter({ success: true, start_time });
                } else if (value === 'failed') {
                  setLoginFilter({ success: false, start_time });
                }
              }}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All Logins</TabsTrigger>
                  <TabsTrigger value="success">Successful</TabsTrigger>
                  <TabsTrigger value="failed">Failed</TabsTrigger>
                </TabsList>
              </Tabs>
            
              <div className="mb-4 flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Showing login records from {loginFilter.start_time 
                    ? new Date(loginFilter.start_time).toLocaleDateString() 
                    : 'all time'} to present
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8">
                      <Clock className="mr-2 h-4 w-4" />
                      Time Range
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => {
                        // 保持成功/失败过滤不变
                        const success = loginFilter.success;
                        const options = success !== undefined ? { success } : {};
                        setLoginFilter(options); // 不设置时间，查看所有记录
                      }}
                    >
                      All Time
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        // 计算过去24小时
                        const oneDayAgo = new Date();
                        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
                        
                        // 保持成功/失败过滤不变
                        const success = loginFilter.success;
                        const options = success !== undefined ? { success, start_time: oneDayAgo.toISOString() } : { start_time: oneDayAgo.toISOString() };
                        setLoginFilter(options);
                      }}
                    >
                      Last 24 Hours
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        // 计算过去3天
                        const threeDaysAgo = new Date();
                        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
                        
                        // 保持成功/失败过滤不变
                        const success = loginFilter.success;
                        const options = success !== undefined ? { success, start_time: threeDaysAgo.toISOString() } : { start_time: threeDaysAgo.toISOString() };
                        setLoginFilter(options);
                      }}
                    >
                      Last 3 Days
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        // 计算过去7天
                        const sevenDaysAgo = new Date();
                        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                        
                        // 保持成功/失败过滤不变
                        const success = loginFilter.success;
                        const options = success !== undefined ? { success, start_time: sevenDaysAgo.toISOString() } : { start_time: sevenDaysAgo.toISOString() };
                        setLoginFilter(options);
                      }}
                    >
                      Last 7 Days
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        // 计算过去30天
                        const thirtyDaysAgo = new Date();
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                        
                        // 保持成功/失败过滤不变
                        const success = loginFilter.success;
                        const options = success !== undefined ? { success, start_time: thirtyDaysAgo.toISOString() } : { start_time: thirtyDaysAgo.toISOString() };
                        setLoginFilter(options);
                      }}
                    >
                      Last 30 Days
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            
              {isLoginHistoryLoading ? (
                <div className="py-6 text-center text-muted-foreground">
                  Loading login history...
                </div>
              ) : hasLoginHistoryError ? (
                <div className="py-6 text-center text-red-500">
                  Failed to load login history
                </div>
              ) : allLoginHistory.length > 0 ? (
                <div className="h-[430px] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="space-y-4">
                    {allLoginHistory.map((entry, index) => {
                      const date = new Date(entry.login_time);
                      const formattedDate = date.toLocaleDateString();
                      const formattedTime = date.toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                      
                      return (
                        <div key={index} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                          <div className="flex gap-3">
                            <div className="mt-1">
                              {entry.success ? (
                                <div className="bg-green-100 p-1 rounded-full">
                                  <Check className="h-4 w-4 text-green-600" />
                                </div>
                              ) : (
                                <div className="bg-red-100 p-1 rounded-full">
                                  <X className="h-4 w-4 text-red-600" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">
                                {index === 0 ? 'Latest Login' : `Login ${index + 1}`}
                                {!entry.success && (
                                  <span className="text-red-500 text-sm ml-2">Failed</span>
                                )}
                              </p>
                              {!entry.success && entry.failure_reason && (
                                <p className="text-sm text-red-500 mt-1">
                                  {entry.failure_reason}
                                </p>
                              )}
                              <div className="text-sm text-muted-foreground mt-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1 gap-x-4">
                                  <p>Browser: {entry.trust_device.browser}</p>
                                  <p>OS: {entry.trust_device.os}</p>
                                  <p>Location: {entry.trust_device.location}</p>
                                  <p>IP: {entry.trust_device.ip || 'Unknown'}</p>
                                </div>
                                <p className="mt-1">{formattedDate}, {formattedTime}</p>
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant={entry.success ? "default" : "secondary"}
                            className={entry.success ? "bg-green-500" : "bg-gray-200 text-gray-800"}
                          >
                            {entry.success ? 'Success' : 'Failed'}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-muted-foreground">
                  No login history found
                </div>
              )}
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
    <div className="container py-6 max-w-6xl">
      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg">Delete Trusted Device</DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete this trusted device?
            </DialogDescription>
          </DialogHeader>
          
          {deviceToDelete && (
            <div className="py-4">
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Browser:</span>
                  <span>{deviceToDelete.browser}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">OS:</span>
                  <span>{deviceToDelete.os}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Location:</span>
                  <span>{deviceToDelete.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">IP:</span>
                  <span>{deviceToDelete.ip || 'Unknown'}</span>
                </div>
              </div>
              <p className="text-sm text-red-500">
                This action cannot be undone. This device will need to be re-authenticated on next login.
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeviceToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-red-500 hover:bg-red-600"
              onClick={() => {
                if (deviceToDelete) {
                  deleteDevice(deviceToDelete.fingerprint);
                  setDeleteDialogOpen(false);
                  setDeviceToDelete(null);
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex relative">
        {/* Sidebar container - fixed width for positioning */}
        <div className="hidden md:block w-52 flex-shrink-0">
          <SettingsSidebar 
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            handleLogout={handleLogout}
            loading={status.loading}
          />
        </div>

        {/* Mobile sidebar - only shown on small screens */}
        <div className="md:hidden w-full mb-6">
          <div className="flex space-x-2">
            <Button 
              variant={activeSection === 'profile' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setActiveSection('profile')}
              className="flex-1"
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button 
              variant={activeSection === 'security' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setActiveSection('security')}
              className="flex-1"
            >
              <Lock className="h-4 w-4 mr-2" />
              Security
            </Button>
            <Button 
              variant={activeSection === 'device' ? 'default' : 'outline'} 
              size="sm" 
              onClick={() => setActiveSection('device')}
              className="flex-1"
            >
              <Tablet className="h-4 w-4 mr-2" />
              Device
            </Button>
          </div>
        </div>

        {/* Main content area - can scroll independently */}
        <div className="flex-1 md:pl-12 overflow-y-auto">
          {renderContent()}

          {/* Only show error/success messages not related to password updates */}
          {status.error && !status.error.includes('password') && (
            <div className="mt-4 text-red-500 text-sm">
              {status.error}
            </div>
          )}
          {status.success && !status.success.includes('Password') && (
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