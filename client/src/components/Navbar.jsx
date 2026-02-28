import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, SplitSquareHorizontal, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

// ─── Navbar ───────────────────────────────────────────────────────────────────
// Top navigation bar shown on all protected pages
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // ─── Handle Logout ───────────────────────────────────────────────────────────
  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-800 border-b border-white/10 px-6 py-4"
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* ─── Logo ─────────────────────────────────────────────────────────── */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <SplitSquareHorizontal size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-white text-lg">
            SplitEase
          </span>
        </Link>

        {/* ─── Nav Links ────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2">
          <Link
            to="/groups"
            className="flex items-center gap-2 text-white/60 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-all text-sm"
          >
            <Users size={16} />
            Groups
          </Link>
        </div>

        {/* ─── User Info + Logout ───────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          {/* User avatar with first letter of name */}
          <div className="w-8 h-8 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center">
            <span className="text-primary-400 text-xs font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>

          <span className="text-white/60 text-sm hidden sm:block">
            {user?.name}
          </span>

          {/* Logout button */}
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 text-white/40 hover:text-red-400 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-all text-sm"
          >
            <LogOut size={16} />
            <span className="hidden sm:block">Logout</span>
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
