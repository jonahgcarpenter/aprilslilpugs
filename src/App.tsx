import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Bio from "./components/Bio";
import Puppies from "./components/Puppies";
import Family from "./components/Family";
import ContactMe from "./components/ContactMe";
import Live from "./components/Live";

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>("main"); // Track the current page ("main" or "live")

  // Handler to navigate between pages
  const handleNavigation = (page: string) => {
    setCurrentPage(page);
  };

  return (
    <div>
      {/* Pass the handler to Navbar */}
      <Navbar onNavigate={handleNavigation} />
      <main>
        {currentPage === "live" ? (
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
        )}
      </main>
    </div>
  );
};

export default App;
