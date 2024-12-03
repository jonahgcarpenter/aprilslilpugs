import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/navbar.css';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest(".Navbar")) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="Navbar">
      <div className="Navbar-container">
        <button className="hamburger-menu" onClick={toggleMenu} aria-label="Menu">
          <span className={`hamburger-line ${isOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isOpen ? 'open' : ''}`}></span>
        </button>
        <ul className={`Navbar-links ${isOpen ? "Navbar-links-mobile-open" : ""}`}>
          <li>
            <Link to="/about" className="Navbar-link" onClick={() => setIsOpen(false)}>
              About Us
            </Link>
          </li>
          <li>
            <Link to="/puppies" className="Navbar-link" onClick={() => setIsOpen(false)}>
              Puppies
            </Link>
          </li>
          <li>
            <Link to="/family" className="Navbar-link" onClick={() => setIsOpen(false)}>
              My Family
            </Link>
          </li>
          <li>
            <Link to="/pictures" className="Navbar-link" onClick={() => setIsOpen(false)}>
              Pictures
            </Link>
          </li>
          <li>
            <Link to="/login" className="Navbar-link" onClick={() => setIsOpen(false)}>
              {isLoggedIn ? "Edit" : "Login"}
            </Link>
          </li>
        </ul>
        <div className="Navbar-right">
          {isLoggedIn && (
            <button 
              onClick={handleLogout}
              className="Navbar-link logout-button"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
