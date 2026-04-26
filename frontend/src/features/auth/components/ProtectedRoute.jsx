import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Wraps any route that requires authentication.
 * requiredRole — optional, pass "ADMIN" or "TECHNICIAN" to restrict by role.
 *
 * Flow:
 *  loading=true  → show spinner (AuthContext is still verifying token)
 *  no user       → redirect to /login
 *  wrong role    → redirect to their correct dashboard
 *  all good      → render the children
 */

// ── Helper — maps a role to its home dashboard ────────────────────────────────
const dashboardFor = (role) => {
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "TECHNICIAN") return "/technician/dashboard";
  return "/user/dashboard";
};

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-900" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Logged in but wrong role — bounce to their own dashboard
    return <Navigate to={dashboardFor(user.role)} replace />;
  }

  return children;
};

export default ProtectedRoute;
