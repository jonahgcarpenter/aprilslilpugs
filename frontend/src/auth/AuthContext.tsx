import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../utils/api';

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkSession = async () => {
    try {
      const response = await api.get('/api/auth/session');
      if (response.data.authenticated && response.data.user) {
        setIsLoggedIn(true);
        setUserData(response.data.user);
      } else {
        setIsLoggedIn(false);
        setUserData(null);
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setIsLoggedIn(false);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const response = await api.post('/auth/login', { 
        email, 
        password 
      });
      
      if (response.status === 200) {
        setIsLoggedIn(true);
        setUserData(response.data.user);
        return;
      }
      throw new Error('Login failed');
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.response?.data?.error || 'Login failed';
      setError(message);
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setIsLoggedIn(false);
      setUserData(null);
    } catch (error) {
      setError('Failed to logout');
      throw error;
    }
  };

  useEffect(() => {
    checkSession();
    // Check session every minute
    const intervalId = setInterval(checkSession, 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Don't render children until initial session check is complete
  if (loading) {
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
