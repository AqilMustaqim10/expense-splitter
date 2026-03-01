import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home } from "lucide-react";
import usePageTitle from "../hooks/usePageTitle";

// ─── 404 Not Found Page ────────────────────────────────────────────────────────
const NotFound = () => {
  usePageTitle("Page Not Found");
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-dark-900 flex items-center justify-center text-center px-6"
    >
      <div>
        <h1 className="text-8xl font-display font-bold text-primary-500 mb-4">
          404
        </h1>
        <h2 className="text-2xl font-display font-bold text-white mb-3">
          Page not found
        </h2>
        <p className="text-white/40 mb-8">
          The page you're looking for doesn't exist
        </p>
        <motion.button
          onClick={() => navigate("/")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors mx-auto"
        >
          <Home size={16} />
          Back to Home
        </motion.button>
      </div>
    </motion.div>
  );
};

export default NotFound;
