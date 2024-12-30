import { createContext, useState, useContext, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loginStatus, setLoginStatus] = useState({ message: '', type: '' });
  const [sessionTimeout, setSessionTimeout] = useState(null);

  // Check token validity on mount
  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiresIn = payload.exp * 1000 - Date.now();
        
        if (expiresIn <= 0) {
          // Token has expired
          logout();
        } else {
          // Ensure user data is set if token is valid
          const savedUser = localStorage.getItem('user');
          if (savedUser && !user) {
            setUser(JSON.parse(savedUser));
          }

          // Set timeout for token expiration
          const timeoutId = setTimeout(() => {
            logout();
            setLoginStatus({
              message: 'Session expired. Please login again.',
              type: 'error'
            });
          }, expiresIn);
          
          setSessionTimeout(timeoutId);
        }
      } catch (error) {
        console.error('Token validation error:', error);
        logout();
      }
    }
    
    return () => {
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
      }
    };
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/breeders/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setLoginStatus({
        message: 'Login successful!',
        type: 'success'
      });
      
      return { success: true };
      
    } catch (error) {
      setLoginStatus({
        message: error.message,
        type: 'error'
      });
      return { success: false, message: error.message };
    }
  };

  const clearLoginStatus = () => {
    setLoginStatus({ message: '', type: '' });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout,
      loginStatus,
      setLoginStatus,
      clearLoginStatus 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);