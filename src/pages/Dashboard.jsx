import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <Navbar />

      <main className="content-container">
        <section className="welcome-banner">
          <h1>Welcome to OrderFlow AI</h1>
          <p>AI-powered order automation.</p>
        </section>

        <section className="stats-grid">
          <div className="card stat-card">
            <h3>Total Orders</h3>
            <p className="stat-number">10</p>
            <span className="stat-caption">All time orders</span>
          </div>

          <div className="card stat-card stat-completed">
            <h3>Completed</h3>
            <p className="stat-number">8</p>
            <span className="stat-caption">Fulfilled successfully</span>
          </div>

          <div className="card stat-card stat-pending">
            <h3>Pending</h3>
            <p className="stat-number">2</p>
            <span className="stat-caption">Requires action</span>
          </div>
        </section>

        <section className="action-section">
          <button className="btn btn-primary btn-large" onClick={() => navigate("/create-order")}>
            Create Order
          </button>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
