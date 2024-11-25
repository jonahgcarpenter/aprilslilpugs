import React, { useState } from "react";

interface NavbarProps {
  onNavigate: (page: string) => void; // Prop for handling navigation
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="Navbar">
      <button className="Navbar-hamburger" onClick={toggleMenu}>
        ☰
      </button>
      <ul className={`Navbar-links ${isOpen ? "Navbar-links-mobile-open" : ""}`}>
        <li>
          <a
            href="#bio"
            className="Navbar-link"
            onClick={() => onNavigate("main")}
          >
            Bio
          </a>
        </li>
        <li>
          <a
            href="#puppies"
            className="Navbar-link"
            onClick={() => onNavigate("main")}
          >
            Puppies
          </a>
        </li>
        <li>
          <a
            href="#family"
            className="Navbar-link"
            onClick={() => onNavigate("main")}
          >
            Family
          </a>
        </li>
        <li>
          <a
            href="#contact"
            className="Navbar-link"
            onClick={() => onNavigate("main")}
          >
            Contact Me
          </a>
        </li>
        <li>
          <button
            onClick={() => onNavigate("live")}
            className="Navbar-link live-button"
          >
            Live
            <span className="live-icon"></span>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
