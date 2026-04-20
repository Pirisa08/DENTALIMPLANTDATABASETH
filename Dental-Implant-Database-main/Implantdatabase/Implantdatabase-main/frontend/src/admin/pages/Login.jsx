import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authAPI } from "../../services/api";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || "/admin";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanIdentifier = identifier.trim();
    const cleanPassword = password;

    if (!cleanIdentifier || !cleanPassword) {
      setError("Please enter your email or username and password.");
      return;
    }

    try {
      setLoading(true);
      const result = await authAPI.login(cleanIdentifier, cleanPassword);

      if (!rememberMe) {
        sessionStorage.setItem("admin_user", JSON.stringify(result?.user || {}));
      }

      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.message || "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginPage">
      <div className="loginShell">
        <div className="loginBrandPanel">
          <div className="brandCenterWrap">
            <img
            src="/src/assets/logo_mfu.jpg"
            alt="MFU Logo"
            className="brandLogoImage"
            />
            <h1 className="brandTitleMain">MFU Dental</h1>
            <h2 className="brandTitleSub">IMPLANT DATABASE</h2>
            <p className="brandEyebrow">Mae Fah Luang University</p>
          </div>
        </div>

        <div className="loginCard">
          <div className="loginCardHeader">
            <p className="loginEyebrow">Administrative Access</p>
            <h2 className="loginHeading">Sign in</h2>
          </div>

          <form className="form" onSubmit={handleSubmit}>
            {error ? <div className="error">{error}</div> : null}

            <div className="fieldGroup">
              <label className="label" htmlFor="identifier">
                Email or Username
              </label>
              <input
                id="identifier"
                className="input"
                type="text"
                placeholder="Enter your email or username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="fieldGroup">
              <label className="label" htmlFor="password">
                Password
              </label>

              <div className="passwordWrap">
                <input
                  id="password"
                  className="input passwordInput"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="togglePasswordBtn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      className="passwordIcon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 3l18 18" />
                      <path d="M10.58 10.58A2 2 0 0012 16a2 2 0 001.42-.58" />
                      <path d="M9.88 4.24A10.94 10.94 0 0112 4c5 0 9.27 3.11 11 8-0.56 1.57-1.48 3-2.67 4.18" />
                      <path d="M6.61 6.61C4.62 8 3.16 9.86 2 12c1.73 4.89 6 8 10 8a10.7 10.7 0 004.24-.88" />
                    </svg>
                  ) : (
                    <svg
                      className="passwordIcon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M2 12s3.5-8 10-8 10 8 10 8-3.5 8-10 8-10-8-10-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="row">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Keep me signed in</span>
              </label>
            </div>

            <button className="signInBtn" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <p className="hint">MFU Dental Database System</p>
          </form>
        </div>
      </div>
    </div>
  );
}