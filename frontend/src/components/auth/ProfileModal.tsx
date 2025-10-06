import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { User, Mail, Lock, Save, Loader2, X, Shield, Calendar, Settings, LogOut, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'settings'>('profile');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Helper function to format date safely
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Recently';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Recently';
      return date.toLocaleDateString();
    } catch (error) {
      return 'Recently';
    }
  };
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    aiSettings: {
      defaultModel: 'gpt-4o-mini',
      defaultTemperature: 0.7,
      defaultMaxTokens: 2000,
      personality: 'friendly' as 'friendly' | 'logical' | 'playful' | 'confident',
      defensiveMode: false,
      streamResponses: true
    },
    appearance: {
      theme: 'neural-blue',
      sidebarThemeEnabled: true,
      language: 'en',
      highContrast: false,
      largeText: false,
      reduceAnimations: false
    },
    notifications: {
      soundNotifications: true,
      desktopNotifications: false,
      showTyping: true,
      speechEnabled: false
    },
    privacy: {
      saveHistory: true,
      autoDelete: false,
      autoDeleteDays: 30,
      shareAnalytics: true
    },
    performance: {
      enableCaching: true,
      lazyLoadImages: true,
      autoScroll: true
    },
    accessibility: {
      keyboardShortcuts: true,
      screenReader: false
    }
  });
  const [settingsLoading, setSettingsLoading] = useState(false);

  React.useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email
      });
    }
  }, [user]);

  // Load settings when settings tab is selected
  React.useEffect(() => {
    if (isOpen && activeTab === 'settings') {
      loadSettings();
    }
  }, [isOpen, activeTab]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const result = await updateProfile(profileData.name, profileData.email);
      
      if (result.success) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => {
          setSuccess('');
          onClose();
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setIsSubmitting(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsSubmitting(false);
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      setError('Password must contain at least one lowercase letter, one uppercase letter, and one number');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      if (result.success) {
        setSuccess('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => {
          setSuccess('');
          onClose();
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load user settings
  const loadSettings = async () => {
    try {
      setSettingsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/user/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setSettingsLoading(false);
    }
  };

  // Save user settings
  const handleSettingsChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const handleSettingsSubmit = async () => {
    try {
      setSettingsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/user/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setSuccess('Settings saved successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to save settings');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Enhanced Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-gradient-to-r from-indigo-400/40 to-purple-400/40 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-gradient-to-r from-purple-400/50 to-cyan-400/50 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-2.5 h-2.5 bg-gradient-to-r from-cyan-400/45 to-indigo-400/45 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <Card className="w-full max-w-5xl mx-auto glass-dark border border-white/20 shadow-2xl relative overflow-hidden my-4">
        {/* Header with gradient background */}
        <CardHeader className="relative overflow-hidden">
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #06b6d4, #60a5fa)'
            }}
          ></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur-sm">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-white">Profile Settings</CardTitle>
                <p className="text-blue-100 text-sm">Manage your account information</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-4">
          {/* User Info Display */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-white">{user?.name}</h3>
                  <p className="text-gray-300 text-xs">{user?.email}</p>
                  <div className="flex items-center space-x-3 mt-1">
                    <div className="flex items-center space-x-1 text-xs text-gray-400">
                      <Shield className="h-3 w-3" />
                      <span>{user?.role === 'admin' ? 'Admin' : 'User'}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-400">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(user?.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-2">
              {/* Enhanced Tab Navigation */}
              <div className="flex space-x-1 bg-white/5 rounded-xl p-1 border border-white/10 mb-3">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                    activeTab === 'profile'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg transform scale-105'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                    activeTab === 'password'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg transform scale-105'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Lock className="h-4 w-4" />
                  <span>Security</span>
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                    activeTab === 'settings'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg transform scale-105'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </button>
              </div>
            </div>
          </div>


          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h4 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Personal Information</span>
                </h4>
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-gray-300 flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Full Name</span>
                      </label>
                      <div className="relative">
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          value={profileData.name}
                          onChange={handleProfileChange}
                          className="pl-4 h-10 bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl transition-all duration-300"
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium text-gray-300 flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>Email Address</span>
                      </label>
                      <div className="relative">
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={profileData.email}
                          onChange={handleProfileChange}
                          className="pl-4 h-10 bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl transition-all duration-300"
                          placeholder="Enter your email"
                          required
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 h-10 text-white border-0 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6, #06b6d4)'
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h4 className="text-base font-semibold text-white mb-3 flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Account Status</span>
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-3 w-3 text-green-400" />
                      <span className="text-xs text-green-400">Account Active</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-3 w-3 text-blue-400" />
                      <span className="text-xs text-blue-400">Role: {user?.role === 'admin' ? 'Admin' : 'User'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-3 w-3 text-purple-400" />
                      <span className="text-xs text-purple-400">Member since {formatDate(user?.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h4 className="text-base font-semibold text-white mb-3 flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Change Password</span>
                </h4>
                <form onSubmit={handlePasswordSubmit} className="space-y-3">
                  <div className="space-y-2">
                    <div className="space-y-2">
                      <label htmlFor="currentPassword" className="text-sm font-medium text-gray-300 flex items-center space-x-2">
                        <Lock className="h-4 w-4" />
                        <span>Current Password</span>
                      </label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="pl-4 pr-12 h-10 bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl transition-all duration-300"
                          placeholder="Enter your current password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="newPassword" className="text-sm font-medium text-gray-300 flex items-center space-x-2">
                        <Lock className="h-4 w-4" />
                        <span>New Password</span>
                      </label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="pl-4 pr-12 h-10 bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl transition-all duration-300"
                          placeholder="Enter your new password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                            <div className="text-xs text-gray-400 bg-white/5 p-2 rounded-lg">
                              <div className="grid grid-cols-2 gap-1">
                                <div className="flex items-center space-x-1">
                                  <div className={`w-1.5 h-1.5 rounded-full ${passwordData.newPassword.length >= 6 ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                                  <span>6+ chars</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <div className={`w-1.5 h-1.5 rounded-full ${/(?=.*[a-z])/.test(passwordData.newPassword) ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                                  <span>Lowercase</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <div className={`w-1.5 h-1.5 rounded-full ${/(?=.*[A-Z])/.test(passwordData.newPassword) ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                                  <span>Uppercase</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <div className={`w-1.5 h-1.5 rounded-full ${/(?=.*\d)/.test(passwordData.newPassword) ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                                  <span>Number</span>
                                </div>
                              </div>
                            </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300 flex items-center space-x-2">
                        <Lock className="h-4 w-4" />
                        <span>Confirm New Password</span>
                      </label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="pl-4 pr-12 h-10 bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl transition-all duration-300"
                          placeholder="Confirm your new password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                            {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                              <p className="text-xs text-red-400 flex items-center space-x-1">
                                <AlertCircle className="h-3 w-3" />
                                <span>No match</span>
                              </p>
                            )}
                            {passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword && (
                              <p className="text-xs text-green-400 flex items-center space-x-1">
                                <CheckCircle className="h-3 w-3" />
                                <span>Match</span>
                              </p>
                            )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 h-10 text-white border-0 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6, #06b6d4)'
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Changing...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          <span>Change Password</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
              
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h4 className="text-base font-semibold text-white mb-3 flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Security Information</span>
                </h4>
                <div className="space-y-2">
                  <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <h5 className="text-xs font-semibold text-blue-400 mb-1">Requirements</h5>
                    <div className="text-xs text-gray-300">
                      <div>• 6+ characters</div>
                      <div>• Upper & lowercase</div>
                      <div>• Include numbers</div>
                    </div>
                  </div>
                  
                  <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                    <h5 className="text-xs font-semibold text-green-400 mb-1">Security Tips</h5>
                    <div className="text-xs text-gray-300">
                      <div>• Use unique passwords</div>
                      <div>• Don't share credentials</div>
                      <div>• Change regularly</div>
                    </div>
                  </div>
                  
                  <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <div className="flex items-center space-x-2 text-xs text-gray-300">
                      <CheckCircle className="h-3 w-3 text-green-400" />
                      <span>2FA available</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              {settingsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                  <span className="ml-2 text-gray-400">Loading settings...</span>
                </div>
              ) : (
                <>
                  {/* AI Settings */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h4 className="text-base font-semibold text-white mb-3 flex items-center space-x-2">
                      <Settings className="h-4 w-4" />
                      <span>AI Settings</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Default Model</label>
                        <select
                          value={settings.aiSettings.defaultModel}
                          onChange={(e) => handleSettingsChange('aiSettings', 'defaultModel', e.target.value)}
                          className="w-full p-2 bg-white/5 border border-white/20 text-white rounded-lg focus:border-blue-400 focus:ring-blue-400/20"
                        >
                          <option value="gpt-4o-mini">GPT-4o Mini</option>
                          <option value="gpt-4o">GPT-4o</option>
                          <option value="gpt-4-turbo">GPT-4 Turbo</option>
                          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                          <option value="claude-sonnet-4-20250514">Claude Sonnet 4</option>
                          <option value="claude-haiku-3-20250514">Claude Haiku 3</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Personality</label>
                        <select
                          value={settings.aiSettings.personality}
                          onChange={(e) => handleSettingsChange('aiSettings', 'personality', e.target.value)}
                          className="w-full p-2 bg-white/5 border border-white/20 text-white rounded-lg focus:border-blue-400 focus:ring-blue-400/20"
                        >
                          <option value="friendly">Friendly</option>
                          <option value="logical">Logical</option>
                          <option value="playful">Playful</option>
                          <option value="confident">Confident</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Temperature: {settings.aiSettings.defaultTemperature}</label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={settings.aiSettings.defaultTemperature}
                          onChange={(e) => handleSettingsChange('aiSettings', 'defaultTemperature', parseFloat(e.target.value))}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Max Tokens: {settings.aiSettings.defaultMaxTokens}</label>
                        <input
                          type="range"
                          min="100"
                          max="4000"
                          step="100"
                          value={settings.aiSettings.defaultMaxTokens}
                          onChange={(e) => handleSettingsChange('aiSettings', 'defaultMaxTokens', parseInt(e.target.value))}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Appearance Settings */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h4 className="text-base font-semibold text-white mb-3 flex items-center space-x-2">
                      <Settings className="h-4 w-4" />
                      <span>Appearance</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Theme</label>
                        <select
                          value={settings.appearance.theme}
                          onChange={(e) => handleSettingsChange('appearance', 'theme', e.target.value)}
                          className="w-full p-2 bg-white/5 border border-white/20 text-white rounded-lg focus:border-blue-400 focus:ring-blue-400/20"
                        >
                          <option value="neural-blue">Neural Blue</option>
                          <option value="cyber-purple">Cyber Purple</option>
                          <option value="matrix-green">Matrix Green</option>
                          <option value="fire-red">Fire Red</option>
                          <option value="ice-blue">Ice Blue</option>
                          <option value="sunset-orange">Sunset Orange</option>
                          <option value="midnight-dark">Midnight Dark</option>
                          <option value="aurora-pink">Aurora Pink</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Language</label>
                        <select
                          value={settings.appearance.language}
                          onChange={(e) => handleSettingsChange('appearance', 'language', e.target.value)}
                          className="w-full p-2 bg-white/5 border border-white/20 text-white rounded-lg focus:border-blue-400 focus:ring-blue-400/20"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                          <option value="it">Italian</option>
                          <option value="pt">Portuguese</option>
                          <option value="ru">Russian</option>
                          <option value="ja">Japanese</option>
                          <option value="ko">Korean</option>
                          <option value="zh">Chinese</option>
                          <option value="ar">Arabic</option>
                          <option value="hi">Hindi</option>
                          <option value="nl">Dutch</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Sidebar Theme</span>
                        <input
                          type="checkbox"
                          checked={settings.appearance.sidebarThemeEnabled}
                          onChange={(e) => handleSettingsChange('appearance', 'sidebarThemeEnabled', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">High Contrast</span>
                        <input
                          type="checkbox"
                          checked={settings.appearance.highContrast}
                          onChange={(e) => handleSettingsChange('appearance', 'highContrast', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Large Text</span>
                        <input
                          type="checkbox"
                          checked={settings.appearance.largeText}
                          onChange={(e) => handleSettingsChange('appearance', 'largeText', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Reduce Animations</span>
                        <input
                          type="checkbox"
                          checked={settings.appearance.reduceAnimations}
                          onChange={(e) => handleSettingsChange('appearance', 'reduceAnimations', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Privacy Settings */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h4 className="text-base font-semibold text-white mb-3 flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>Privacy & Data</span>
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Save Chat History</span>
                        <input
                          type="checkbox"
                          checked={settings.privacy.saveHistory}
                          onChange={(e) => handleSettingsChange('privacy', 'saveHistory', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Auto Delete Old Chats</span>
                        <input
                          type="checkbox"
                          checked={settings.privacy.autoDelete}
                          onChange={(e) => handleSettingsChange('privacy', 'autoDelete', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">Share Analytics</span>
                        <input
                          type="checkbox"
                          checked={settings.privacy.shareAnalytics}
                          onChange={(e) => handleSettingsChange('privacy', 'shareAnalytics', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Settings Button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSettingsSubmit}
                      disabled={settingsLoading}
                      className="px-6 h-10 text-white border-0 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6, #06b6d4)'
                      }}
                    >
                      {settingsLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Save Settings</span>
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Enhanced Messages */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center space-x-2 animate-in slide-in-from-top-2 duration-300">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm flex items-center space-x-2 animate-in slide-in-from-top-2 duration-300">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Enhanced Logout Section */}
          <div className="pt-4 border-t border-white/10">
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <LogOut className="h-4 w-4 text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Sign Out</h4>
                    <p className="text-xs text-gray-400">End your current session</p>
                  </div>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="px-4 h-8 text-red-400 border-red-400/30 hover:bg-red-500/10 hover:border-red-400/50 rounded-lg transition-all duration-300 flex items-center space-x-2"
                >
                  <LogOut className="h-3 w-3" />
                  <span className="text-xs">Sign Out</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileModal;
