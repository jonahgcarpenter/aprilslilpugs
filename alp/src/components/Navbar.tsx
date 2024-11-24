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
      <h1 className="navbar-header">April's Lil Pugs</h1>
      <ul className={`navbar-links ${isOpen ? "navbar-links-mobile-open" : ""}`}>
        <li>
          <a href="#bio" className="navbar-link">
            Bio
          </a>
        </li>
        <li>
          <a href="#media" className="navbar-link">
            Media
          </a>
        </li>
        <li>
          <a href="#contact-me" className="navbar-link">
            Contact Me
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
