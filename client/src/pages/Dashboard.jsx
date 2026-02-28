import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

// ─── Dashboard (Placeholder) ───────────────────────────────────────────────────
// We'll fully build this in Phase 4
// For now just confirms the user is logged in and auth is working
const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-dark-900 flex items-center justify-center"
    >
      <div className="text-center">
        <h1 className="text-3xl font-display font-bold text-white mb-2">
          Welcome, {user?.name}! 👋
        </h1>
        <p className="text-white/50 mb-6">Dashboard coming soon...</p>
        <button
          onClick={logout}
          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-6 py-2 rounded-xl transition-colors"
        >
          Logout
        </button>
      </div>
    </motion.div>
  );
};

export default Dashboard;
