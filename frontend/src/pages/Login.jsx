import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      alert("Please enter email");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/auth/login",{
        method: "POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          email: email
        })
      });
      const data = await response.json();

      if(response.ok){
         alert(data.message || "OTP sent successfully");
           navigate("/verify-otp", {
                state: { email: email }
            });
        } else {
            alert(data.message || "Login failed");
        }
    } catch (error) {
      console.error(error);
        console.error("BACKEND ERROR:", error);
  alert(error.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="app-badge">OrderFlow AI</div>
          <h2>Sign In</h2>
          <p className="auth-subtitle">Enter your email to receive an OTP</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            Send OTP
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="auth-link">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
