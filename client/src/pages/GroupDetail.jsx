import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  UserMinus,
  ArrowLeft,
  X,
  Loader,
  Plus,
  Trash2,
  Receipt,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { fetchGroup, addMember, removeMember } from "../api/groups";
import {
  fetchExpenses,
  addExpense,
  deleteExpense,
  fetchBalances,
} from "../api/expenses";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import { fetchSettlements } from "../api/expenses";
import { ArrowRight } from "lucide-react";
import usePageTitle from "../hooks/usePageTitle";
// page title will be set inside the component once `group` is available

// ─── Group Detail Page ─────────────────────────────────────────────────────────
// Shows group info, members, expenses list, and balances
const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // ─── State ───────────────────────────────────────────────────────────────────
  const [group, setGroup] = useState(null);
  // set page title based on loaded group name
  usePageTitle(group?.name || "Group");
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("expenses"); // expenses | members | balances

  // Modal states
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  // Add expense form state
  const [expenseForm, setExpenseForm] = useState({
    title: "",
    amount: "",
    paidBy: "",
    splitType: "equal",
    participants: [],
    customSplits: [],
  });
  const [submitting, setSubmitting] = useState(false);

  // Add member state
  const [memberEmail, setMemberEmail] = useState("");
  const [addingMember, setAddingMember] = useState(false);

  // Settlements state
  const [settlements, setSettlements] = useState([]);

  // ─── Load All Data ────────────────────────────────────────────────────────────
  useEffect(() => {
    loadAll();
  }, [id]);

  const loadAll = async () => {
    try {
      const [groupRes, expenseRes, balanceRes, settlementRes] =
        await Promise.all([
          fetchGroup(id),
          fetchExpenses(id),
          fetchBalances(id),
          fetchSettlements(id), // Add this
        ]);
      setGroup(groupRes.data);
      setExpenses(expenseRes.data);
      setBalances(balanceRes.data);
      setSettlements(settlementRes.data); // Add this

      setExpenseForm((prev) => ({
        ...prev,
        paidBy: user._id,
        participants: groupRes.data.members.map((m) => m._id),
      }));
    } catch (error) {
      toast.error("Failed to load group data");
      navigate("/groups");
    } finally {
      setLoading(false);
    }
  };

  // ─── Handle Add Expense ───────────────────────────────────────────────────────
  const handleAddExpense = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await addExpense(id, expenseForm);
      setExpenses([res.data, ...expenses]);

      // Refresh balances AND settlements
      const [balanceRes, settlementRes] = await Promise.all([
        fetchBalances(id),
        fetchSettlements(id),
      ]);
      setBalances(balanceRes.data);
      setSettlements(settlementRes.data);

      setShowAddExpense(false);
      resetExpenseForm();
      toast.success("Expense added! 💸");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add expense");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Handle Delete Expense ────────────────────────────────────────────────────
  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await deleteExpense(id, expenseId);
      setExpenses(expenses.filter((e) => e._id !== expenseId));

      // Refresh balances AND settlements
      const [balanceRes, settlementRes] = await Promise.all([
        fetchBalances(id),
        fetchSettlements(id),
      ]);
      setBalances(balanceRes.data);
      setSettlements(settlementRes.data);

      toast.success("Expense deleted");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete expense");
    }
  };

  // ─── Handle Add Member ────────────────────────────────────────────────────────
  const handleAddMember = async (e) => {
    e.preventDefault();
    setAddingMember(true);
    try {
      const res = await addMember(id, memberEmail);
      setGroup(res.data);
      setShowAddMember(false);
      setMemberEmail("");
      toast.success("Member added! 👋");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add member");
    } finally {
      setAddingMember(false);
    }
  };

  // ─── Handle Remove Member ─────────────────────────────────────────────────────
  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Remove this member?")) return;
    try {
      const res = await removeMember(id, memberId);
      setGroup(res.data);
      toast.success("Member removed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove member");
    }
  };

  // ─── Handle Participant Toggle ─────────────────────────────────────────────────
  // Toggle a member in/out of the expense participants list
  const toggleParticipant = (memberId) => {
    setExpenseForm((prev) => {
      const exists = prev.participants.includes(memberId);
      const updated = exists
        ? prev.participants.filter((p) => p !== memberId)
        : [...prev.participants, memberId];
      return { ...prev, participants: updated };
    });
  };

  // ─── Reset Expense Form ───────────────────────────────────────────────────────
  const resetExpenseForm = () => {
    setExpenseForm({
      title: "",
      amount: "",
      paidBy: user._id,
      splitType: "equal",
      participants: group?.members.map((m) => m._id) || [],
      customSplits: [],
    });
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────────
  const isCreator = group?.creator?._id === user?._id;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Format currency in MYR
  const formatCurrency = (amount) => `RM ${Math.abs(amount).toFixed(2)}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* ─── Back Button ──────────────────────────────────────────────────────── */}
        <motion.button
          onClick={() => navigate("/groups")}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-6 text-sm"
        >
          <ArrowLeft size={16} />
          Back to Groups
        </motion.button>

        {/* ─── Group Header Card ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-800 border border-white/10 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-white mb-1">
                {group?.name}
              </h1>
              <p className="text-white/40 text-sm mb-4">
                {group?.description || "No description"}
              </p>
              {/* Total expenses summary */}
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-white/40 text-xs">Total Expenses</p>
                  <p className="text-white font-bold text-xl">
                    {formatCurrency(totalExpenses)}
                  </p>
                </div>
                <div>
                  <p className="text-white/40 text-xs">Members</p>
                  <p className="text-white font-bold text-xl">
                    {group?.members?.length}
                  </p>
                </div>
                <div>
                  <p className="text-white/40 text-xs">Expenses</p>
                  <p className="text-white font-bold text-xl">
                    {expenses.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Add Expense Button */}
            <motion.button
              onClick={() => setShowAddExpense(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm"
            >
              <Plus size={16} />
              Add Expense
            </motion.button>
          </div>
        </motion.div>

        {/* ─── Tabs ─────────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-6 bg-dark-800 border border-white/10 rounded-xl p-1"
        >
          {["expenses", "balances", "settlements", "members"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                activeTab === tab
                  ? "bg-primary-500 text-white"
                  : "text-white/40 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </motion.div>

        {/* ─── Expenses Tab ─────────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {activeTab === "expenses" && (
            <motion.div
              key="expenses"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {expenses.length === 0 ? (
                // Empty state
                <div className="text-center py-16">
                  <div className="w-14 h-14 bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Receipt size={24} className="text-primary-400" />
                  </div>
                  <h3 className="text-white font-display font-bold text-lg mb-2">
                    No expenses yet
                  </h3>
                  <p className="text-white/40 text-sm mb-6">
                    Add your first expense to start tracking
                  </p>
                  <motion.button
                    onClick={() => setShowAddExpense(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
                  >
                    Add First Expense
                  </motion.button>
                </div>
              ) : (
                // Expenses list
                <div className="space-y-3">
                  <AnimatePresence>
                    {expenses.map((expense, index) => (
                      <motion.div
                        key={expense._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.04 }}
                        className="bg-dark-800 border border-white/10 rounded-2xl p-5 flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4">
                          {/* Expense Icon */}
                          <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center shrink-0">
                            <Receipt size={16} className="text-primary-400" />
                          </div>

                          <div>
                            <p className="text-white font-medium">
                              {expense.title}
                            </p>
                            <p className="text-white/40 text-xs mt-0.5">
                              Paid by{" "}
                              <span className="text-primary-400">
                                {expense.paidBy?.name}
                              </span>{" "}
                              · {expense.splitType} split ·{" "}
                              {expense.splits.length} people
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <p className="text-white font-bold text-lg">
                            {formatCurrency(expense.amount)}
                          </p>

                          {/* Delete button — only shown to expense creator */}
                          {expense.createdBy?._id === user?._id && (
                            <motion.button
                              onClick={() => handleDeleteExpense(expense._id)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={16} />
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}

          {/* ─── Balances Tab ────────────────────────────────────────────────────── */}
          {activeTab === "balances" && (
            <motion.div
              key="balances"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {balances.map((balance, index) => (
                <motion.div
                  key={balance.user._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-dark-800 border border-white/10 rounded-2xl p-5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center">
                        <span className="text-primary-400 text-sm font-bold">
                          {balance.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {balance.user.name}
                          {balance.user._id === user._id && (
                            <span className="ml-2 text-xs text-white/30">
                              (you)
                            </span>
                          )}
                        </p>
                        <p className="text-white/40 text-xs">
                          Paid {formatCurrency(balance.paid)} · Owes{" "}
                          {formatCurrency(balance.owed)}
                        </p>
                      </div>
                    </div>

                    {/* Net balance with color indicator */}
                    <div className="flex items-center gap-2">
                      {balance.net > 0 ? (
                        <TrendingUp size={16} className="text-green-400" />
                      ) : balance.net < 0 ? (
                        <TrendingDown size={16} className="text-red-400" />
                      ) : (
                        <Minus size={16} className="text-white/30" />
                      )}
                      <span
                        className={`font-bold text-lg ${
                          balance.net > 0
                            ? "text-green-400"
                            : balance.net < 0
                              ? "text-red-400"
                              : "text-white/30"
                        }`}
                      >
                        {balance.net > 0
                          ? `+${formatCurrency(balance.net)}`
                          : balance.net < 0
                            ? `-${formatCurrency(balance.net)}`
                            : "Settled"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ─── Settlements Tab ─────────────────────────────────────────────────────── */}
          {activeTab === "settlements" && (
            <motion.div
              key="settlements"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {settlements.length === 0 ? (
                // All settled state
                <div className="text-center py-16">
                  <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <TrendingUp size={24} className="text-green-400" />
                  </div>
                  <h3 className="text-white font-display font-bold text-lg mb-2">
                    All settled up! 🎉
                  </h3>
                  <p className="text-white/40 text-sm">
                    No outstanding debts in this group
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Info banner */}
                  <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl px-4 py-3 mb-4">
                    <p className="text-primary-400 text-sm">
                      💡 {settlements.length} transaction
                      {settlements.length !== 1 ? "s" : ""} needed to settle all
                      debts
                    </p>
                  </div>

                  {settlements.map((settlement, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-dark-800 border border-white/10 rounded-2xl p-5"
                    >
                      <div className="flex items-center justify-between">
                        {/* From (debtor) */}
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                            <span className="text-red-400 text-sm font-bold">
                              {settlement.from.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">
                              {settlement.from.name}
                              {settlement.from._id === user._id && (
                                <span className="text-white/30 ml-1">
                                  (you)
                                </span>
                              )}
                            </p>
                            <p className="text-red-400 text-xs">owes</p>
                          </div>
                        </div>

                        {/* Arrow + Amount */}
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-white font-bold">
                            {formatCurrency(settlement.amount)}
                          </span>
                          <ArrowRight size={16} className="text-white/30" />
                        </div>

                        {/* To (creditor) */}
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-white font-medium text-sm text-right">
                              {settlement.to.name}
                              {settlement.to._id === user._id && (
                                <span className="text-white/30 ml-1">
                                  (you)
                                </span>
                              )}
                            </p>
                            <p className="text-green-400 text-xs text-right">
                              receives
                            </p>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                            <span className="text-green-400 text-sm font-bold">
                              {settlement.to.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ─── Members Tab ─────────────────────────────────────────────────────── */}
          {activeTab === "members" && (
            <motion.div
              key="members"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Add Member Button — creator only */}
              {isCreator && (
                <div className="mb-4">
                  <motion.button
                    onClick={() => setShowAddMember(true)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 px-4 py-2.5 rounded-xl transition-colors text-sm"
                  >
                    <UserPlus size={16} />
                    Add Member
                  </motion.button>
                </div>
              )}

              <div className="space-y-3">
                <AnimatePresence>
                  {group?.members?.map((member, index) => (
                    <motion.div
                      key={member._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-dark-800 border border-white/10 rounded-2xl px-5 py-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center">
                          <span className="text-primary-400 text-sm font-bold">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {member.name}
                            {member._id === group.creator._id && (
                              <span className="ml-2 text-xs bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full">
                                Creator
                              </span>
                            )}
                          </p>
                          <p className="text-white/40 text-xs">
                            {member.email}
                          </p>
                        </div>
                      </div>

                      {isCreator && member._id !== group.creator._id && (
                        <motion.button
                          onClick={() => handleRemoveMember(member._id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="text-white/20 hover:text-red-400 transition-colors"
                        >
                          <UserMinus size={16} />
                        </motion.button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Add Expense Modal ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAddExpense && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddExpense(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-dark-800 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-display font-bold text-white">
                    Add Expense
                  </h2>
                  <button
                    onClick={() => setShowAddExpense(false)}
                    className="text-white/40 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleAddExpense} className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-white/70 text-sm mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={expenseForm.title}
                      onChange={(e) =>
                        setExpenseForm({
                          ...expenseForm,
                          title: e.target.value,
                        })
                      }
                      placeholder="e.g. Hotel booking"
                      required
                      className="w-full bg-dark-700 border border-white/10 text-white placeholder-white/20 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-primary-500 transition-colors"
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-white/70 text-sm mb-2">
                      Amount (RM)
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={expenseForm.amount}
                      onChange={(e) =>
                        setExpenseForm({
                          ...expenseForm,
                          amount: e.target.value,
                        })
                      }
                      placeholder="0.00"
                      required
                      className="w-full bg-dark-700 border border-white/10 text-white placeholder-white/20 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-primary-500 transition-colors"
                    />
                  </div>

                  {/* Paid By */}
                  <div>
                    <label className="block text-white/70 text-sm mb-2">
                      Paid By
                    </label>
                    <select
                      value={expenseForm.paidBy}
                      onChange={(e) =>
                        setExpenseForm({
                          ...expenseForm,
                          paidBy: e.target.value,
                        })
                      }
                      className="w-full bg-dark-700 border border-white/10 text-white rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-primary-500 transition-colors"
                    >
                      {group?.members?.map((member) => (
                        <option key={member._id} value={member._id}>
                          {member.name} {member._id === user._id ? "(you)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Split Type */}
                  <div>
                    <label className="block text-white/70 text-sm mb-2">
                      Split Type
                    </label>
                    <div className="flex gap-2">
                      {["equal", "custom"].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() =>
                            setExpenseForm({ ...expenseForm, splitType: type })
                          }
                          className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                            expenseForm.splitType === type
                              ? "bg-primary-500 text-white"
                              : "bg-dark-700 text-white/40 hover:text-white"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Participants */}
                  <div>
                    <label className="block text-white/70 text-sm mb-2">
                      Participants
                    </label>
                    <div className="space-y-2">
                      {group?.members?.map((member) => (
                        <label
                          key={member._id}
                          className="flex items-center justify-between bg-dark-700 rounded-xl px-4 py-2.5 cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={expenseForm.participants.includes(
                                member._id,
                              )}
                              onChange={() => toggleParticipant(member._id)}
                              className="accent-primary-500"
                            />
                            <span className="text-white text-sm">
                              {member.name}
                              {member._id === user._id && (
                                <span className="text-white/30 ml-1">
                                  (you)
                                </span>
                              )}
                            </span>
                          </div>

                          {/* Show per-person amount for equal split */}
                          {expenseForm.splitType === "equal" &&
                            expenseForm.participants.includes(member._id) &&
                            expenseForm.amount && (
                              <span className="text-white/40 text-xs">
                                RM
                                {(
                                  expenseForm.amount /
                                  expenseForm.participants.length
                                ).toFixed(2)}
                              </span>
                            )}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Custom Split Amounts */}
                  {expenseForm.splitType === "custom" && (
                    <div>
                      <label className="block text-white/70 text-sm mb-2">
                        Custom Amounts
                      </label>
                      <div className="space-y-2">
                        {expenseForm.participants.map((participantId) => {
                          const member = group?.members?.find(
                            (m) => m._id === participantId,
                          );
                          return (
                            <div
                              key={participantId}
                              className="flex items-center gap-3"
                            >
                              <span className="text-white/60 text-sm w-24 truncate">
                                {member?.name}
                              </span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                onChange={(e) => {
                                  const existing =
                                    expenseForm.customSplits.filter(
                                      (s) => s.userId !== participantId,
                                    );
                                  setExpenseForm({
                                    ...expenseForm,
                                    customSplits: [
                                      ...existing,
                                      {
                                        userId: participantId,
                                        amount: e.target.value,
                                      },
                                    ],
                                  });
                                }}
                                className="flex-1 bg-dark-700 border border-white/10 text-white placeholder-white/20 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-primary-500 transition-colors"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={
                      submitting || expenseForm.participants.length === 0
                    }
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition-colors"
                  >
                    {submitting ? (
                      <Loader size={16} className="animate-spin" />
                    ) : (
                      <>
                        <Plus size={16} />
                        Add Expense
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Add Member Modal ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAddMember && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddMember(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="bg-dark-800 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-display font-bold text-white">
                    Add Member
                  </h2>
                  <button
                    onClick={() => setShowAddMember(false)}
                    className="text-white/40 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleAddMember} className="space-y-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">
                      Member's Email
                    </label>
                    <input
                      type="email"
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      placeholder="friend@example.com"
                      required
                      className="w-full bg-dark-700 border border-white/10 text-white placeholder-white/20 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-primary-500 transition-colors"
                    />
                    <p className="text-white/30 text-xs mt-2">
                      The person must already have an account
                    </p>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={addingMember}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition-colors"
                  >
                    {addingMember ? (
                      <Loader size={16} className="animate-spin" />
                    ) : (
                      <>
                        <UserPlus size={16} />
                        Add Member
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GroupDetail;
