import { createContext, useState, useContext } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loginStatus, setLoginStatus] = useState({ message: '', type: '' });

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
        const errorMessage = data.message || 'Login failed';
        setLoginStatus({ 
          message: errorMessage, 
          type: 'error' 
        });
        return { success: false, message: errorMessage };
      }
      
      if (data.status === 'success') {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setLoginStatus({ 
          message: data.message || 'Login successful!', 
          type: 'success' 
        });
        
        return { success: true };
      }
      
      throw new Error('Invalid response format');
      
    } catch (error) {
      const errorMessage = error.message || 'Network error - please try again';
      setLoginStatus({ 
        message: errorMessage, 
        type: 'error' 
      });
      return { success: false, message: errorMessage };
    }
  };

  const clearLoginStatus = () => {
    setLoginStatus({ message: '', type: '' });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout,
      loginStatus,
      setLoginStatus,  // Make sure this is included
      clearLoginStatus 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);