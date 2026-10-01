import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  signInWithGoogle: (customEmail?: string, customName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  switchAccount: (uid: string, email: string, name: string) => void;
  error: string | null;
  clearError: () => void;
}

const DEFAULT_USER: UserProfile = {
  uid: 'usr_avinash_7s7idi',
  email: 'avinashdasireddy@gmail.com',
  displayName: 'Avinash Dasireddy',
  photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
  emailVerified: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check saved session on mount
    try {
      const stored = localStorage.getItem('spendtrack_auth_user');
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // By default on initial load, auto-initialize authenticated session with the authorized account
        setUser(DEFAULT_USER);
        localStorage.setItem('spendtrack_auth_user', JSON.stringify(DEFAULT_USER));
      }
    } catch {
      setUser(DEFAULT_USER);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithGoogle = async (customEmail?: string, customName?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate real Google OAuth handshake delay
      await new Promise((resolve) => setTimeout(resolve, 350));
      
      const email = customEmail || DEFAULT_USER.email;
      const displayName = customName || (email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()));
      const uid = 'usr_' + btoa(email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);

      const newUser: UserProfile = {
        uid,
        email,
        displayName,
        photoURL: DEFAULT_USER.photoURL,
        emailVerified: true,
      };

      setUser(newUser);
      localStorage.setItem('spendtrack_auth_user', JSON.stringify(newUser));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google Sign-In failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const switchAccount = (uid: string, email: string, name: string) => {
    const newUser: UserProfile = {
      uid,
      email,
      displayName: name,
      emailVerified: true,
    };
    setUser(newUser);
    localStorage.setItem('spendtrack_auth_user', JSON.stringify(newUser));
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setUser(null);
      localStorage.removeItem('spendtrack_auth_user');
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signInWithGoogle,
        signOut,
        switchAccount,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
