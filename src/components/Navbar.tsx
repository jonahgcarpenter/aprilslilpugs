import React, { useState, useEffect } from "react";

interface NavbarProps {
  onNavigate: (page: string) => void; // Prop for handling navigation
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest(".Navbar")) {
      closeMenu(); // Close the menu if the click is outside the navbar
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside); // Cleanup
    };
  }, [isOpen]);

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
            onClick={() => {
              onNavigate("main");
              closeMenu(); // Close the menu on link click
            }}
          >
            Bio
          </a>
        </li>
        <li>
          <a
            href="#puppies"
            className="Navbar-link"
            onClick={() => {
              onNavigate("main");
              closeMenu(); // Close the menu on link click
            }}
          >
            Puppies
          </a>
        </li>
        <li>
          <a
            href="#family"
            className="Navbar-link"
            onClick={() => {
              onNavigate("main");
              closeMenu(); // Close the menu on link click
            }}
          >
            Family
          </a>
        </li>
        <li>
          <a
            href="#contact"
            className="Navbar-link"
            onClick={() => {
              onNavigate("main");
              closeMenu(); // Close the menu on link click
            }}
          >
            Contact Me
          </a>
        </li>
        <li>
          <button
            onClick={() => {
              onNavigate("live");
              closeMenu(); // Close the menu on button click
            }}
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
