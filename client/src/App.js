import {BrowserRouter, Routes, Route} from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BreederContextProvider } from './context/BreederContext';
import { LiveProvider } from './context/LiveContext';
import ProtectedRoute from './components/ProtectedRoute';

// PAGES
import Home from './pages/Home';
import BreederDashboard from './pages/BreederDashboard';
import Live from './pages/Live';
import MyGrumble from './pages/MyGrumble';
import Puppies from './pages/Puppies';

// COMPONENTS
import Navbar from './components/Navbar';

function App() {
  return (
    <AuthProvider>
        <BreederContextProvider>
          <LiveProvider>
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
                    <Route path="/mygrumble" element={<MyGrumble />} />
                    <Route path="/puppies" element={<Puppies />} />
                    <Route path="/live" element={<Live />} />
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
          </LiveProvider>
        </BreederContextProvider>
    </AuthProvider>
  );
}

export default App;
