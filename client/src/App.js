import { BrowserRouter, Routes, Route } from "react-router-dom";

// CONTEXT
import { AuthProvider } from "./context/AuthContext";
import { BreederProvider } from "./context/BreederContext";
import { LitterProvider } from "./context/LitterContext";
import { GrumbleProvider } from "./context/GrumbleContext";
import { WaitlistProvider } from "./context/WaitlistContext";
import { SettingsProvider } from "./context/SettingsContext";
import { DownDetectorProvider } from "./context/DownDetector";

// PAGES
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Live from "./pages/Live";
import OurAdults from "./pages/OurAdults";
import Nursery from "./pages/Nursery";
import PastLitters from "./pages/PastLitters";
import Gallery from "./pages/Gallery";

// COMPONENTS
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Navbar from "./components/Misc/Navbar";
import LitterCreate from "./components/Litter/LitterCreate";
import LitterUpdate from "./components/Litter/LitterUpdate";

function App() {
  return (
    <AuthProvider>
      <BreederProvider>
        <SettingsProvider>
          <LitterProvider>
            <GrumbleProvider>
              <WaitlistProvider>
                <DownDetectorProvider>
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
                          <Route path="/ouradults" element={<OurAdults />} />
                          <Route path="/nursery" element={<Nursery />} />
                          <Route path="/live" element={<Live />} />
                          <Route
                            path="/past-litters"
                            element={<PastLitters />}
                          />
                          <Route path="/gallery" element={<Gallery />} />
                          <Route
                            path="/admin"
                            element={
                              <ProtectedRoute>
                                <Admin />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/breeder/litter/create"
                            element={
                              <ProtectedRoute>
                                <LitterCreate />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/breeder/litter/update/:id"
                            element={
                              <ProtectedRoute>
                                <LitterUpdate />
                              </ProtectedRoute>
                            }
                          />
                        </Routes>
                      </div>
                    </BrowserRouter>
                  </div>
                </DownDetectorProvider>
              </WaitlistProvider>
            </GrumbleProvider>
          </LitterProvider>
        </SettingsProvider>
      </BreederProvider>
    </AuthProvider>
  );
}

export default App;
