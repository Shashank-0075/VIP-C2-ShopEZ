import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { api } from "../api.js";

export default function RegisterPage({ onAuthSuccess }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    usertype: "Customer"
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
    const { username, email, password, usertype } = formData;

    if (!username || !email || !password || !usertype) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const data = await api.register(username, email, password, usertype);
      
      // Save JWT token
      localStorage.setItem("shopez_token", data.token);

      // Refresh global context/state
      await onAuthSuccess();

      // Redirect based on user type
      if (data.user.usertype === "Admin") {
        navigate("/admin");
      } else {
        navigate(decodeURIComponent(redirectTo));
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to register. Email might be in use.");
    }
    setLoading(false);
  };

  return (
    <div className="auth-container" style={{ animation: "fadeIn 0.5s ease" }}>
      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2.25rem", fontWeight: "800", color: "var(--primary)" }}>ShopEZ</h1>
          <p style={{ color: "var(--text-muted)", marginTop: "0.25rem" }}>Register a new account.</p>
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
            <label htmlFor="username">Full Name</label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-control"
              placeholder="Your name"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

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

          <div className="form-group">
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

          <div className="form-group" style={{ marginBottom: "2rem" }}>
            <label htmlFor="usertype">User Role</label>
            <select
              id="usertype"
              name="usertype"
              className="form-control"
              value={formData.usertype}
              onChange={handleChange}
            >
              <option value="Customer">Customer / Shopper</option>
              <option value="Admin">Admin / Seller</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", padding: "0.85rem", display: "flex", gap: "0.5rem" }}
            disabled={loading}
          >
            <UserPlus size={18} />
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <div style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem" }}>
          <span style={{ color: "var(--text-muted)" }}>Already registered? </span>
          <Link to={`/login?redirect=${encodeURIComponent(redirectTo)}`} style={{ color: "var(--primary)", fontWeight: "600" }}>
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}
