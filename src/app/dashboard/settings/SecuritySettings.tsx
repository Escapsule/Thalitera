import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

interface SecurityStatus {
  loading: boolean;
  error: string | null;
  success: string | null;
}

const SecuritySettings = () => {
  // Current Password Status
  const [currentPassword, setCurrentPassword] = useState('');
  
  // Whether to show the change password form
  const [showChangePassword, setShowChangePassword] = useState(false);
  
  // New Password Status
  const [newPasswords, setNewPasswords] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  // Password Visibility Status
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  // Status Management
  const [status, setStatus] = useState<SecurityStatus>({
    loading: false,
    error: null,
    success: null,
  });

  // Get current password
  useEffect(() => {
    fetchCurrentPassword();
  }, []);

  const fetchCurrentPassword = async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true, error: null }));
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const result = await response.json();
      if (result.code === 200 && result.data) {
        setCurrentPassword(result.data.password || '');
      } else {
        throw new Error(result.message || 'Failed to obtain password information');
      }
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to obtain password information'
      }));
    } finally {
      setStatus(prev => ({ ...prev, loading: false }));
    }
  };

  // Handle new password input changes
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

  // Form validation
  const validateForm = (): string | null => {
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

  // Handle password update
  const handleUpdatePassword = async () => {
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
          current_password: currentPassword,
          new_password: newPasswords.newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const result = await response.json();
      if (result.code === 200) {
        // Refresh current password display after successful update
        await fetchCurrentPassword();
        // Reset form
        setNewPasswords({
          newPassword: '',
          confirmPassword: '',
        });
        setShowChangePassword(false);
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

  return (
    <div className="p-6 bg-white rounded-lg hover:bg-[lch(97_0_0)] transition-colors">
      <div className="max-w-2xl">
        <div className="space-y-6">
          {/* Current Password */}
          <div className="grid gap-2">
            <label htmlFor="currentPassword" className="font-medium text-[lch(17_23_133)]">Current Password</label>
            <div className="relative">
              <input 
                type={showPasswords.currentPassword ? "text" : "password"}
                id="currentPassword"
                value={currentPassword}
                className="w-full p-2 border rounded-md pr-10 bg-[lch(97_0_0)]"
                disabled={true}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('currentPassword')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[lch(17_23_133)] hover:text-[lch(25_25_133)]"
              >
                {showPasswords.currentPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Change Password Button */}
          {!showChangePassword && (
            <Button 
              onClick={() => setShowChangePassword(true)}
              className="mt-4 bg-[lch(17_23_133)] hover:bg-[lch(25_25_133)]"
            >
              Change Password
            </Button>
          )}

          {/* Change Password Form */}
          {showChangePassword && (
            <>
              {/* New Password */}
              <div className="grid gap-2">
                <label htmlFor="newPassword" className="font-medium text-[lch(17_23_133)]">New Password</label>
                <div className="relative">
                  <input 
                    type={showPasswords.newPassword ? "text" : "password"}
                    id="newPassword"
                    value={newPasswords.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full p-2 border rounded-md pr-10 border-[lch(17_23_133)]"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('newPassword')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[lch(17_23_133)] hover:text-[lch(25_25_133)]"
                  >
                    {showPasswords.newPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="grid gap-2">
                <label htmlFor="confirmPassword" className="font-medium text-[lch(17_23_133)]">Confirm New Password</label>
                <div className="relative">
                  <input 
                    type={showPasswords.confirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={newPasswords.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full p-2 border rounded-md pr-10 border-[lch(17_23_133)]"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[lch(17_23_133)] hover:text-[lch(25_25_133)]"
                  >
                    {showPasswords.confirmPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Operation Buttons */}
              <div className="flex gap-4">
                <Button 
                  onClick={handleUpdatePassword} 
                  disabled={status.loading}
                  className="bg-[lch(17_23_133)] hover:bg-[lch(25_25_133)]"
                >
                  {status.loading ? 'Updating...' : 'Confirm Changes'}
                </Button>
                <Button 
                  onClick={() => {
                    setShowChangePassword(false);
                    setNewPasswords({ newPassword: '', confirmPassword: '' });
                    setStatus(prev => ({ ...prev, error: null }));
                  }}
                  variant="outline"
                  className="border-[lch(17_23_133)] text-[lch(17_23_133)] hover:bg-[lch(94_5_133)]"
                >
                  Cancel
                </Button>
              </div>
            </>
          )}

          {/* Error and Success Prompt */}
          {status.error && (
            <div className="text-red-500 text-sm">
              {status.error}
            </div>
          )}
          {status.success && (
            <div className="text-green-500 text-sm">
              {status.success}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;