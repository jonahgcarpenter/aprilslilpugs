import React from "react";
import NavBar from "./components/NavBar";
import Bio from "./components/Bio";
import Media from "./components/Media";
import ContactMe from "./components/ContactMe";

const App: React.FC = () => {
  return (
    <div>
      <NavBar />
      <Bio />
      <Media />
      <ContactMe />
    </div>
  );
};

export default App;
