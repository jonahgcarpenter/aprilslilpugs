import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";

// PAGES
import Home from "./pages/Home";
import OurAdults from "./pages/OurAdults";
import Nursery from "./pages/Nursery";
import LivePuppyCam from "./pages/LivePuppyCam";
import PastLitters from "./pages/PastLitters";
import Gallery from "./pages/Gallery";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/live" element={<LivePuppyCam />} />
        <Route path="/our-adults" element={<OurAdults />} />
        <Route path="/nursery" element={<Nursery />} />
        <Route path="/past-litters" element={<PastLitters />} />
        <Route path="/gallery" element={<Gallery />} />
      </Routes>
    </Router>
  );
}

export default App;
