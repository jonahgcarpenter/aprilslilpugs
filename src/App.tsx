import React from "react";
import NavBar from "./components/NavBar";
import Bio from "./components/Bio";
import Puppies from "./components/Puppies";
import Family from "./components/Family";
import ContactMe from "./components/ContactMe";

const App: React.FC = () => {
  return (
    <div>
      <NavBar />
      <main>
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
      </main>
    </div>
  );
};

export default App;
