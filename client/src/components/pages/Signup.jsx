// Signup.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Pages.css";
import "./Signup.css";


// ✅ Two-fold deployment strategy:
//    Single host (now):     falls back to "/api" — Vite proxy (dev) / Express (prod)
//    Separate host (later): set VITE_API_BASE in Render env — no code changes needed
const API_BASE = import.meta.env.VITE_API_BASE || "/api";

function Signup() {
  const [formData, setFormData] = useState({
    firstName:   "",
    otherName:   "",
    lastName:    "",
    plateNumber: "",
    email:       "",
    password:    "",
  });
  const [error,    setError]    = useState("");
  const navigate                = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(
        `${API_BASE}/auth/signup`,
        formData,
        { withCredentials: true }
      );
      // Save token — same key used across Dashboard, Services, AddVehicle
      if (res.data.token) {
        localStorage.setItem("careal_token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
      navigate("/dashboard");
    } catch (err) {
      console.error("Signup error:", err.response?.data || err.message);
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="page-container">
      <h2>Create Account</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>First Name</label>
        <input name="firstName" onChange={handleChange} required />
        <label>Other Name</label>
        <input name="otherName" onChange={handleChange} />
        <label>Last Name</label>
        <input name="lastName" onChange={handleChange} required />
        <label>Plate Number</label>
        <input name="plateNumber" onChange={handleChange} required />
        <label>Email</label>
        <input type="email" name="email" onChange={handleChange} required />
        <label>Password</label>
        <input type="password" name="password" onChange={handleChange} required />
        <button className="submit-btn">Create Account</button>
      </form>
      <p>
        Already have an account?{" "}
        <span className="link" onClick={() => navigate("/login")}>
          Login
        </span>
      </p>
    </div>
  );
}

export default Signup;