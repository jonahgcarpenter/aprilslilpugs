import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './auth/AuthContext';
// import ProtectedRoute from './auth/ProtectedRoute';
import Breeder from './components/Breeder';
import AboutUs from './components/AboutUs';

// Lazy load components
const Home = React.lazy(() => import('./pages/Home'));
const Puppies = React.lazy(() => import('./pages/Puppies'));

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/puppies" element={<Puppies />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/breeder" element={<Breeder />} />
            
            {/* Example protected routes - uncomment when needed
            <Route path="/admin/*" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/manage-puppies" element={
              <ProtectedRoute>
                <PuppyManager />
              </ProtectedRoute>
            } />
            */}
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
};

export default App;
