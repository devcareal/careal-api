// Header.jsx
import { useState } from "react";
import Navbar from "./Navbar.jsx";
import "./Header.css";
import logo from '../assets/images/Careal_logo.jpeg'; 

function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(prev => !prev);
  };

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