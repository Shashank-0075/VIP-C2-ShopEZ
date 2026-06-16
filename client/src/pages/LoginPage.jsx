import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { LogIn } from "lucide-react";
import { api } from "../api.js";

export default function LoginPage({ onAuthSuccess }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const data = await api.login(email, password);
      // Save JWT token
      localStorage.setItem("shopez_token", data.token);
      
      // Update global context/state
      await onAuthSuccess();

      // Redirect depending on user type
      if (data.user.usertype === "Admin") {
        navigate("/admin");
      } else {
        // Decode redirect path safely
        navigate(decodeURIComponent(redirectTo));
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Invalid credentials. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="auth-container" style={{ animation: "fadeIn 0.5s ease" }}>
      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2.25rem", fontWeight: "800", color: "var(--primary)" }}>ShopEZ</h1>
          <p style={{ color: "var(--text-muted)", marginTop: "0.25rem" }}>Login to access your orders and cart.</p>
        </div>

        {errorMsg && (
          <div style={{
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            color: "var(--danger)",
            border: "1px solid var(--danger)",
            marginBottom: "1.25rem",
            fontSize: "0.9rem",
            fontWeight: "600"
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: "2rem" }}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "0.85rem", display: "flex", gap: "0.5rem" }}
            disabled={loading}
          >
            <LogIn size={18} />
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem" }}>
          <span style={{ color: "var(--text-muted)" }}>Don't have an account? </span>
          <Link to={`/register?redirect=${encodeURIComponent(redirectTo)}`} style={{ color: "var(--primary)", fontWeight: "600" }}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
