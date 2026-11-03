import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard" className="brand-title">OrderFlow AI</Link>
      </div>
      <div className="navbar-links">
        <Link to="/dashboard" className="nav-link">Home</Link>
        <span className="nav-divider">|</span>
        <Link to="/create-order" className="nav-link">Create Order</Link>
        <span className="nav-divider">|</span>
        <Link to="/orders" className="nav-link">Orders</Link>
        <span className="nav-divider">|</span>
        <button onClick={handleLogout} className="nav-logout-btn">Logout</button>
      </div>
    </nav>
  );
}

export default Navbar;
