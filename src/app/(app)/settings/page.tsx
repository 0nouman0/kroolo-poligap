"use client";

import React, { useState, useEffect } from "react";
import { Settings, User, CreditCard, Bell, Shield, Globe, Calendar, Phone, Mail, Trash2, Plus, ExternalLink, Loader2, TrendingUp, Users, FileText, Target, MessageSquare, Folder, Crown, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useUserProfile, useBilling, usePaymentMethods } from "@/hooks/useSettings";
import { toast } from "sonner";
import RazorpayPayButton from "@/components/razorpay/RazorpayPayButton";

export default function SettingsPage() {
  const { profile: userProfile, loading: profileLoading, error: profileError, updateProfile } = useUserProfile();
  const { billing: billingInfo, loading: billingLoading, error: billingError, refetch: refetchBilling } = useBilling();
  const { methods: paymentMethods, loading: methodsLoading, error: methodsError } = usePaymentMethods();
  const [uid, setUid] = useState<string | null>(null);
  
  const [paymentHistory, setPaymentHistory] = useState<Array<{
    invoice: string;
    date: string;
    status: string;
    amount: string;
    plan: string;
  }>>([]);
  const [saving, setSaving] = useState(false);

  const [localProfile, setLocalProfile] = useState(userProfile);

  useEffect(() => {
    if (userProfile) {
      setLocalProfile(userProfile);
    }
  }, [userProfile]);

  useEffect(() => {
    try {
      const id = localStorage.getItem('user_id');
      if (id) setUid(id);
    } catch {}
  }, []);

  const handleProfileChange = (key: string, value: any) => {
    setLocalProfile(prev => prev ? { ...prev, [key]: value } : null);
  };

  const handleSaveProfile = async () => {
    if (!localProfile) return;
    
    setSaving(true);
    try {
      const success = await updateProfile(localProfile);
      if (success) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('User ID not found');

      const response = await fetch(`/api/settings/profile?userId=${userId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Account deleted successfully");
        // Redirect to login or home page
        window.location.href = '/auth/signin';
      } else {
        throw new Error(data.error || 'Failed to delete account');
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    }
  };

  const handleUpgradePlan = () => {
    // Redirect to upgrade page or open modal
    console.log("Upgrading plan");
  };

  const handleBillingCycleChange = async (newCycle: string) => {
    if (!uid || !billingInfo) return;
    
    try {
      const response = await fetch('/api/settings/billing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: uid, 
          billingCycle: newCycle 
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Billing cycle changed to ${newCycle}`);
        refetchBilling();
      } else {
        throw new Error(data.error || 'Failed to update billing cycle');
      }
    } catch (error) {
      console.error("Error updating billing cycle:", error);
      toast.error("Failed to update billing cycle");
    }
  };

  const handleDowngradePlan = async () => {
    if (!uid) return;
    
    try {
      const response = await fetch('/api/settings/downgrade-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: uid })
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Plan downgraded to Starter");
        refetchBilling();
      } else {
        throw new Error(data.error || 'Failed to downgrade plan');
      }
    } catch (error) {
      console.error("Error downgrading plan:", error);
      toast.error("Failed to downgrade plan");
    }
  };

  const handleAddPaymentMethod = () => {
    // Open payment method modal
    console.log("Adding payment method");
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Settings className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Personal Info
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Plans
          </TabsTrigger>
        </TabsList>

        {/* Personal Info Tab */}
        <TabsContent value="profile" className="space-y-6">
          {profileLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading profile...</span>
            </div>
          ) : profileError ? (
            <div className="text-center py-12">
              <p className="text-red-500">Error: {profileError}</p>
            </div>
          ) : localProfile ? (
            <>
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                    <AvatarImage src={localProfile.avatar} alt={localProfile.fullName} />
                    <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                      {localProfile.fullName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground">{localProfile.fullName}</h2>
                    <p className="text-muted-foreground text-lg">{localProfile.email}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Update your photo and personal details.
                    </p>
                  </div>
                </div>
              </div>

          {/* Personal Information Form */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={localProfile?.fullName || ''}
                    onChange={(e) => handleProfileChange('fullName', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Input
                    id="designation"
                    value={localProfile?.designation || ''}
                    onChange={(e) => handleProfileChange('designation', e.target.value)}
                    placeholder="e.g. Product Manager"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={localProfile?.email || ''}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      className="pl-10"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select value={localProfile?.country || ''} onValueChange={(value) => handleProfileChange('country', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="United States">United States</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                      <SelectItem value="Australia">Australia</SelectItem>
                      <SelectItem value="Germany">Germany</SelectItem>
                      <SelectItem value="France">France</SelectItem>
                      <SelectItem value="India">India</SelectItem>
                      <SelectItem value="Japan">Japan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="mobile"
                      value={localProfile?.mobile || ''}
                      onChange={(e) => handleProfileChange('mobile', e.target.value)}
                      className="pl-10"
                      placeholder="Add Mobile"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthday">Birthday</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="birthday"
                      type="date"
                      value={localProfile?.birthday || ''}
                      onChange={(e) => handleProfileChange('birthday', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-sm text-muted-foreground mb-4">
                  User profile was created on {localProfile?.createdAt}
                </p>
                <Button onClick={handleSaveProfile} className="mr-3" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
                <Button variant="outline">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
              <CardDescription>
                Deleting your account is a permanent action and cannot be undone
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Delete Account</h4>
                <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                  Your Account will be deleted, which means no one will be able to use the platform. All data in this account will be immediately deleted and it can't be restored.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
            </>
          ) : null}
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          {billingLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading billing information...</span>
            </div>
          ) : billingError ? (
            <div className="text-center py-12">
              <p className="text-red-500">Error: {billingError}</p>
            </div>
          ) : billingInfo ? (
            <>
          {/* Plan Overview Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <Crown className="h-8 w-8 text-blue-500" />
                  <Badge variant="secondary" className="text-sm">{billingInfo?.plan}</Badge>
                </div>
                <h3 className="text-2xl font-bold mb-1">Current Plan</h3>
                <p className="text-muted-foreground text-sm mb-4">{billingInfo?.billingCycle} billing</p>
                <Button onClick={handleUpgradePlan} size="sm" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </Button>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10" />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <Users className="h-8 w-8 text-green-500" />
                  <span className="text-3xl font-bold">{billingInfo?.activeUsers}</span>
                </div>
                <h3 className="text-lg font-semibold mb-1">Active Users</h3>
                <p className="text-muted-foreground text-sm">Currently active</p>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10" />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="h-8 w-8 text-orange-500" />
                  <span className="text-lg font-semibold">{billingInfo?.nextPaymentDate}</span>
                </div>
                <h3 className="text-lg font-semibold mb-1">Next Payment</h3>
                <p className="text-muted-foreground text-sm">{billingInfo?.nextPayment}</p>
              </CardContent>
            </Card>
          </div>

          {/* Usage Statistics - Compact Visual Grid */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Usage Overview
              </CardTitle>
              <CardDescription>Current usage across all services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {billingInfo?.usage && Object.entries(billingInfo.usage).map(([key, usage]) => {
                  const percentage = (usage.current / usage.available) * 100;
                  const isAtLimit = usage.current >= usage.available;
                  
                  const getIcon = (key: string) => {
                    switch (key) {
                      case 'workspaces': return <Folder className="h-5 w-5" />;
                      case 'projects': return <Target className="h-5 w-5" />;
                      case 'goals': return <TrendingUp className="h-5 w-5" />;
                      case 'docs': return <FileText className="h-5 w-5" />;
                      case 'teams': return <Users className="h-5 w-5" />;
                      case 'channels': return <MessageSquare className="h-5 w-5" />;
                      default: return <CreditCard className="h-5 w-5" />;
                    }
                  };
                  
                  const getColor = (percentage: number) => {
                    if (percentage >= 90) return 'text-red-500';
                    if (percentage >= 70) return 'text-orange-500';
                    return 'text-green-500';
                  };
                  
                  return (
                    <div key={key} className="relative p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`${getColor(percentage)}`}>
                          {getIcon(key)}
                        </div>
                        {isAtLimit && <Badge variant="destructive" className="text-xs px-1 py-0">Full</Badge>}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">{key}</span>
                          <span className="text-xs text-muted-foreground">{usage.current}/{usage.available}</span>
                        </div>
                        
                        {/* Circular Progress */}
                        <div className="relative w-12 h-12 mx-auto">
                          <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-gray-200"
                              fill="none"
                              strokeWidth="3"
                              stroke="currentColor"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className={getColor(percentage)}
                              fill="none"
                              strokeWidth="3"
                              strokeDasharray={`${percentage}, 100`}
                              strokeLinecap="round"
                              stroke="currentColor"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-xs font-semibold ${getColor(percentage)}`}>
                              {Math.round(percentage)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Billing Summary - Visual Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Billing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">Current Bill</span>
                  </div>
                  <span className="font-semibold">{billingInfo?.currentBill}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Payment Date</span>
                  </div>
                  <span className="font-semibold">{billingInfo?.paymentDate}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">Next Payment</span>
                  </div>
                  <span className="font-semibold">{billingInfo?.nextPayment}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Due Date</span>
                  </div>
                  <span className="font-semibold">{billingInfo?.nextPaymentDate}</span>
                </div>
                <div className="pt-2 flex justify-end">
                  {uid && billingInfo && (
                    <RazorpayPayButton userId={uid} billingInfo={{ plan: billingInfo.plan, billingCycle: billingInfo.billingCycle }} label="Pay Now" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Method - Compact */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Payment Methods</CardTitle>
                <Button onClick={handleAddPaymentMethod} size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Method
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {paymentMethods.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No payment methods added</p>
                  <Button onClick={handleAddPaymentMethod} variant="outline" size="sm" className="mt-3">
                    Add your first method
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {paymentMethods.map((method, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center">
                          <CreditCard className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">•••• {method.last4}</p>
                          <p className="text-xs text-muted-foreground">{method.brand}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs">
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment History - Simplified */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {paymentHistory.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm mb-2">No payment history yet</p>
                  <p className="text-xs text-muted-foreground">Your billing activity will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentHistory.slice(0, 3).map((payment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          payment.status === 'paid' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="font-medium text-sm">{payment.invoice}</p>
                          <p className="text-xs text-muted-foreground">{payment.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{payment.amount}</p>
                        <Badge variant={payment.status === 'paid' ? 'default' : 'destructive'} className="text-xs">
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {paymentHistory.length > 3 && (
                    <Button variant="ghost" size="sm" className="w-full mt-2">
                      View {paymentHistory.length - 3} more transactions
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
            </>
          ) : null}
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
            <p className="text-muted-foreground mb-6">
              You are currently on <Badge variant="secondary">{billingInfo?.plan || 'Starter'} Plan</Badge>
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <Button
                variant={billingInfo?.billingCycle === 'Monthly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleBillingCycleChange('Monthly')}
              >
                Monthly billing
              </Button>
              <Button
                variant={billingInfo?.billingCycle === 'Yearly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleBillingCycleChange('Yearly')}
              >
                Annual billing
                <Badge variant="secondary" className="ml-2 text-xs">Save 20%</Badge>
              </Button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <Card className="relative overflow-hidden border-2 border-pink-500">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-pink-600/10" />
              <CardContent className="p-8 relative text-center">
                <h3 className="text-2xl font-bold text-pink-600 mb-2">STARTER</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">Free</span>
                </div>
                
                <div className="space-y-3 mb-8 text-left">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <span>1 Workspace</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <span>5 Projects</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <span>10 Documents</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <span>Basic Support</span>
                  </div>
                </div>
                
                {billingInfo?.plan === 'Starter' ? (
                  <Button className="w-full" variant="secondary" disabled>
                    CURRENT PLAN
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={handleDowngradePlan}
                  >
                    DOWNGRADE
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Plus Plan */}
            <Card className="relative overflow-hidden border-2 border-gray-800 scale-105">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white px-4 py-1 rounded-b-lg text-sm font-medium">
                ⭐ Most popular plan
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800/10 to-gray-900/10" />
              <CardContent className="p-8 relative text-center mt-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">PLUS</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">$15</span>
                  <span className="text-muted-foreground ml-1">per user per month</span>
                </div>
                
                <div className="space-y-3 mb-8 text-left">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                    <span>5 Workspaces</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                    <span>25 Projects</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                    <span>100 Documents</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                    <span>Priority Support</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
                    <span>Advanced Analytics</span>
                  </div>
                </div>
                
                {billingInfo?.plan === 'Plus' ? (
                  <Button className="w-full" variant="secondary" disabled>
                    CURRENT PLAN
                  </Button>
                ) : (
                  <div className="space-y-2">
                    {uid && (
                      <RazorpayPayButton 
                        userId={uid} 
                        billingInfo={{ plan: 'Plus', billingCycle: billingInfo?.billingCycle || 'Monthly' }} 
                        label="UPGRADE"
                      />
                    )}
                    <p className="text-xs text-muted-foreground">Free trial for 14 days</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Business Plan */}
            <Card className="relative overflow-hidden border-2 border-blue-500">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/10" />
              <CardContent className="p-8 relative text-center">
                <h3 className="text-2xl font-bold text-blue-600 mb-2">BUSINESS</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">$25</span>
                  <span className="text-muted-foreground ml-1">per user per month</span>
                </div>
                
                <div className="space-y-3 mb-8 text-left">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Unlimited Workspaces</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Unlimited Projects</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Unlimited Documents</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>24/7 Premium Support</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Custom Integrations</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Team Management</span>
                  </div>
                </div>
                
                {billingInfo?.plan === 'Business' ? (
                  <Button className="w-full" variant="secondary" disabled>
                    CURRENT PLAN
                  </Button>
                ) : (
                  uid && (
                    <RazorpayPayButton 
                      userId={uid} 
                      billingInfo={{ plan: 'Business', billingCycle: billingInfo?.billingCycle || 'Monthly' }} 
                      label="UPGRADE"
                    />
                  )
                )}
              </CardContent>
            </Card>
          </div>

          {/* Additional Info */}
          <div className="text-center mt-12 p-6 bg-muted/50 rounded-lg max-w-3xl mx-auto">
            <h4 className="font-semibold mb-2">All plans include:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
              <div>✓ SSL Security</div>
              <div>✓ Data Backup</div>
              <div>✓ API Access</div>
              <div>✓ Mobile Apps</div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
