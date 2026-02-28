import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// ─── Context ───────────────────────────────────────────────────────────────────
import { AuthProvider } from "./context/AuthContext";

// ─── Route Guard ───────────────────────────────────────────────────────────────
import ProtectedRoute from "./components/ProtectedRoute";

// ─── Pages ─────────────────────────────────────────────────────────────────────
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

const App = () => {
  return (
    // ─── Wrap entire app with AuthProvider ────────────────────────────────────
    // This gives every page access to user, login, logout, register
    <AuthProvider>
      <BrowserRouter>
        {/* ─── Toast Notifications ──────────────────────────────────────────── */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1a1a26", // Match our dark theme
              color: "#ffffff",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              fontSize: "14px",
            },
          }}
        />

        {/* ─── App Routes ───────────────────────────────────────────────────── */}
        <Routes>
          {/* Public routes — accessible without login */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected route — redirects to /login if not authenticated */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Default redirect — send users to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
