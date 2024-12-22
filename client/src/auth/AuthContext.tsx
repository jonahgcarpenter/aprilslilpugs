/**
 * Authentication context provider.
 * Manages global authentication state and session management.
 */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../services/authService';
import type { UserData } from '../services/types';

interface AuthContextType {
  isLoggedIn: boolean;
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State management
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Session management functions
  const verifySession = async () => {
    try {
      const response = await auth.checkSession();
      if (response.status === 'success' && response.data?.authenticated) {
        setIsLoggedIn(true);
        setUserData(response.data.user || null);
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    } catch (err) {
      setIsLoggedIn(false);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await auth.login(email, password);
      if (response.status === 'success' && response.data?.authenticated) {
        setIsLoggedIn(true);
        setUserData(response.data.user || null);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err) {
      setIsLoggedIn(false);
      setUserData(null);
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await auth.logout();
    } finally {
      setIsLoggedIn(false);
      setUserData(null);
      setLoading(false);
    }
  };

  // Session check effect - simplified without auto-refresh
  useEffect(() => {
    verifySession();
  }, []); // Empty dependency array

  // Loading state handler
  if (loading && !isLoggedIn && !userData) {
    return null;
  }

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      userData,
      loading,
      error,
      login: handleLogin,
      logout: handleLogout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
