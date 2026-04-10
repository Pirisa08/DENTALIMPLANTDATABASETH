import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { authAPI } from "../../services/api.js";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const ok = email.trim().toLowerCase() === "admin@demo.com" && password === "admin123";
    if (!ok) {
      setError("Invalid email or password (ลอง admin@demo.com / admin123)");
      return;
    }

    const token = "mock_admin_token_" + Date.now();
    localStorage.setItem("admin_token", token);
    localStorage.setItem("admin_user", JSON.stringify({ name: "Min admin", email }));

    if (!remember) {
      // ถ้าไม่ remember ให้เก็บเฉพาะ session (ง่ายสุด: ลบตอนปิดแท็บจริงๆต้องทำเอง)
    }

    navigate("/admin/dashboard");
  };

  return (
    <div className="loginPage">
      <div className="loginCard">
        <h1 className="title">Login</h1>
        <p className="subtitle">Login to your account.</p>

        <form onSubmit={handleSubmit} className="form">
          <label className="label">E-mail Address</label>
          <input
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder=" admin@lamduan.mfu.ac.th"
            type="email"
            required
          />

          <label className="label">Password</label>
          <input
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="ilovedentalverymuch"
            type="password"
            required
          />

          {error && <div className="error">{error}</div>}

          <div className="row">
            <label className="checkbox">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Remember me
            </label>

            <button
              type="button"
              className="linkBtn"
              onClick={() => alert("Reset Password (demo)")}
            >
              Reset Password?
            </button>
          </div>

          <button className="signInBtn" type="submit">
            Sign In
          </button>

          <div className="hint">
            Demo: <b>admin@lamduan.mfu.ac.th</b> / <b>ilovedentalverymuch</b>
          </div>
        </form>
      </div>
    </div>
  );
}
