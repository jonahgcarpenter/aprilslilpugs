/**
 * Login Button Component
 * Handles user authentication UI including login form display
 * and logout functionality.
 */

import { useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthContext';
import LoginForm from './LoginForm';

const LoginButton = () => {
  const { isLoggedIn, userData, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Reset hover state when login status changes
  useEffect(() => {
    setIsHovered(false);
  }, [isLoggedIn]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // If logged in, show user info and logout button
  if (isLoggedIn && userData) {
    return (
      <button
        onClick={handleLogout}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        disabled={isLoggingOut}
        className="px-4 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
      >
        {isLoggingOut 
          ? 'Logging out...' 
          : (isHovered ? 'Sign Out' : `Hello, ${userData.firstName}!`)}
      </button>
    );
  }

  // If not logged in, show login button and form
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
      >
        Login
      </button>

      {isOpen && <LoginForm onSuccess={() => setIsOpen(false)} />}
    </div>
  );
};

export default LoginButton;
