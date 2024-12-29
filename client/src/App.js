import {BrowserRouter, Routes, Route} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// PAGES
import Home from './pages/Home';
import Puppies from './pages/Puppies';
import BreederDashboard from './pages/BreederDashboard';  // Add this import

// COMPONENTS
import Navbar from './components/Navbar';

function App() {
  return (
    <AuthProvider>
      <div 
        className="App min-h-screen bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/background.png')" }}
      >
        <BrowserRouter>
          <Navbar />
          <div className="container mx-auto px-4 max-w-7xl">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/puppies" element={<Puppies />} />
              <Route 
                path="/breeder-dashboard" 
                element={
                  <ProtectedRoute>
                    <BreederDashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;