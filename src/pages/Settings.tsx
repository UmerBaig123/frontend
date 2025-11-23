 
import React, { useState, useEffect } from "react";
import PageContainer from "@/components/layout/PageContainer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { User, Bell, Shield, Building, Mail, Key } from "lucide-react";
import { useCompanyInfo } from "@/hooks/use-company-info";
import { useProfileInfo, ProfileInfo } from "@/hooks/use-profile-info";
import { useAuth } from "@/hooks/use-auth";
import { authAPI } from "@/api/auth";

const Settings = () => {
  const { toast } = useToast();
  const { companyInfo, updateCompanyInfo } = useCompanyInfo();
  const { profileInfo, updateProfileInfo } = useProfileInfo();
  const { user, logout } = useAuth();
  
  const [profileFormData, setProfileFormData] = useState<ProfileInfo>({...profileInfo});
  const [companyFormData, setCompanyFormData] = useState({
    companyName: companyInfo.companyName,
    website: companyInfo.website || '',
    address: companyInfo.address
  });
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Notification preferences state
  const [notificationPreferences, setNotificationPreferences] = useState({
    emailNotifications: true,
    bidUpdates: true,
    marketing: false
  });
  
  // Loading states
  const [accountLoading, setAccountLoading] = useState(false);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  
  // Sync profile with authenticated user data
  useEffect(() => {
    if (user) {
      setProfileFormData(prev => ({
        ...prev,
        fullName: user.fullName || prev.fullName,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  // Load user profile from backend and populate all sections
  useEffect(() => {
    const loadUserProfile = async () => {
      setInitialLoading(true);
      try {
        const res: any = await authAPI.getUserProfile();
        const payload: any = res?.data || res?.user || res;
        if (payload) {
          const company = payload.company || {};
          const notifications = payload.notifications || {};
          // Account/profile
          setProfileFormData(prev => ({
            ...prev,
            fullName: payload.fullName ?? prev.fullName ?? '',
            email: payload.email ?? prev.email ?? '',
            company: (company.name ?? prev.company ?? ''),
            phone: payload.phone ?? prev.phone ?? ''
          }));
          // Company
          setCompanyFormData({
            companyName: company.name ?? companyFormData.companyName ?? '',
            website: company.website ?? companyFormData.website ?? '',
            address: company.address ?? companyFormData.address ?? ''
          });
          // Notifications
          setNotificationPreferences({
            emailNotifications: Boolean(notifications.emailNotifications ?? notificationPreferences.emailNotifications),
            bidUpdates: Boolean(notifications.bidUpdates ?? notificationPreferences.bidUpdates),
            marketing: Boolean((notifications.marketingCommunications) ?? notificationPreferences.marketing)
          });
        }
      } catch (e) {
        console.error('Failed to load user profile:', e);
      } finally {
        setInitialLoading(false);
      }
    };
    loadUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProfileFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleCompanyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setCompanyFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleNotificationChange = (key: keyof typeof notificationPreferences) => {
    setNotificationPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const handleSaveProfile = async () => {
    setAccountLoading(true);
    try {
      const response = await authAPI.updateAccountInfo({
        fullName: profileFormData.fullName,
        companyName: profileFormData.company,
        phone: profileFormData.phone
      });
      
      if (response.success) {
        // Refresh from server to display updated values
        const refreshed: any = await authAPI.getUserProfile();
        const payload: any = refreshed?.data || refreshed?.user || refreshed;
        if (payload) {
          const company = payload.company || {};
          setProfileFormData(prev => ({
            ...prev,
            fullName: payload.fullName ?? prev.fullName,
            email: payload.email ?? prev.email,
            company: company.name ?? prev.company,
            phone: payload.phone ?? prev.phone
          }));
        }
        updateProfileInfo(profileFormData);
        toast({
          title: "Profile saved",
          description: "Your profile information has been updated successfully.",
        });
      } else {
        throw new Error((response as any).message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAccountLoading(false);
    }
  };
  
  const handleSaveCompany = async () => {
    setCompanyLoading(true);
    try {
      const response = await authAPI.updateCompanyInfo({
        companyName: companyFormData.companyName,
        website: companyFormData.website,
        address: companyFormData.address
      });
      
      if (response.success) {
        // Refresh from server
        const refreshed: any = await authAPI.getUserProfile();
        const payload: any = refreshed?.data || refreshed?.user || refreshed;
        if (payload) {
          const company = payload.company || {};
          setCompanyFormData({
            companyName: company.name ?? companyFormData.companyName,
            website: company.website ?? companyFormData.website,
            address: company.address ?? companyFormData.address
          });
        }
        updateCompanyInfo(companyFormData);
        toast({
          title: "Company information saved",
          description: "Your company information has been updated successfully.",
        });
      } else {
        throw new Error((response as any).message || 'Failed to update company information');
      }
    } catch (error) {
      console.error('Error updating company info:', error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update company information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCompanyLoading(false);
    }
  };
  
  const handleSaveNotificationSettings = async () => {
    setNotificationLoading(true);
    try {
      const response = await authAPI.updateNotificationPreferences({
        emailNotifications: notificationPreferences.emailNotifications,
        bidUpdates: notificationPreferences.bidUpdates,
        marketingCommunications: notificationPreferences.marketing
      });
      
      if (response.success) {
        // Refresh from server
        const refreshed: any = await authAPI.getUserProfile();
        const payload: any = refreshed?.data || refreshed?.user || refreshed;
        if (payload) {
          const notifications = payload.notifications || {};
          setNotificationPreferences({
            emailNotifications: Boolean(notifications.emailNotifications ?? notificationPreferences.emailNotifications),
            bidUpdates: Boolean(notifications.bidUpdates ?? notificationPreferences.bidUpdates),
            marketing: Boolean((notifications.marketingCommunications) ?? notificationPreferences.marketing)
          });
        }
        toast({
          title: "Notification preferences saved",
          description: "Your notification preferences have been updated successfully.",
        });
      } else {
        throw new Error((response as any).message || 'Failed to update notification preferences');
      }
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update notification preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setNotificationLoading(false);
    }
  };
  
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }
    
    setPasswordLoading(true);
    
    try {
      const response = await authAPI.updatePassword({
        currentPassword,
        newPassword,
        confirmPassword
      });
      
      if (response.success) {
        // Clear form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        toast({
          title: "Password updated",
          description: "Your password has been updated successfully.",
        });
      } else {
        throw new Error((response as any).message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordError(error instanceof Error ? error.message : 'Failed to update password. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="page-heading">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account settings and preferences</p>
        </div>
        
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="business" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Company
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                      id="fullName" 
                      value={profileFormData.fullName} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      value={profileFormData.email} 
                      type="email" 
                      onChange={handleInputChange}
                      readOnly={!!user} // Make email readonly if authenticated
                      className={user ? "bg-gray-100" : ""}
                    />
                    {user && (
                      <p className="text-xs text-gray-500">Email is linked to your account and cannot be changed.</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input 
                      id="company" 
                      value={profileFormData.company}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
                      value={profileFormData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="flex justify-between mt-4">
                  <Button 
                    className="mt-4" 
                    onClick={handleSaveProfile}
                    disabled={accountLoading || initialLoading}
                  >
                    {(accountLoading || initialLoading) ? "Saving..." : "Save Changes"}
                  </Button>
                  {user && (
                    <Button variant="outline" className="mt-4 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600" onClick={logout}>
                      Log Out
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="business" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Your company details that appear throughout the application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input 
                      id="companyName" 
                      // profileFormData.company
                      value={companyFormData.companyName}
                      onChange={handleCompanyInputChange} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input 
                      id="website" 
                      value={companyFormData.website}
                      onChange={handleCompanyInputChange} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input 
                    id="address" 
                    value={companyFormData.address}
                    onChange={handleCompanyInputChange} 
                  />
                </div>
                <Button 
                  className="mt-4" 
                  onClick={handleSaveCompany}
                  disabled={companyLoading || initialLoading}
                >
                  {(companyLoading || initialLoading) ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what notifications you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive emails about your account activity</p>
                  </div>
                  <Switch 
                    id="email-notifications" 
                    checked={notificationPreferences.emailNotifications}
                    onCheckedChange={() => handleNotificationChange('emailNotifications')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="bid-updates">Bid Updates</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when a bid status changes</p>
                  </div>
                  <Switch 
                    id="bid-updates" 
                    checked={notificationPreferences.bidUpdates}
                    onCheckedChange={() => handleNotificationChange('bidUpdates')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing">Marketing Communications</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive news, updates, and offers from us</p>
                  </div>
                  <Switch 
                    id="marketing" 
                    checked={notificationPreferences.marketing}
                    onCheckedChange={() => handleNotificationChange('marketing')}
                  />
                </div>
                
                <Button 
                  onClick={handleSaveNotificationSettings}
                  disabled={notificationLoading || initialLoading}
                >
                  {(notificationLoading || initialLoading) ? "Saving..." : "Save Preferences"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Change your password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input 
                      id="current-password" 
                      type="password" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input 
                      id="new-password" 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input 
                      id="confirm-password" 
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  {passwordError && (
                    <p className="text-sm text-red-500">{passwordError}</p>
                  )}
                  <Button 
                    type="submit" 
                    className="mt-2"
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Two Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="two-factor">Enable Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Protect your account with an additional verification step</p>
                  </div>
                  <Switch id="two-factor" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
};

export default Settings;
