import { useState, useEffect } from 'react';

interface UserProfile {
  fullName: string;
  email: string;
  designation: string;
  country: string;
  mobile: string;
  birthday: string;
  avatar: string;
  createdAt: string;
}

interface BillingInfo {
  plan: string;
  billingCycle: string;
  activeUsers: number;
  currentBill: string;
  nextPayment: string;
  paymentDate: string;
  nextPaymentDate: string;
  usage: {
    [key: string]: {
      current: number;
      available: number;
    };
  };
}

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('User ID not found');

      const response = await fetch(`/api/settings/profile?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setProfile(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    try {
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('User ID not found');

      const response = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...profileData })
      });

      const data = await response.json();
      if (data.success) {
        setProfile(prev => prev ? { ...prev, ...profileData } : null);
        return true;
      } else {
        throw new Error(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { profile, loading, error, updateProfile, refetch: fetchProfile };
};

export const useBilling = () => {
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBilling = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('User ID not found');

      const response = await fetch(`/api/settings/billing?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setBilling(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch billing');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBilling();
  }, []);

  return { billing, loading, error, refetch: fetchBilling };
};

export const usePaymentMethods = () => {
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMethods = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('user_id');
      if (!userId) throw new Error('User ID not found');

      const response = await fetch(`/api/settings/payment-methods?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setMethods(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch payment methods');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  return { methods, loading, error, refetch: fetchMethods };
};
