import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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

const queryClient = new QueryClient();
//TODO:
// NOT FOUND PAGE

// BUG:
// background image not covering entire page for mobile leaving white space

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App relative min-h-screen">
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
              <Route path="/past-litters" element={<PastLitters />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <Admin />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </BrowserRouter>
      </div>
    </QueryClientProvider>
  );
}

export default App;
