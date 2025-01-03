import {BrowserRouter, Routes, Route} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DogContextProvider } from './context/DogContext';
import { BreederContextProvider } from './context/BreederContext';
import ProtectedRoute from './components/ProtectedRoute';

// PAGES
import Home from './pages/Home';
import Puppies from './pages/Puppies';
import BreederDashboard from './pages/BreederDashboard';

// COMPONENTS
import Navbar from './components/Navbar';

function App() {
  return (
    <AuthProvider>
      <DogContextProvider>
        <BreederContextProvider>
          <div className="App min-h-screen">
            <div 
              className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
              style={{ backgroundImage: "url('/background.png')" }}
            />
            <BrowserRouter>
              <Navbar />
              <div className="container mx-auto px-4 max-w-7xl relative">
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
        </BreederContextProvider>
      </DogContextProvider>
    </AuthProvider>
  );
}

export default App;