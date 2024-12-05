import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/navbar";
import About from "./pages/About";
import Puppies from "./pages/Puppies";
import Family from "./pages/Family";
import Media from "./pages/Media";
import { AuthProvider } from "./auth/AuthContext";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <div>
        <Navbar />
        <main>
          <Routes>
            <Route path="/about" element={<About />} />
            <Route path="/puppies" element={<Puppies />} />
            <Route path="/family" element={<Family />} />
            <Route path="/media" element={<Media />} />
            <Route path="/" element={<Navigate to="/about" />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
};

export default App;
