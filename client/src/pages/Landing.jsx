import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  SplitSquareHorizontal,
  Users,
  Receipt,
  TrendingUp,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

// ─── Landing Page ──────────────────────────────────────────────────────────────
// Public homepage shown to users who are not logged in
const Landing = () => {
  const navigate = useNavigate();

  // ─── Feature list ─────────────────────────────────────────────────────────────
  const features = [
    {
      icon: Users,
      title: "Group Management",
      desc: "Create groups for trips, housing, or events",
    },
    {
      icon: Receipt,
      title: "Expense Tracking",
      desc: "Add expenses with equal or custom splits",
    },
    {
      icon: TrendingUp,
      title: "Smart Settlements",
      desc: "Minimum transactions to settle all debts",
    },
  ];

  // ─── How it works steps ───────────────────────────────────────────────────────
  const steps = [
    {
      step: "01",
      title: "Create a Group",
      desc: "Add your friends or roommates to a group",
    },
    {
      step: "02",
      title: "Add Expenses",
      desc: "Log who paid and split it any way you like",
    },
    {
      step: "03",
      title: "Settle Up",
      desc: "See exactly who owes what with one tap",
    },
  ];

  return (
    <div className="min-h-screen bg-dark-900">
      {/* ─── Navbar ─────────────────────────────────────────────────────────────── */}
      <nav className="border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <SplitSquareHorizontal size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-white text-lg">
              SplitEase
            </span>
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => navigate("/login")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-white/60 hover:text-white px-4 py-2 rounded-xl transition-colors text-sm"
            >
              Sign In
            </motion.button>
            <motion.button
              onClick={() => navigate("/register")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-4 py-2 rounded-xl transition-colors text-sm"
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ───────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm px-4 py-1.5 rounded-full mb-6">
            <CheckCircle size={14} />
            Free to use · No ads
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight">
            Split expenses,{" "}
            <span className="text-primary-500">not friendships</span>
          </h1>

          <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Track shared expenses effortlessly. See who owes what, and settle up
            with the fewest transactions possible.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <motion.button
              onClick={() => navigate("/register")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors"
            >
              Start for free
              <ArrowRight size={16} />
            </motion.button>
            <motion.button
              onClick={() => navigate("/login")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-white/60 hover:text-white border border-white/10 hover:border-white/20 px-8 py-3.5 rounded-xl transition-all"
            >
              Sign in
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* ─── Features Section ───────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-display font-bold text-white mb-3">
            Everything you need
          </h2>
          <p className="text-white/40">
            Built for real-world group expense scenarios
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-dark-800 border border-white/10 rounded-2xl p-6"
            >
              <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center mb-4">
                <feature.icon size={22} className="text-primary-400" />
              </div>
              <h3 className="text-white font-display font-bold text-lg mb-2">
                {feature.title}
              </h3>
              <p className="text-white/40 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── How It Works Section ───────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-display font-bold text-white mb-3">
            How it works
          </h2>
          <p className="text-white/40">
            Three simple steps to stress-free splitting
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative bg-dark-800 border border-white/10 rounded-2xl p-6"
            >
              {/* Step number */}
              <span className="text-5xl font-display font-bold text-white/5 absolute top-4 right-4">
                {item.step}
              </span>
              <h3 className="text-white font-display font-bold text-lg mb-2">
                {item.title}
              </h3>
              <p className="text-white/40 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── CTA Banner ─────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-primary-500/10 border border-primary-500/20 rounded-3xl p-12 text-center"
        >
          <h2 className="text-3xl font-display font-bold text-white mb-3">
            Ready to split smarter?
          </h2>
          <p className="text-white/40 mb-8">
            Join and start tracking expenses with your group today
          </p>
          <motion.button
            onClick={() => navigate("/register")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors mx-auto"
          >
            Create free account
            <ArrowRight size={16} />
          </motion.button>
        </motion.div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/10 px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary-500 rounded-lg flex items-center justify-center">
              <SplitSquareHorizontal size={12} className="text-white" />
            </div>
            <span className="font-display font-bold text-white text-sm">
              SplitEase
            </span>
          </div>
          <p className="text-white/20 text-xs">
            Built with React + Node.js + MongoDB
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
