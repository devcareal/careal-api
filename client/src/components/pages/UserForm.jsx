import React, { useState } from "react";
import axios from "axios";
import "./Pages.css";

function UserForm() {
  const [formData, setFormData] = useState({
    plateNumber: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for internet connection first
    if (!navigator.onLine) {
      setResult({ status: "ERROR", message: "No internet connection. Please check your network and try again." });
      return; 
    }
    setResult(null);
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:4000/api/verify", formData);
      setResult(response.data);
    } catch (error) {
      console.error("Error verifying plate number:", error);
      setResult({ status: "ERROR", message: "Failed to verify plate number. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h2>Enter Your Car Information</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="plateNumber">Car Plate Number:</label>
        <input
          type="text"
          id="plateNumber"
          name="plateNumber"
          value={formData.plateNumber}
          onChange={handleChange}
          required
        />

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Verifying..." : "Submit"}
        </button>
      </form>

      {result && (
        <div className="response-message">
          <p><strong>Status:</strong> {result.message}</p>
          {result.status === "VALID" && (
            <>
              <p><strong>Make:</strong> {result.make}</p>
              <p><strong>Color:</strong> {result.color}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default UserForm;