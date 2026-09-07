import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { authAPI } from "../../services/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState("admin123");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const clearAllTokens = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("admin_token");
    localStorage.removeItem("token");
    localStorage.removeItem("admin_user");

    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("admin_token");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("admin_user");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      clearAllTokens();

      const result = await authAPI.login(
        email.trim().toLowerCase(),
        password
      );

      if (!result?.token || !result?.user) {
        throw new Error("Login response is incomplete");
      }

      if (remember) {
        localStorage.setItem("auth_token", result.token);
        localStorage.setItem("admin_token", result.token);
        localStorage.setItem("token", result.token);
        localStorage.setItem("admin_user", JSON.stringify(result.user));
      } else {
        sessionStorage.setItem("auth_token", result.token);
        sessionStorage.setItem("admin_token", result.token);
        sessionStorage.setItem("token", result.token);
        sessionStorage.setItem("admin_user", JSON.stringify(result.user));
      }

      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginPage">
      <div className="loginCard">
        <h1 className="title">Login</h1>
        <p className="subtitle">Login to your admin account.</p>

        <form onSubmit={handleSubmit} className="form">
          <label className="label">E-mail Address</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@demo.com"
            required
          />

          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="admin123"
            required
          />

          {error ? <div className="error">{error}</div> : null}

          <div className="row">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>

            <button
              type="button"
              className="linkBtn"
              onClick={() => alert("Reset Password ยังไม่ได้เชื่อม")}
            >
              Reset Password?
            </button>
          </div>

          <button className="signInBtn" type="submit" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <div className="hint">
            Demo: <b>admin@demo.com</b> / <b>admin123</b>
          </div>
        </form>
      </div>
    </div>
  );
}