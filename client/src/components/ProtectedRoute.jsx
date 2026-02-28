import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ─── Protected Route ───────────────────────────────────────────────────────────
// Wraps pages that require login
// If user is not logged in, redirect them to /login automatically
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Wait for auth check to complete before deciding
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        {/* Simple animated loading pulse */}
        <div className="w-10 h-10 rounded-full bg-primary-500 animate-pulse" />
      </div>
    );
  }

  // If no user, redirect to login page
  if (!user) return <Navigate to="/login" replace />;

  // User is logged in, show the page
  return children;
};

export default ProtectedRoute;
