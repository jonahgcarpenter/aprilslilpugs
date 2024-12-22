/**
 * Authentication context provider.
 * Manages global authentication state and session management.
 */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../utils/api';

// Type definitions
interface UserData {
  id: number;
  email: string;
  firstName: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Type guard for user data validation
function isValidUserData(data: any): data is UserData {
  return (
    data &&
    typeof data.id === 'number' &&
    typeof data.email === 'string' &&
    typeof data.firstName === 'string'
  );
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State management
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Session management functions
  const checkSession = async () => {
    try {
      const response = await api.get('/auth/session');
      
      if (response.data?.authenticated && response.data?.user) {
        setIsLoggedIn(true);
        setUserData(response.data.user);
        setError(null);
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    } catch (err) {
      setIsLoggedIn(false);
      setUserData(null);
      if (err instanceof Error && 
          err.message !== "No session token" && 
          err.message !== "Invalid or expired session") {
        setError(err.message);
      }
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await api.post('/auth/login', { 
        email, 
        password 
      });
      
      if (response.data?.success && isValidUserData(response.data.user)) {
        setIsLoggedIn(true);
        setUserData(response.data.user);
      } else {
        throw new Error('Invalid login response format');
      }
    } catch (err) {
      setIsLoggedIn(false);
      setUserData(null);
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await api.post('/auth/logout');
      setIsLoggedIn(false);
      setUserData(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Session check effect
  useEffect(() => {
    let isSubscribed = true;
    let intervalId: NodeJS.Timeout | null = null;
    
    const initialCheck = async () => {
      if (!isSubscribed) return;
      
      await checkSession();
      setLoading(false);

      if (isSubscribed && isLoggedIn) {
        intervalId = setInterval(checkSession, 5 * 60 * 1000);
      }
    };

    initialCheck();

    return () => {
      isSubscribed = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isLoggedIn]);

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
      login,
      logout
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
