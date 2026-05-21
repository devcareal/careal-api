// Header.jsx
import React, { useState, useEffect } from "react";
import Navbar from "./Navbar.jsx";
import "./Header.css";
import logo from '../assets/images/Careal-logo-2.png'; 

function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Prevent background scrolling while mobile overlay menu is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    
    // Clean up on component unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <header className="header"> 
      <div className="header-brand">
        <img src={logo} alt="Careal logo" className="logo-img" />
        <h3>Careal</h3>
      </div>
      
      <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />

      <button 
        className={`menu-toggle ${isOpen ? "open" : ""}`} 
        onClick={toggleMenu} 
        aria-label="Toggle navigation"
      >
        <span className="hamburger-bar"></span>
        <span className="hamburger-bar"></span>
        <span className="hamburger-bar"></span>
      </button>
    </header>
  );
}

export default Header;