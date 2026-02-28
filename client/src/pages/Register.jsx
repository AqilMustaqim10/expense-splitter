import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, UserPlus, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  // ─── Form State ─────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ─── Handle Input Change ────────────────────────────────────────────────────
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  // ─── Handle Form Submit ─────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await register(formData.name, formData.email, formData.password);
      toast.success("Account created! Welcome 🎉");
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-dark-900 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="w-full max-w-md bg-dark-800 border border-white/10 rounded-2xl p-8 shadow-2xl"
      >
        {/* ─── Header ───────────────────────────────────────────────────────── */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            Create account
          </h1>
          <p className="text-white/50 text-sm">
            Start splitting expenses with your group
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
          {/* Name Field */}
          <div>
            <label className="block text-white/70 text-sm mb-2">
              Full Name
            </label>
            <div className="relative">
              <User
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
              />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                className="w-full bg-dark-700 border border-white/10 text-white placeholder-white/20 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>
          </div>

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
                placeholder="Min. 6 characters"
                required
                minLength={6}
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
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus size={16} />
                Create Account
              </>
            )}
          </motion.button>
        </form>

        {/* ─── Footer Link ──────────────────────────────────────────────────── */}
        <p className="text-center text-white/40 text-sm mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary-500 hover:text-primary-400 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </motion.div>
  );
};

export default Register;
