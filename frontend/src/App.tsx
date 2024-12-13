import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import Puppies from './pages/Puppies';
import Media from './pages/Media';

const App: React.FC = () => {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/puppies" element={<Puppies />} />
          <Route path="/media" element={<Media />} />
          {/* Add more routes here as needed */}
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
