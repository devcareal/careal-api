// PrivacyPolicy.jsx
import React from "react";
import "./Pages.css";

function PrivacyPolicy() {
  return (
    <div className="page-container" style={{ maxWidth: "800px", textAlign: "left" }}>
      <h2>Privacy Policy</h2>
      <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "2rem" }}>
        Last Updated: May 2026
      </p>

      <section style={{ marginBottom: "1.5rem" }}>
        <h3>1. Information We Collect</h3>
        <p>
          We collect your personal details (Name, Email Address) and your specific 
          vehicle identifiers (Plate Number and Chassis Number) when you create an 
          account on CAREAL.
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h3>2. How We Use Your Information</h3>
        <p>
          Your personal data is used strictly to establish authentication states, 
          secure your dashboard profile, and facilitate verification services for your 
          registered vehicles. We do not sell or lease your identity to third-party 
          ad networks.
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h3>3. Security of Data</h3>
        <p>
          All authentication operations pass through encrypted transit layers (HTTPS). 
          Your access tokens are handled securely to prevent credential leakage.
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h3>4. User Rights</h3>
        <p>
          You reserve the right to review, update, or clear your profile information 
          directly from your dashboard configuration panel at any moment.
        </p>
      </section>
    </div>
  );
}

export default PrivacyPolicy;