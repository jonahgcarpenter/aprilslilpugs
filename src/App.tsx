import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Bio from "./components/Bio";
import Puppies from "./components/Puppies";
import Family from "./components/Family";
import ContactMe from "./components/ContactMe";
import Live from "./components/Live";
import AdminPage from './components/AdminPage';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>("main");

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <Navbar onNavigate={handleNavigation} />
      <main>
        <Routes>
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/" element={
            currentPage === "live" ? (
              <section id="live">
                <Live />
              </section>
            ) : (
              <>
                <section id="bio">
                  <Bio />
                </section>
                <section id="puppies">
                  <Puppies />
                </section>
                <section id="family">
                  <Family />
                </section>
                <section id="contact">
                  <ContactMe />
                </section>
              </>
            )
          } />
        </Routes>
      </main>
    </div>
  );
};

export default App;
