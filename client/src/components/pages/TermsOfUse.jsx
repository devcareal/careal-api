// TermsOfUse.jsx
import React from "react";
import "./Pages.css";

function TermsOfUse() {
  return (
    <div className="page-container">
      <h2>Terms of Use</h2>

      <section style={{ marginBottom: "1.5rem" }}>
        <h3>1. Acceptance of Terms</h3>
        <p>
          By creating an account and accessing the CAREAL vehicle verification system, 
          you explicitly agree to comply with and be legally bound by these Terms of Use. 
          If you disagree with any part of these terms, you must immediately halt use of the platform.
        </p>
      </section>

      <section>
        <h3>2. Account Responsibility & Integrity</h3>
        <p>
          You are entirely responsible for maintaining the strict confidentiality of your 
          authentication credentials. Don't lie for me: you must provide accurate, current, 
          and legitimate information during signup, including valid Plate Numbers and Chassis Numbers. 
          Providing deliberately fraudulent vehicle data will result in immediate termination of your profile.
        </p>
      </section>

      <section>
        <h3>3. Permitted & Prohibited Use</h3>
        <p>
          This service is provided strictly to facilitate legitimate vehicle verification operations. 
          You explicitly agree not to abuse the system, execute automated scraping scripts against 
          the backend API endpoints, or probe the infrastructure for security vulnerabilities.
        </p>
      </section>

      <section>
        <h3>4. Limitation of Liability</h3>
        <p>
          The matter is simple: CAREAL provides verification tools on an "as-is" and "as-available" 
          basis. We do not guarantee uninterrupted platform uptime or zero latency in processing data layers, 
          and we accept no liability for any administrative or operational decisions made based on 
          the real-time verification metrics displayed.
        </p>
      </section>

      <section>
        <h3>5. Modifications to Service</h3>
        <p>
          We reserve the right to optimize, update, or temporarily adjust service parameters or 
          access policies to protect backend stability. Continued integration with the platform 
          following any core layout changes constitutes complete acceptance of the updated parameters.
        </p>
      </section>
    </div>
  );
}

export default TermsOfUse;