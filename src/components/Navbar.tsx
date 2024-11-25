import React, { useState } from "react";

interface NavBarProps {
  onNavigate: (page: string) => void; // Prop for handling navigation
}

const NavBar: React.FC<NavBarProps> = ({ onNavigate }) => {
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
          <a
            href="#bio"
            className="navbar-link"
            onClick={() => onNavigate("main")}
          >
            Bio
          </a>
        </li>
        <li>
          <a
            href="#puppies"
            className="navbar-link"
            onClick={() => onNavigate("main")}
          >
            Puppies
          </a>
        </li>
        <li>
          <a
            href="#family"
            className="navbar-link"
            onClick={() => onNavigate("main")}
          >
            Family
          </a>
        </li>
        <li>
          <a
            href="#contact"
            className="navbar-link"
            onClick={() => onNavigate("main")}
          >
            Contact Me
          </a>
        </li>
        <li>
          <button
            onClick={() => onNavigate("live")}
            className="navbar-link live-button"
          >
            Live
            <span className="live-icon"></span>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
