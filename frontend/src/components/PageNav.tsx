import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const PageNav: React.FC = () => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isAdmin: false
  });

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/check-auth', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) throw new Error('Auth check failed');
      
      const data = await response.json();
      console.log('Auth response:', data); // Debug log
      
      setAuthState({
        isAuthenticated: Boolean(data.authenticated),
        isAdmin: Boolean(data.isAdmin)
      });
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  useEffect(() => {
    checkAuth();
    const interval = setInterval(checkAuth, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const buttonText = authState.isAdmin 
    ? "Admin" 
    : authState.isAuthenticated 
    ? "Dashboard" 
    : "Login";

  console.log('Current auth state:', authState); // Debug log
  console.log('Button text:', buttonText); // Debug log

  return (
    <div className="flex justify-center space-x-4 mt-4">
      <Link to={authState.isAuthenticated ? "/admin" : "/login"}>
        <button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-4 py-1.5 text-sm rounded-full font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
          {buttonText}
        </button>
      </Link>
      <Link to="/contact">
        <button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-4 py-1.5 text-sm rounded-full font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
          Contact Me
        </button>
      </Link>
      <Link to="/waitlist">
        <button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-4 py-1.5 text-sm rounded-full font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
          Join Waitlist
        </button>
      </Link>
    </div>
  );
};

export default PageNav;
