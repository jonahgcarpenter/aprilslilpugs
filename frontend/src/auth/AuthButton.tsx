import { useState, useEffect } from 'react';
import Login from './Login';
import Logout from './Logout';

interface UserData {
  id: number;
  email: string;
}

const AuthButton = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log('Auth status response:', response);
      const data = await response.json();
      console.log('Auth status data:', data);
      
      setIsLoggedIn(data.authenticated);
      if (data.authenticated && data.user) {
        setUserData(data.user);
      } else {
        setUserData(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsLoggedIn(false);
      setUserData(null);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return isLoggedIn ? <Logout /> : <Login />;
};

export default AuthButton;
