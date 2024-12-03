import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { getAuth } from 'firebase/auth';
import Navbar from "./components/Navbar";
import About from "./pages/About";
import Puppies from "./pages/Puppies";
import Family from "./pages/Family";
import AdminPage from './pages/AdminPage';
import Login from "./pages/Login";
import Pictures from "./pages/Pictures";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const auth = getAuth();
  if (!auth.currentUser) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <div>
      <Navbar />
      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          } />
          <Route path="/about" element={<About />} />
          <Route path="/puppies" element={<Puppies />} />
          <Route path="/family" element={<Family />} />
          <Route path="/pictures" element={<Pictures />} />
          <Route path="/" element={<Navigate to="/about" />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
