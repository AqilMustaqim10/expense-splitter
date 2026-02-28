import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserPlus, UserMinus, ArrowLeft, X, Loader } from "lucide-react";
import { fetchGroup, addMember, removeMember } from "../api/groups";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";

// ─── Group Detail Page ─────────────────────────────────────────────────────────
// Shows a single group's details, members list
// Allows adding and removing members
const GroupDetail = () => {
  const { id } = useParams(); // Get group ID from URL
  const navigate = useNavigate();
  const { user } = useAuth();

  // ─── State ───────────────────────────────────────────────────────────────────
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);

  // ─── Fetch Group ─────────────────────────────────────────────────────────────
  useEffect(() => {
    loadGroup();
  }, [id]);

  const loadGroup = async () => {
    try {
      const res = await fetchGroup(id);
      setGroup(res.data);
    } catch (error) {
      toast.error("Failed to load group");
      navigate("/groups");
    } finally {
      setLoading(false);
    }
  };

  // ─── Add Member ───────────────────────────────────────────────────────────────
  const handleAddMember = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const res = await addMember(id, email);
      setGroup(res.data); // Update group with new member
      setShowAddModal(false);
      setEmail("");
      toast.success("Member added! 👋");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add member");
    } finally {
      setAdding(false);
    }
  };

  // ─── Remove Member ────────────────────────────────────────────────────────────
  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Remove this member from the group?")) return;
    try {
      const res = await removeMember(id, memberId);
      setGroup(res.data);
      toast.success("Member removed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove member");
    }
  };

  // ─── Check if current user is the creator ────────────────────────────────────
  const isCreator = group?.creator?._id === user?._id;

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

        {/* ─── Group Header ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-800 border border-white/10 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-white mb-2">
                {group?.name}
              </h1>
              <p className="text-white/40 text-sm">
                {group?.description || "No description"}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center">
              <Users size={22} className="text-primary-400" />
            </div>
          </div>
        </motion.div>

        {/* ─── Members Section ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dark-800 border border-white/10 rounded-2xl p-6"
        >
          {/* Members Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold text-white">
              Members ({group?.members?.length})
            </h2>

            {/* Only creator can add members */}
            {isCreator && (
              <motion.button
                onClick={() => setShowAddModal(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 px-3 py-1.5 rounded-lg transition-colors text-sm"
              >
                <UserPlus size={14} />
                Add Member
              </motion.button>
            )}
          </div>

          {/* Members List */}
          <div className="space-y-3">
            <AnimatePresence>
              {group?.members?.map((member, index) => (
                <motion.div
                  key={member._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between bg-dark-700 rounded-xl px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    {/* Member Avatar */}
                    <div className="w-9 h-9 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center">
                      <span className="text-primary-400 text-sm font-bold">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div>
                      <p className="text-white text-sm font-medium">
                        {member.name}
                        {/* Badge for creator */}
                        {member._id === group.creator._id && (
                          <span className="ml-2 text-xs bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded-full">
                            Creator
                          </span>
                        )}
                      </p>
                      <p className="text-white/40 text-xs">{member.email}</p>
                    </div>
                  </div>

                  {/* Remove button — only creator can remove, and cannot remove self */}
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
      </div>

      {/* ─── Add Member Modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
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
                    onClick={() => setShowAddModal(false)}
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                    disabled={adding}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-semibold rounded-xl py-3 flex items-center justify-center gap-2 transition-colors"
                  >
                    {adding ? (
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
