import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PaymentsDashboard.css";

const PaymentsDashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (!loggedInUser) {
      navigate("/login"); // No entry for unauthorized people!
    } else {
      setUser(JSON.parse(loggedInUser));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">Careal</div>
        <nav>
          <ul>
            <li className="active"><i className="fas fa-home"></i> Overview</li>
            <li><i className="fas fa-car"></i> My Vehicles</li>
            <li><i className="fas fa-credit-card"></i> Payments</li>
            <li><i className="fas fa-user"></i> Profile</li>
          </ul>
        </nav>
        <button onClick={handleLogout} className="logout-btn">
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="dashboard-header">
          <h2>Welcome back, {user?.username || "Chief"}!</h2>
          <div className="user-profile-top">
             <i className="fas fa-bell"></i>
             <div className="avatar"> {user?.username?.charAt(0) || "U"} </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Active Renewals</h3>
            <p className="stat-number">3</p>
          </div>
          <div className="stat-card">
            <h3>Pending Payments</h3>
            <p className="stat-number">₦45,000</p>
          </div>
          <div className="stat-card">
            <h3>Total Spent</h3>
            <p className="stat-number">₦120,500</p>
          </div>
        </div>

        {/* Recent Activity Table */}
        <section className="recent-activity">
          <h3>Recent Transactions</h3>
          <table className="activity-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Date</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Car License - ABC-123XY</td>
                <td>12 Feb 2026</td>
                <td><span className="status-badge success">Completed</span></td>
                <td>₦15,000</td>
              </tr>
              <tr>
                <td>Insurance Renewal</td>
                <td>10 Feb 2026</td>
                <td><span className="status-badge pending">Pending</span></td>
                <td>₦30,000</td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default PaymentsDashboard;