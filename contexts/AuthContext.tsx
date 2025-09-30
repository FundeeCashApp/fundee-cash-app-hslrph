
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { supabase } from '@/app/integrations/supabase/client';
import { Alert } from 'react-native';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: SignupData) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  forgotPassword: (email: string) => Promise<boolean>;
}

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  country: string;
  referralCode?: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session with increased timeout handling
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          console.log('Found existing session for user:', session.user.id);
          await loadUserProfile(session.user.id);
        } else {
          console.log('No existing session found');
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      try {
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUserId: string) => {
    try {
      console.log('Loading user profile for:', authUserId);
      
      // Add timeout handling for database queries
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile load timeout')), 20000); // 20 second timeout
      });

      const queryPromise = supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUserId)
        .single();

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Error loading user profile:', error);
        setIsLoading(false);
        return;
      }

      if (data) {
        const userProfile: User = {
          id: data.id,
          authUserId: data.auth_user_id,
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          phoneNumber: data.phone_number,
          country: data.country,
          referralCode: data.referral_code,
          referredBy: data.referred_by,
          profilePhoto: data.profile_photo_url,
          walletBalance: data.wallet_balance,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
        console.log('User profile loaded successfully');
        setUser(userProfile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      if (error instanceof Error && error.message === 'Profile load timeout') {
        Alert.alert('Connection Error', 'Unable to load user profile. Please check your internet connection and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const generateReferralCode = (): string => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('Attempting login for:', email);
      
      // Add timeout handling for login
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Login timeout')), 25000); // 25 second timeout
      });

      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });

      const { data, error } = await Promise.race([loginPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Login error:', error);
        Alert.alert('Login Error', error.message);
        return false;
      }

      if (data.user) {
        console.log('Login successful for user:', data.user.id);
        await loadUserProfile(data.user.id);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error && error.message === 'Login timeout') {
        Alert.alert('Connection Error', 'Login request timed out. Please check your internet connection and try again.');
      } else {
        Alert.alert('Login Error', 'An unexpected error occurred');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: SignupData): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('Attempting signup for:', userData.email);
      
      // Add timeout handling for signup
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Signup timeout')), 30000); // 30 second timeout
      });

      // First, sign up with Supabase Auth
      const signupPromise = supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed'
        }
      });

      const { data: authData, error: authError } = await Promise.race([signupPromise, timeoutPromise]) as any;

      if (authError) {
        console.error('Signup error:', authError);
        Alert.alert('Signup Error', authError.message);
        return false;
      }

      if (!authData.user) {
        Alert.alert('Signup Error', 'Failed to create account');
        return false;
      }

      // Create user profile in our users table
      const referralCode = generateReferralCode();
      const profilePromise = supabase
        .from('users')
        .insert({
          auth_user_id: authData.user.id,
          first_name: userData.firstName,
          last_name: userData.lastName,
          email: userData.email,
          phone_number: userData.phoneNumber,
          country: userData.country,
          referral_code: referralCode,
          referred_by: userData.referralCode || null,
        });

      const { error: profileError } = await Promise.race([profilePromise, timeoutPromise]) as any;

      if (profileError) {
        console.error('Profile creation error:', profileError);
        Alert.alert('Signup Error', 'Failed to create user profile');
        return false;
      }

      // Show email verification alert
      Alert.alert(
        'Account Created!',
        'Please check your email and click the verification link to complete your registration.',
        [{ text: 'OK' }]
      );

      console.log('Signup successful for user:', authData.user.id);
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      if (error instanceof Error && error.message === 'Signup timeout') {
        Alert.alert('Connection Error', 'Signup request timed out. Please check your internet connection and try again.');
      } else {
        Alert.alert('Signup Error', 'An unexpected error occurred');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('Logging out user');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
      }
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    try {
      if (!user) return;
      
      console.log('Updating user profile');
      const updateData: any = {};
      if (userData.firstName) updateData.first_name = userData.firstName;
      if (userData.lastName) updateData.last_name = userData.lastName;
      if (userData.email) updateData.email = userData.email;
      if (userData.phoneNumber) updateData.phone_number = userData.phoneNumber;
      if (userData.profilePhoto) updateData.profile_photo_url = userData.profilePhoto;
      if (userData.walletBalance !== undefined) updateData.wallet_balance = userData.walletBalance;

      // Add timeout handling for update
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Update timeout')), 20000); // 20 second timeout
      });

      const updatePromise = supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id);

      const { error } = await Promise.race([updatePromise, timeoutPromise]) as any;

      if (error) {
        console.error('Update user error:', error);
        Alert.alert('Update Error', error.message);
        return;
      }

      // Update local user state
      setUser({ ...user, ...userData });
      console.log('User profile updated successfully');
    } catch (error) {
      console.error('Update user error:', error);
      if (error instanceof Error && error.message === 'Update timeout') {
        Alert.alert('Connection Error', 'Update request timed out. Please check your internet connection and try again.');
      } else {
        Alert.alert('Update Error', 'An unexpected error occurred');
      }
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      console.log('Requesting password reset for:', email);
      
      // Add timeout handling for password reset
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Password reset timeout')), 20000); // 20 second timeout
      });

      const resetPromise = supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://natively.dev/reset-password',
      });

      const { error } = await Promise.race([resetPromise, timeoutPromise]) as any;

      if (error) {
        console.error('Forgot password error:', error);
        Alert.alert('Reset Password Error', error.message);
        return false;
      }

      Alert.alert(
        'Reset Password',
        'Please check your email for password reset instructions.',
        [{ text: 'OK' }]
      );
      console.log('Password reset email sent successfully');
      return true;
    } catch (error) {
      console.error('Forgot password error:', error);
      if (error instanceof Error && error.message === 'Password reset timeout') {
        Alert.alert('Connection Error', 'Password reset request timed out. Please check your internet connection and try again.');
      } else {
        Alert.alert('Reset Password Error', 'An unexpected error occurred');
      }
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        updateUser,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
