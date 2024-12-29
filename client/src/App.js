import {BrowserRouter, Routes, Route} from 'react-router-dom';

// PAGES
import Home from './pages/Home';
import Puppies from './pages/Puppies';

// COMPONENTS
import Navbar from './components/Navbar';

function App() {
  return (
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
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;