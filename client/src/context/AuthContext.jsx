import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";

// ─── Create Context ────────────────────────────────────────────────────────────
// This is the "global store" for authentication state
// Any component in the app can access user data from here
const AuthContext = createContext();

// ─── Auth Provider ─────────────────────────────────────────────────────────────
// Wraps the entire app so all components can access auth state
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores logged-in user data
  const [loading, setLoading] = useState(true); // Prevents flash of wrong content

  // ─── Persist Login on Refresh ───────────────────────────────────────────────
  // When the app loads, check if a token exists in localStorage
  // If yes, fetch the user data and restore the session
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      API.get("/auth/me")
        .then((res) => setUser(res.data))
        .catch(() => localStorage.removeItem("token")) // Token invalid, clear it
        .finally(() => setLoading(false));
    } else {
      setLoading(false); // No token, stop loading
    }
  }, []);

  // ─── Register ───────────────────────────────────────────────────────────────
  // Sends registration data to backend, saves token, sets user
  const register = async (name, email, password) => {
    const res = await API.post("/auth/register", { name, email, password });
    localStorage.setItem("token", res.data.token); // Save token to browser
    setUser(res.data); // Update global user state
  };

  // ─── Login ──────────────────────────────────────────────────────────────────
  // Sends login credentials to backend, saves token, sets user
  const login = async (email, password) => {
    const res = await API.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.token); // Save token to browser
    setUser(res.data); // Update global user state
  };

  // ─── Logout ─────────────────────────────────────────────────────────────────
  // Clears token and user state
  const logout = () => {
    localStorage.removeItem("token"); // Remove token from browser
    setUser(null); // Clear user from global state
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Custom Hook ───────────────────────────────────────────────────────────────
// Shortcut to use auth context in any component: const { user } = useAuth()
export const useAuth = () => useContext(AuthContext);
