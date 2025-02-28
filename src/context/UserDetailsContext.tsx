import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserDetailsData {
  affiliate_id: string;
  name: string;
  bio: string;
  created_at: string;
  email: string;
  iframe_campaign_id: string;
  level: string;
  profile_pic: string;
  verified: boolean;
  anid: string;
  ip_address: string;
}

interface UserDetailsContextType {
  userDetailsData: UserDetailsData | null;
  loadingAffiliate: boolean;
  fetchUserDetailsData: () => Promise<void>;
  cacheBuster: number;
}

const UserDetailsContext = createContext<UserDetailsContextType | undefined>(undefined);

interface UserDetailsProviderProps {
  children: ReactNode;
}

export const UserDetailsProvider: React.FC<UserDetailsProviderProps> = ({ children }) => {
  const [userDetailsData, setUserDetailsData] = useState<UserDetailsData | null>(null);
  const [loadingAffiliate, setLoadingAffiliate] = useState(true);
  const [cacheBuster, setCacheBuster] = useState(Date.now()); 
  const { isAuthenticated } = useAuth();

  const fetchUserDetailsData = async () => {
    setLoadingAffiliate(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('https://affiliate-api.affworld.io/api/affiliates/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch affiliate data');
      }

      const data: UserDetailsData = await response.json();
      console.log("Context image updated:", data.profile_pic);
      setUserDetailsData(data);
      setCacheBuster(Date.now()); 
    } catch (error) {
      console.error('Error fetching affiliate data:', error);
      setUserDetailsData(null);
    } finally {
      setLoadingAffiliate(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserDetailsData();
    } else {
      setUserDetailsData(null);
      setLoadingAffiliate(false);
    }
  }, [isAuthenticated]);

  return (
    <UserDetailsContext.Provider value={{ userDetailsData, loadingAffiliate, fetchUserDetailsData, cacheBuster }}>
      {children}
    </UserDetailsContext.Provider>
  );
};

export const useUserDetails = () => {
  const context = useContext(UserDetailsContext);
  if (!context) {
    throw new Error('useUserDetails must be used within a UserDetailsProvider');
  }
  return context;
};