import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css"; 
import carGif from "../../assets/images/car-b5.gif"; 
import Signup from "./Signup";

function Home() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/Signup"); 
  };

  return (
    <section className="home">
      <div className="background">
        <img
          src={carGif}
          alt="Moving car animation"
          className="background-gif"
        />
        <div className="overlay"></div>
      </div>

      <div className="home-content">
        <h1>Welcome to Careal</h1>
        <p>
          Check your car registration status, renew documents, and manage all
          your vehicle paperwork in one simple platform.
        </p>
        <button onClick={handleGetStarted} className="get-started-btn">
          Get Started
        </button>
      </div>
    </section>
  );
}

export default Home;
