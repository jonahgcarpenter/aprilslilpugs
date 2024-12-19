import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './auth/AuthContext';
// import ProtectedRoute from './auth/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load components
const Home = React.lazy(() => import('./pages/Home'));
const Puppies = React.lazy(() => import('./pages/Puppies'));

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/puppies" element={<Puppies />} />
            
            {/* Protected routes
            <Route path="/dashboard" element={
              <ProtectedRoute redirectTo="/login">
                <BreederDashboard />
              </ProtectedRoute>
            } /> */}
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
};

export default App;
