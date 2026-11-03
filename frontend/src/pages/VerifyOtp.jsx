import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function VerifyOtp() {
  const [otp, setOtp] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp) {
      alert("Please enter OTP");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8080/api/auth/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: email,
            otp: otp
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(data.message || "OTP verified successfully");
        navigate("/dashboard");
      } else {
        alert(data.message || "Invalid OTP");
      }
    } catch (error) {
      console.error(error);
      alert("Unable to connect to backend");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <div className="auth-header">
          <div className="app-badge">OrderFlow AI</div>

          <h2>Verify OTP</h2>

          <p className="auth-subtitle">
            Enter the OTP sent to your email
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">

          <div className="form-group">
            <label htmlFor="otp">OTP</label>

            <input
              id="otp"
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
          >
            Verify OTP
          </button>

        </form>

      </div>
    </div>
  );
}

export default VerifyOtp;