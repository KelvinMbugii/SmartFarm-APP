import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const roleHomePath = (role) => {
  switch (String(role || "").toLowerCase()) {
    case "farmer":
      return "/farmer-dashboard";
    case "agripreneur":
      return "/agripreneur-dashboard";
    case "officer":
      return "/officer-dashboard";
    case "admin":
      return "/IT-dashboard";
    default:
      return "/dashboard";
  }
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const role = String(user?.role || "").toLowerCase();
    const allowed = allowedRoles.map((r) => String(r).toLowerCase());
    if (!allowed.includes(role)) {
      return <Navigate to={roleHomePath(role)} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
