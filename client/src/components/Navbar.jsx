// Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ isOpen, setIsOpen }) => {
  // Gracefully dismiss menu overlay when user confirms route choice
  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <nav className={`navbar ${isOpen ? "navbar-active" : ""}`}>
      <ul className="navbar-links">
        <li><Link to="/" onClick={handleLinkClick}>Home</Link></li>
        <li><Link to="/services" onClick={handleLinkClick}>Services</Link></li>
        <li><Link to="/about" onClick={handleLinkClick}>About Us</Link></li>
        <li><Link to="/contact" onClick={handleLinkClick}>Contact Us</Link></li>
        <li><Link to="/login" className="auth-btn" onClick={handleLinkClick}>Login</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;