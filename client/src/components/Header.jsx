import React from "react";
import Navbar from "./Navbar.jsx";
import "./Header.css";
import logo from '../assets/images/Careal-logo-2.png'; 

function Header() {
  return (
    <header className="header"> 
        <img src={logo} alt="Careal logo" className="logo-img" />
        <h3>Careal</h3>
        <Navbar />
    </header>
  );
}

export default Header;