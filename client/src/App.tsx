import { Routes, Route } from "react-router-dom";
import Layout from "./components/general/layout";

// Pages
import Home from "./pages/home";
import OurAdults from "./pages/our-adults";
import Nursery from "./pages/nursury";
import Live from "./pages/live";
import PastLitters from "./pages/past-litters";
import Gallery from "./pages/gallery";
import Admin from "./pages/admin";
import Litter from "./pages/litter";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/ouradults" element={<OurAdults />} />
        <Route path="/nursery" element={<Nursery />} />
        <Route path="/live" element={<Live />} />
        <Route path="/pastlitters" element={<PastLitters />} />
        <Route path="/gallery" element={<Gallery />} />

        <Route path="/litter/:id" element={<Litter />} />

        {/* NOTE: This route is not displayed on navbar */}
        {/* TODO: Protect route with auth */}
        <Route path="/admin" element={<Admin />} />
      </Route>
    </Routes>
  );
}

export default App;
