import React, { useState } from "react";

const NavBar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <button className="navbar-hamburger" onClick={toggleMenu}>
        ☰
      </button>
      <ul className={`navbar-links ${isOpen ? "navbar-links-mobile-open" : ""}`}>
        <li>
          <a href="#bio" className="navbar-link">
            Bio
          </a>
        </li>
        <li>
          <a href="#puppies" className="navbar-link">
            Puppies
          </a>
        </li>
        <li>
          <a href="#family" className="navbar-link">
            Family
          </a>
        </li>
        <li>
          <a href="#contact" className="navbar-link">
            Contact Me
          </a>
        </li>
        <li>
          <button
            className="live-button"
            onClick={() =>
              window.open(
                "https://www.youtube.com/embed/live_stream?channel=UCGoYuWwpBLy4oVw1_c7P06Q",
                "_blank"
              )
            }
          >
            Live
          </button>
        </li>
      </ul>
    </nav>
  );  
};

export default NavBar;
