import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import "../../styles/auth.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      );

      localStorage.setItem("token", res.data.token);

      navigate("/dashboard");

    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-header">
        <div className="logo-box">
          <span className="shield-icon">🛡️</span>
        </div>
        <h1>Dependency Monitor</h1>
        <p>Track vulnerabilities and version drift</p>
      </div>

      <div className="auth-card">
        <h2>Sign in to your account</h2>

        <div className="input-group">
          <label>Email address</label>
          <div className="input-field">
            <span className="input-icon">✉️</span>
            <input
              type="email"
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="input-group">
          <label>Password</label>
          <div className="input-field">
            <span className="input-icon">🔒</span>
            <input
              type="password"
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {/* 👇 Restored Section */}
        <div className="auth-options">
          <label className="remember">
            <input type="checkbox" />
            Remember me
          </label>

          <Link to="/forgot-password" className="forgot-link">
            Forgot password?
          </Link>
        </div>

        <button className="auth-button" onClick={handleLogin}>
          Sign in
        </button>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Sign up</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
