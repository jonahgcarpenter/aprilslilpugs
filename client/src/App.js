import {BrowserRouter, Routes, Route} from 'react-router-dom';

// CONTEXT
import { AuthProvider } from './context/AuthContext';
import { BreederContextProvider } from './context/BreederContext';
import { LiveProvider } from './context/LiveContext';
import { LitterProvider } from './context/LitterContext';
import { GrumbleProvider } from './context/GrumbleContext';
import { WaitlistProvider } from './context/WaitlistContext';
import { SettingsProvider } from './context/SettingsContext';

// PAGES
import Home from './pages/Home';
import BreederDashboard from './pages/BreederDashboard';
import Live from './pages/Live';
import MyGrumble from './pages/MyGrumble';
import Puppies from './pages/Puppies';

// COMPONENTS
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LitterUpdate from './components/LitterUpdate';

function App() {
  return (
    <AuthProvider>
      <WaitlistProvider>
        <GrumbleProvider>
          <LitterProvider>
            <BreederContextProvider>
              <LiveProvider>
                <SettingsProvider>
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
                            <Route path="/breeder-dashboard" element={
                              <ProtectedRoute>
                                <BreederDashboard />
                              </ProtectedRoute>
                            } />
                            <Route path="/breeder-dashboard/litters/new" element={
                              <ProtectedRoute>
                                <LitterUpdate />
                              </ProtectedRoute>
                            } />
                            <Route path="/breeder-dashboard/litters/:litterId" element={
                              <ProtectedRoute>
                                <LitterUpdate />
                              </ProtectedRoute>
                            } />
                          </Routes>
                        </div>
                      </BrowserRouter>
                    </div>
                </SettingsProvider>
              </LiveProvider>
            </BreederContextProvider>
          </LitterProvider>
        </GrumbleProvider>
      </WaitlistProvider>
    </AuthProvider>
  );
}

export default App;
