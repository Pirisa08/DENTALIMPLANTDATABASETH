import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const getStoredToken = () => {
  const localToken =
    localStorage.getItem("auth_token") ||
    localStorage.getItem("admin_token") ||
    localStorage.getItem("token");

  const sessionToken =
    sessionStorage.getItem("auth_token") ||
    sessionStorage.getItem("admin_token") ||
    sessionStorage.getItem("token");

  return localToken || sessionToken || null;
};

const getStoredUser = () => {
  try {
    const raw =
      localStorage.getItem("admin_user") ||
      sessionStorage.getItem("admin_user");

    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn("Failed to parse admin_user:", error);
    return null;
  }
};

export default function ProtectedRoute({ adminOnly = false, children }) {
  const location = useLocation();
  const token = getStoredToken();
  const user = getStoredUser();

  if (!token) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (adminOnly && user?.role && user.role !== "admin") {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (children) return children;

  return <Outlet />;
}