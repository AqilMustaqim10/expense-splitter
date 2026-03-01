import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import usePageTitle from "../hooks/usePageTitle";

const Login = () => {
  usePageTitle("Sign In");
  const navigate = useNavigate();
  const { login } = useAuth();

  // ─── Form State ─────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(""); // Inline error message
  const [isLoading, setIsLoading] = useState(false); // Disable button while loading

  // ─── Handle Input Change ────────────────────────────────────────────────────
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear error when user starts typing
  };

  // ─── Handle Form Submit ─────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success("Welcome back! 👋");
      navigate("/dashboard"); // Redirect to dashboard on success
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // ─── Page Wrapper with fade-in animation ──────────────────────────────────
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-dark-900 flex items-center justify-center p-4"
    >
      {/* ─── Card with slide-up animation ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="w-full max-w-md bg-dark-800 border border-white/10 rounded-2xl p-8 shadow-2xl"
      >
        {/* ─── Header ───────────────────────────────────────────────────────── */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            Welcome back
          </h1>
          <p className="text-white/50 text-sm">
            Sign in to your account to continue
          </p>
        </div>

        {/* ─── Error Message ─────────────────────────────────────────────────── */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl p-3 mb-6"
          >
            <AlertCircle size={16} />
            {error}
          </motion.div>
        )}

        {/* ─── Form ─────────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-white/70 text-sm mb-2">Email</label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full bg-dark-700 border border-white/10 text-white placeholder-white/20 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-white/70 text-sm mb-2">Password</label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
              />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full bg-dark-700 border border-white/10 text-white placeholder-white/20 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition-colors mt-2"
          >
            {isLoading ? (
              // Loading spinner inside button
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={16} />
                Sign In
              </>
            )}
          </motion.button>
        </form>

        {/* ─── Footer Link ──────────────────────────────────────────────────── */}
        <p className="text-center text-white/40 text-sm mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-primary-500 hover:text-primary-400 font-medium transition-colors"
          >
            Create one
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Login;
