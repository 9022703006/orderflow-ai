import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      alert("Please enter OTP");
      return;
    }

    if (!email) {
      alert("Email is missing. Please restart login or registration.");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          otp: otp.trim()
        })
      });

      const data = await response.json();

      if (response.ok && (data.success === "true" || data.message === "OTP verified successfully")) {
        if (data.token) {
          localStorage.setItem("authToken", data.token);
        }
        localStorage.setItem("userEmail", email);
        alert(data.message || "OTP verified successfully");
        navigate("/dashboard");
      } else {
        alert(data.message || "Invalid OTP");
        // Incorrect OTP must keep the user on the OTP verification page
      }
    } catch (error) {
      console.error(error);
      alert("Unable to connect to backend");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      alert("Email is missing. Please restart login or registration.");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email
        })
      });

      const data = await response.json();

      if (response.ok && (data.success === "true" || data.message === "OTP sent again")) {
        alert(data.message || "OTP sent again");
      } else {
        alert(data.message || "Failed to resend OTP");
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
            {email ? `Enter the OTP sent to ${email}` : "Enter the OTP sent to your email"}
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
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: "1rem", textAlign: "center" }}>
          <p>
            Didn't receive code?{" "}
            <button
              type="button"
              onClick={handleResendOtp}
              className="auth-link"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0
              }}
            >
              Resend OTP
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;
