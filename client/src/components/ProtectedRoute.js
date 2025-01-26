import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute Component
 * Wrapper component that handles authentication-based routing
 * Redirects to home page if user is not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  
  if (!token) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;