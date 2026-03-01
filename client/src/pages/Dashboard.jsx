import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Receipt,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Plus,
} from "lucide-react";
import { fetchGroups } from "../api/groups";
import { fetchBalances, fetchExpenses } from "../api/expenses";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import usePageTitle from "../hooks/usePageTitle";
// page title will be set inside the component

// ─── Dashboard ─────────────────────────────────────────────────────────────────
// Overview of all groups, total spending, and personal balances
const Dashboard = () => {
  usePageTitle("Dashboard");
  const { user } = useAuth();
  const navigate = useNavigate();

  // ─── State ───────────────────────────────────────────────────────────────────
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalGroups: 0,
    totalExpenses: 0,
    totalOwed: 0, // Total you owe others
    totalToReceive: 0, // Total others owe you
  });

  // ─── Load Dashboard Data ──────────────────────────────────────────────────────
  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const groupsRes = await fetchGroups();
      const groupList = groupsRes.data;
      setGroups(groupList);

      // ─── Aggregate data across all groups ────────────────────────────────────
      let totalExpensesAmount = 0;
      let totalOwed = 0;
      let totalToReceive = 0;

      // Fetch balances and expenses for every group in parallel
      await Promise.all(
        groupList.map(async (group) => {
          try {
            const [balanceRes, expenseRes] = await Promise.all([
              fetchBalances(group._id),
              fetchExpenses(group._id),
            ]);

            // Add up all expenses across all groups
            expenseRes.data.forEach((e) => {
              totalExpensesAmount += e.amount;
            });

            // Find the current user's balance in this group
            const myBalance = balanceRes.data.find(
              (b) => b.user._id === user._id,
            );

            if (myBalance) {
              if (myBalance.net < 0) {
                totalOwed += Math.abs(myBalance.net); // You owe
              } else if (myBalance.net > 0) {
                totalToReceive += myBalance.net; // You are owed
              }
            }
          } catch {
            // If one group fails, continue with others
          }
        }),
      );

      setSummary({
        totalGroups: groupList.length,
        totalExpenses: totalExpensesAmount,
        totalOwed: parseFloat(totalOwed.toFixed(2)),
        totalToReceive: parseFloat(totalToReceive.toFixed(2)),
      });
    } catch (error) {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => `RM ${amount.toFixed(2)}`;

  // ─── Summary Cards config ─────────────────────────────────────────────────────
  const summaryCards = [
    {
      label: "Total Groups",
      value: summary.totalGroups,
      icon: Users,
      color: "text-primary-400",
      bg: "bg-primary-500/10",
      format: (v) => v,
    },
    {
      label: "Total Expenses",
      value: summary.totalExpenses,
      icon: Receipt,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      format: formatCurrency,
    },
    {
      label: "You Are Owed",
      value: summary.totalToReceive,
      icon: TrendingUp,
      color: "text-green-400",
      bg: "bg-green-500/10",
      format: formatCurrency,
    },
    {
      label: "You Owe",
      value: summary.totalOwed,
      icon: TrendingDown,
      color: "text-red-400",
      bg: "bg-red-500/10",
      format: formatCurrency,
    },
  ];

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* ─── Welcome Header ───────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold text-white">
            Hey, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Here's your expense overview
          </p>
        </motion.div>

        {/* ─── Summary Cards ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {summaryCards.map((card, index) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-dark-800 border border-white/10 rounded-2xl p-5"
            >
              <div
                className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center mb-3`}
              >
                <card.icon size={18} className={card.color} />
              </div>
              <p className="text-white/40 text-xs mb-1">{card.label}</p>

              {loading ? (
                <div className="h-7 bg-white/10 rounded animate-pulse w-20" />
              ) : (
                <p className={`text-xl font-display font-bold ${card.color}`}>
                  {card.format(card.value)}
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {/* ─── Groups Section ───────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-bold text-white">
              Your Groups
            </h2>
            <motion.button
              onClick={() => navigate("/groups")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 text-primary-400 hover:text-primary-300 text-sm transition-colors"
            >
              View all
              <ArrowRight size={14} />
            </motion.button>
          </div>

          {/* Loading skeletons */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-dark-800 border border-white/10 rounded-2xl p-6 animate-pulse"
                >
                  <div className="h-4 bg-white/10 rounded w-2/3 mb-3" />
                  <div className="h-3 bg-white/5 rounded w-full mb-6" />
                  <div className="h-3 bg-white/5 rounded w-1/3" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && groups.length === 0 && (
            <div className="text-center py-16 bg-dark-800 border border-white/10 rounded-2xl">
              <div className="w-14 h-14 bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users size={24} className="text-primary-400" />
              </div>
              <h3 className="text-white font-display font-bold text-lg mb-2">
                No groups yet
              </h3>
              <p className="text-white/40 text-sm mb-6">
                Create a group to start splitting expenses
              </p>
              <motion.button
                onClick={() => navigate("/groups")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm mx-auto"
              >
                <Plus size={16} />
                Create First Group
              </motion.button>
            </div>
          )}

          {/* Groups grid — show latest 6 only on dashboard */}
          {!loading && groups.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.slice(0, 6).map((group, index) => (
                <motion.div
                  key={group._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  onClick={() => navigate(`/groups/${group._id}`)}
                  className="bg-dark-800 border border-white/10 hover:border-primary-500/50 rounded-2xl p-6 cursor-pointer transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center">
                      <Users size={18} className="text-primary-400" />
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-white/20 group-hover:text-primary-400 transition-colors"
                    />
                  </div>

                  <h3 className="text-white font-display font-bold text-lg mb-1">
                    {group.name}
                  </h3>
                  <p className="text-white/40 text-sm mb-4 line-clamp-1">
                    {group.description || "No description"}
                  </p>
                  <p className="text-white/30 text-xs">
                    {group.members.length} member
                    {group.members.length !== 1 ? "s" : ""}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
